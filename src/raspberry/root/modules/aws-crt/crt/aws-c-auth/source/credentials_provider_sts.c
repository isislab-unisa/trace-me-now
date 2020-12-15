/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
#include <aws/auth/credentials.h>
#include <aws/auth/private/credentials_utils.h>
#include <aws/auth/signable.h>
#include <aws/auth/signing.h>
#include <aws/auth/signing_config.h>
#include <aws/auth/signing_result.h>
#include <aws/common/xml_parser.h>

#include <aws/common/clock.h>
#include <aws/common/string.h>

#include <aws/http/connection.h>
#include <aws/http/connection_manager.h>
#include <aws/http/request_response.h>
#include <aws/http/status_code.h>

#include <aws/io/channel_bootstrap.h>
#include <aws/io/retry_strategy.h>
#include <aws/io/socket.h>
#include <aws/io/stream.h>
#include <aws/io/tls_channel_handler.h>
#include <aws/io/uri.h>

#include <inttypes.h>

#ifdef _MSC_VER
/* allow non-constant declared initializers. */
#    pragma warning(disable : 4204)
/* allow passing of address of automatic variable */
#    pragma warning(disable : 4221)
/* function pointer to dll symbol */
#    pragma warning(disable : 4232)
#endif

static struct aws_http_header s_host_header = {
    .name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("host"),
    .value = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("sts.amazonaws.com"),
};

static struct aws_http_header s_content_type_header = {
    .name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("content-type"),
    .value = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("application/x-www-form-urlencoded"),
};

static struct aws_http_header s_api_version_header = {
    .name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("x-amz-api-version"),
    .value = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("2011-06-15"),
};

static struct aws_byte_cursor s_content_length = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("content-length");
static struct aws_byte_cursor s_path = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("/");
static struct aws_byte_cursor s_signing_region = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("us-east-1");
static struct aws_byte_cursor s_service_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("sts");
static struct aws_byte_cursor s_assume_role_root_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("AssumeRoleResponse");
static struct aws_byte_cursor s_assume_role_result_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("AssumeRoleResult");
static struct aws_byte_cursor s_assume_role_credentials_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("Credentials");
static struct aws_byte_cursor s_assume_role_session_token_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("SessionToken");
static struct aws_byte_cursor s_assume_role_secret_key_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("SecretAccessKey");
static struct aws_byte_cursor s_assume_role_access_key_id_name = AWS_BYTE_CUR_INIT_FROM_STRING_LITERAL("AccessKeyId");
static const int s_max_retries = 8;

const uint16_t aws_sts_assume_role_default_duration_secs = 900;

static struct aws_auth_http_system_vtable s_default_function_table = {
    .aws_http_connection_manager_new = aws_http_connection_manager_new,
    .aws_http_connection_manager_release = aws_http_connection_manager_release,
    .aws_http_connection_manager_acquire_connection = aws_http_connection_manager_acquire_connection,
    .aws_http_connection_manager_release_connection = aws_http_connection_manager_release_connection,
    .aws_http_connection_make_request = aws_http_connection_make_request,
    .aws_http_stream_activate = aws_http_stream_activate,
    .aws_http_stream_get_incoming_response_status = aws_http_stream_get_incoming_response_status,
    .aws_http_stream_release = aws_http_stream_release,
    .aws_http_connection_close = aws_http_connection_close,
};

struct aws_credentials_provider_sts_impl {
    struct aws_http_connection_manager *connection_manager;
    struct aws_string *assume_role_profile;
    struct aws_string *role_session_name;
    uint16_t duration_seconds;
    struct aws_credentials_provider *provider;
    struct aws_tls_ctx *ctx;
    struct aws_tls_connection_options connection_options;
    struct aws_credentials_provider_shutdown_options source_shutdown_options;
    struct aws_auth_http_system_vtable *function_table;
    struct aws_retry_strategy *retry_strategy;
    aws_io_clock_fn *system_clock_fn;
};

struct sts_creds_provider_user_data {
    struct aws_allocator *allocator;
    struct aws_credentials_provider *provider;
    struct aws_credentials *credentials;
    struct aws_string *access_key_id;
    struct aws_string *secret_access_key;
    struct aws_string *session_token;
    aws_on_get_credentials_callback_fn *callback;
    struct aws_http_connection *connection;
    struct aws_byte_buf payload_body;
    struct aws_input_stream *input_stream;
    struct aws_signable *signable;
    struct aws_signing_config_aws signing_config;
    struct aws_http_message *message;
    struct aws_byte_buf output_buf;

    struct aws_retry_token *retry_token;
    int error_code;
    void *user_data;
};

static void s_reset_request_specific_data(struct sts_creds_provider_user_data *user_data) {
    if (user_data->connection) {
        struct aws_credentials_provider_sts_impl *provider_impl = user_data->provider->impl;
        provider_impl->function_table->aws_http_connection_manager_release_connection(
            provider_impl->connection_manager, user_data->connection);
        user_data->connection = NULL;
    }

    if (user_data->signable) {
        aws_signable_destroy(user_data->signable);
        user_data->signable = NULL;
    }

    if (user_data->input_stream) {
        aws_input_stream_destroy(user_data->input_stream);
        user_data->input_stream = NULL;
    }

    aws_byte_buf_clean_up(&user_data->payload_body);

    if (user_data->message) {
        aws_http_message_destroy(user_data->message);
        user_data->message = NULL;
    }

    aws_byte_buf_clean_up(&user_data->output_buf);

    aws_string_destroy(user_data->access_key_id);
    user_data->access_key_id = NULL;

    aws_string_destroy_secure(user_data->secret_access_key);
    user_data->secret_access_key = NULL;

    aws_string_destroy(user_data->session_token);
    user_data->session_token = NULL;
}
static void s_clean_up_user_data(struct sts_creds_provider_user_data *user_data) {
    user_data->callback(user_data->credentials, user_data->error_code, user_data->user_data);

    aws_credentials_release(user_data->credentials);

    s_reset_request_specific_data(user_data);
    aws_credentials_provider_release(user_data->provider);

    aws_retry_strategy_release_retry_token(user_data->retry_token);
    aws_mem_release(user_data->allocator, user_data);
}

static int s_write_body_to_buffer(struct aws_credentials_provider *provider, struct aws_byte_buf *body) {
    struct aws_credentials_provider_sts_impl *provider_impl = provider->impl;

    struct aws_byte_cursor working_cur = aws_byte_cursor_from_c_str("Version=2011-06-15&Action=AssumeRole&RoleArn=");
    if (aws_byte_buf_append_dynamic(body, &working_cur)) {
        return AWS_OP_ERR;
    }
    struct aws_byte_cursor role_cur = aws_byte_cursor_from_string(provider_impl->assume_role_profile);
    if (aws_byte_buf_append_encoding_uri_param(body, &role_cur)) {
        return AWS_OP_ERR;
    }
    working_cur = aws_byte_cursor_from_c_str("&RoleSessionName=");
    if (aws_byte_buf_append_dynamic(body, &working_cur)) {
        return AWS_OP_ERR;
    }

    struct aws_byte_cursor session_cur = aws_byte_cursor_from_string(provider_impl->role_session_name);
    if (aws_byte_buf_append_encoding_uri_param(body, &session_cur)) {
        return AWS_OP_ERR;
    }

    working_cur = aws_byte_cursor_from_c_str("&DurationSeconds=");
    if (aws_byte_buf_append_dynamic(body, &working_cur)) {
        return AWS_OP_ERR;
    }

    char duration_seconds[6];
    AWS_ZERO_ARRAY(duration_seconds);
    snprintf(duration_seconds, sizeof(duration_seconds), "%" PRIu16, provider_impl->duration_seconds);
    working_cur = aws_byte_cursor_from_c_str(duration_seconds);
    if (aws_byte_buf_append_dynamic(body, &working_cur)) {
        return AWS_OP_ERR;
    }

    return AWS_OP_SUCCESS;
}

static int s_on_incoming_body_fn(struct aws_http_stream *stream, const struct aws_byte_cursor *data, void *user_data) {
    (void)stream;

    struct sts_creds_provider_user_data *provider_user_data = user_data;
    return aws_byte_buf_append_dynamic(&provider_user_data->output_buf, data);
}

/* parse doc of form
<AssumeRoleResponse>
     <AssumeRoleResult>
          <Credentials>
             <AccessKeyId>accessKeyId</AccessKeyId>
             <SecretKey>secretKey</SecretKey>
             <SessionToken>sessionToken</SessionToken>
          </Credentials>
         <AssumedRoleUser>
             ... more stuff we don't care about.
         </AssumedRoleUser>
         ... more stuff we don't care about
      </AssumeRoleResult>
</AssumeRoleResponse>
 */
static bool s_on_node_encountered_fn(struct aws_xml_parser *parser, struct aws_xml_node *node, void *user_data) {

    struct aws_byte_cursor node_name;
    AWS_ZERO_STRUCT(node_name);

    if (aws_xml_node_get_name(node, &node_name)) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): While parsing credentials xml response for sts credentials provider, could not get xml node name "
            "for function s_on_node_encountered_fn.",
            user_data);
        return false;
    }

    if (aws_byte_cursor_eq_ignore_case(&node_name, &s_assume_role_root_name) ||
        aws_byte_cursor_eq_ignore_case(&node_name, &s_assume_role_result_name) ||
        aws_byte_cursor_eq_ignore_case(&node_name, &s_assume_role_credentials_name)) {
        return aws_xml_node_traverse(parser, node, s_on_node_encountered_fn, user_data);
    }

    struct sts_creds_provider_user_data *provider_user_data = user_data;
    struct aws_byte_cursor credential_data;
    AWS_ZERO_STRUCT(credential_data);
    if (aws_byte_cursor_eq_ignore_case(&node_name, &s_assume_role_access_key_id_name)) {
        aws_xml_node_as_body(parser, node, &credential_data);
        provider_user_data->access_key_id =
            aws_string_new_from_array(provider_user_data->allocator, credential_data.ptr, credential_data.len);

        if (provider_user_data->access_key_id) {
            AWS_LOGF_DEBUG(
                AWS_LS_AUTH_CREDENTIALS_PROVIDER,
                "(id=%p): Read AccessKeyId %s",
                (void *)provider_user_data->provider,
                aws_string_c_str(provider_user_data->access_key_id));
        }
    }

    if (aws_byte_cursor_eq_ignore_case(&node_name, &s_assume_role_secret_key_name)) {
        aws_xml_node_as_body(parser, node, &credential_data);
        provider_user_data->secret_access_key =
            aws_string_new_from_array(provider_user_data->allocator, credential_data.ptr, credential_data.len);
    }

    if (aws_byte_cursor_eq_ignore_case(&node_name, &s_assume_role_session_token_name)) {
        aws_xml_node_as_body(parser, node, &credential_data);
        provider_user_data->session_token =
            aws_string_new_from_array(provider_user_data->allocator, credential_data.ptr, credential_data.len);
    }

    return true;
}

/* errors that mean something screwy was going on at the networking layer. */
static inline bool s_is_transient_error(int error_code) {
    return error_code == AWS_ERROR_HTTP_CONNECTION_CLOSED || error_code == AWS_ERROR_HTTP_SERVER_CLOSED ||
           error_code == AWS_IO_SOCKET_CLOSED || error_code == AWS_IO_SOCKET_CONNECT_ABORTED ||
           error_code == AWS_IO_SOCKET_CONNECTION_REFUSED || error_code == AWS_IO_SOCKET_NETWORK_DOWN ||
           error_code == AWS_IO_DNS_QUERY_FAILED || error_code == AWS_IO_DNS_NO_ADDRESS_FOR_HOST ||
           error_code == AWS_IO_SOCKET_TIMEOUT || error_code == AWS_IO_TLS_NEGOTIATION_TIMEOUT ||
           error_code == AWS_HTTP_STATUS_CODE_408_REQUEST_TIMEOUT;
}

static void s_start_make_request(
    struct aws_credentials_provider *provider,
    struct sts_creds_provider_user_data *provider_user_data);

static void s_on_retry_ready(struct aws_retry_token *token, int error_code, void *user_data) {
    (void)token;
    struct sts_creds_provider_user_data *provider_user_data = user_data;

    if (!error_code) {
        s_start_make_request(provider_user_data->provider, provider_user_data);
    } else {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): retry task failed: %s",
            (void *)provider_user_data->provider,
            aws_error_str(aws_last_error()));
        s_clean_up_user_data(provider_user_data);
    }
}

/* called upon completion of http request */
static void s_on_stream_complete_fn(struct aws_http_stream *stream, int error_code, void *user_data) {
    int http_response_code = 0;
    struct sts_creds_provider_user_data *provider_user_data = user_data;
    struct aws_credentials_provider_sts_impl *provider_impl = provider_user_data->provider->impl;
    struct aws_xml_parser *xml_parser = NULL;

    provider_user_data->error_code = error_code;

    if (provider_impl->function_table->aws_http_stream_get_incoming_response_status(stream, &http_response_code)) {
        goto finish;
    }

    if (http_response_code != 200) {
        provider_user_data->error_code = AWS_AUTH_CREDENTIALS_PROVIDER_HTTP_STATUS_FAILURE;
    }

    provider_impl->function_table->aws_http_stream_release(stream);

    AWS_LOGF_DEBUG(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): AssumeRole call completed with http status %d",
        (void *)provider_user_data->provider,
        http_response_code);

    if (error_code || http_response_code != AWS_HTTP_STATUS_CODE_200_OK) {
        /* prevent connection reuse. */
        provider_impl->function_table->aws_http_connection_close(provider_user_data->connection);

        enum aws_retry_error_type error_type = http_response_code >= 400 && http_response_code < 500
                                                   ? AWS_RETRY_ERROR_TYPE_CLIENT_ERROR
                                                   : AWS_RETRY_ERROR_TYPE_SERVER_ERROR;

        if (s_is_transient_error(error_code)) {
            error_type = AWS_RETRY_ERROR_TYPE_TRANSIENT;
        }

        /* server throttling us is retryable */
        if (http_response_code == AWS_HTTP_STATUS_CODE_429_TOO_MANY_REQUESTS) {
            /* force a new connection on this. */
            error_type = AWS_RETRY_ERROR_TYPE_THROTTLING;
        }

        s_reset_request_specific_data(provider_user_data);

        /* don't retry client errors at all. */
        if (error_type != AWS_RETRY_ERROR_TYPE_CLIENT_ERROR) {
            if (aws_retry_strategy_schedule_retry(
                    provider_user_data->retry_token, error_type, s_on_retry_ready, provider_user_data)) {
                AWS_LOGF_ERROR(
                    AWS_LS_AUTH_CREDENTIALS_PROVIDER,
                    "(id=%p): failed to schedule retry: %s",
                    (void *)provider_user_data->provider,
                    aws_error_str(aws_last_error()));
                goto finish;
            }
            return;
        }
    }

    if (!error_code && http_response_code == AWS_HTTP_STATUS_CODE_200_OK) {
        /* update the book keeping so we can let the retry strategy make determinations about when the service is
         * healthy after an outage. */
        if (aws_retry_strategy_token_record_success(provider_user_data->retry_token)) {
            AWS_LOGF_ERROR(
                AWS_LS_AUTH_CREDENTIALS_PROVIDER,
                "(id=%p): failed to register operation success: %s",
                (void *)provider_user_data->provider,
                aws_error_str(aws_last_error()));
            goto finish;
        }

        struct aws_xml_parser_options options;
        AWS_ZERO_STRUCT(options);
        options.doc = aws_byte_cursor_from_buf(&provider_user_data->output_buf);

        xml_parser = aws_xml_parser_new(provider_user_data->provider->allocator, &options);

        if (xml_parser == NULL) {
            goto finish;
        }

        uint64_t now = UINT64_MAX;
        if (provider_impl->system_clock_fn(&now) != AWS_OP_SUCCESS) {
            goto finish;
        }

        uint64_t now_seconds = aws_timestamp_convert(now, AWS_TIMESTAMP_NANOS, AWS_TIMESTAMP_SECS, NULL);

        if (aws_xml_parser_parse(xml_parser, s_on_node_encountered_fn, provider_user_data)) {
            provider_user_data->error_code = aws_last_error();
            AWS_LOGF_ERROR(
                AWS_LS_AUTH_CREDENTIALS_PROVIDER,
                "(id=%p): credentials parsing failed with error %s",
                (void *)provider_user_data->credentials,
                aws_error_debug_str(provider_user_data->error_code));
            goto finish;
        }

        if (provider_user_data->access_key_id && provider_user_data->secret_access_key &&
            provider_user_data->session_token) {

            provider_user_data->credentials = aws_credentials_new_from_string(
                provider_user_data->allocator,
                provider_user_data->access_key_id,
                provider_user_data->secret_access_key,
                provider_user_data->session_token,
                now_seconds + provider_impl->duration_seconds);
        } else {
            AWS_LOGF_ERROR(
                AWS_LS_AUTH_CREDENTIALS_PROVIDER,
                "(id=%p): credentials document was corrupted, treating as an error.",
                (void *)provider_user_data->provider);
        }
    }

finish:

    if (xml_parser != NULL) {
        aws_xml_parser_destroy(xml_parser);
        xml_parser = NULL;
    }

    s_clean_up_user_data(provider_user_data);
}

/* called upon acquiring a connection from the pool */
static void s_on_connection_setup_fn(struct aws_http_connection *connection, int error_code, void *user_data) {
    struct sts_creds_provider_user_data *provider_user_data = user_data;
    struct aws_credentials_provider_sts_impl *provider_impl = provider_user_data->provider->impl;
    struct aws_http_stream *stream = NULL;

    AWS_LOGF_DEBUG(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): connection returned with error code %d",
        (void *)provider_user_data->provider,
        error_code);

    if (error_code) {
        aws_raise_error(error_code);
        goto error;
    }
    provider_user_data->connection = connection;

    if (aws_byte_buf_init(&provider_user_data->output_buf, provider_impl->provider->allocator, 2048)) {
        goto error;
    }

    struct aws_http_make_request_options options = {
        .user_data = user_data,
        .request = provider_user_data->message,
        .self_size = sizeof(struct aws_http_make_request_options),
        .on_response_headers = NULL,
        .on_response_header_block_done = NULL,
        .on_response_body = s_on_incoming_body_fn,
        .on_complete = s_on_stream_complete_fn,
    };

    stream = provider_impl->function_table->aws_http_connection_make_request(connection, &options);

    if (!stream) {
        goto error;
    }

    if (provider_impl->function_table->aws_http_stream_activate(stream)) {
        goto error;
    }

    return;
error:
    provider_impl->function_table->aws_http_stream_release(stream);
    s_clean_up_user_data(provider_user_data);
}

/* called once sigv4 signing is complete. */
void s_on_signing_complete(struct aws_signing_result *result, int error_code, void *userdata) {
    struct sts_creds_provider_user_data *provider_user_data = userdata;
    struct aws_credentials_provider_sts_impl *sts_impl = provider_user_data->provider->impl;

    AWS_LOGF_DEBUG(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): signing completed with error code %d",
        (void *)provider_user_data->provider,
        error_code);

    if (error_code) {
        aws_raise_error(error_code);
        goto error;
    }

    if (aws_apply_signing_result_to_http_request(
            provider_user_data->message, provider_user_data->provider->allocator, result)) {
        goto error;
    }

    sts_impl->function_table->aws_http_connection_manager_acquire_connection(
        sts_impl->connection_manager, s_on_connection_setup_fn, provider_user_data);
    return;

error:
    s_clean_up_user_data(provider_user_data);
}

static void s_start_make_request(
    struct aws_credentials_provider *provider,
    struct sts_creds_provider_user_data *provider_user_data) {
    provider_user_data->message = aws_http_message_new_request(provider->allocator);

    if (!provider_user_data->message) {
        goto error;
    }

    if (aws_http_message_add_header(provider_user_data->message, s_host_header)) {
        goto error;
    }

    if (aws_http_message_add_header(provider_user_data->message, s_content_type_header)) {
        goto error;
    }

    if (aws_http_message_add_header(provider_user_data->message, s_api_version_header)) {
        goto error;
    }

    if (aws_byte_buf_init(&provider_user_data->payload_body, provider->allocator, 256)) {
        goto error;
    }

    if (s_write_body_to_buffer(provider, &provider_user_data->payload_body)) {
        goto error;
    }

    char content_length[21];
    AWS_ZERO_ARRAY(content_length);
    snprintf(content_length, sizeof(content_length), "%" PRIu64, (uint64_t)provider_user_data->payload_body.len);

    struct aws_http_header content_len_header = {
        .name = s_content_length,
        .value = aws_byte_cursor_from_c_str(content_length),
    };

    if (aws_http_message_add_header(provider_user_data->message, content_len_header)) {
        goto error;
    }

    struct aws_byte_cursor payload_cur = aws_byte_cursor_from_buf(&provider_user_data->payload_body);
    provider_user_data->input_stream =
        aws_input_stream_new_from_cursor(provider_user_data->provider->allocator, &payload_cur);

    if (!provider_user_data->input_stream) {
        goto error;
    }

    aws_http_message_set_body_stream(provider_user_data->message, provider_user_data->input_stream);

    if (aws_http_message_set_request_method(provider_user_data->message, aws_http_method_post)) {
        goto error;
    }

    if (aws_http_message_set_request_path(provider_user_data->message, s_path)) {
        goto error;
    }

    provider_user_data->signable = aws_signable_new_http_request(provider->allocator, provider_user_data->message);

    if (!provider_user_data->signable) {
        goto error;
    }

    struct aws_credentials_provider_sts_impl *impl = provider->impl;

    provider_user_data->signing_config.algorithm = AWS_SIGNING_ALGORITHM_V4;
    provider_user_data->signing_config.signature_type = AWS_ST_HTTP_REQUEST_HEADERS;
    provider_user_data->signing_config.signed_body_header = AWS_SBHT_NONE;
    provider_user_data->signing_config.config_type = AWS_SIGNING_CONFIG_AWS;
    provider_user_data->signing_config.credentials_provider = impl->provider;
    aws_date_time_init_now(&provider_user_data->signing_config.date);
    provider_user_data->signing_config.region = s_signing_region;
    provider_user_data->signing_config.service = s_service_name;
    provider_user_data->signing_config.flags.use_double_uri_encode = false;

    if (aws_sign_request_aws(
            provider->allocator,
            provider_user_data->signable,
            (struct aws_signing_config_base *)&provider_user_data->signing_config,
            s_on_signing_complete,
            provider_user_data)) {
        goto error;
    }

    return;

error:
    AWS_LOGF_ERROR(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): error occurred while creating an http request for signing: %s",
        (void *)provider_user_data->provider,
        aws_error_debug_str(aws_last_error()));
    if (provider_user_data) {
        s_clean_up_user_data(provider_user_data);
    } else {
        provider_user_data->callback(NULL, provider_user_data->error_code, provider_user_data->user_data);
    }
}

static void s_on_retry_token_acquired(
    struct aws_retry_strategy *strategy,
    int error_code,
    struct aws_retry_token *token,
    void *user_data) {
    (void)strategy;
    struct sts_creds_provider_user_data *provider_user_data = user_data;

    if (!error_code) {
        provider_user_data->retry_token = token;
        s_start_make_request(provider_user_data->provider, provider_user_data);
    } else {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): failed to acquire retry token: %s",
            (void *)provider_user_data->provider,
            aws_error_debug_str(error_code));
        s_clean_up_user_data(provider_user_data);
    }
}

static int s_sts_get_creds(
    struct aws_credentials_provider *provider,
    aws_on_get_credentials_callback_fn callback,
    void *user_data) {

    struct aws_credentials_provider_sts_impl *impl = provider->impl;

    AWS_LOGF_DEBUG(AWS_LS_AUTH_CREDENTIALS_PROVIDER, "(id=%p): fetching credentials", (void *)provider);

    struct sts_creds_provider_user_data *provider_user_data =
        aws_mem_calloc(provider->allocator, 1, sizeof(struct sts_creds_provider_user_data));

    if (!provider_user_data) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): error occurred while allocating memory: %s",
            (void *)provider,
            aws_error_debug_str(aws_last_error()));
        callback(NULL, aws_last_error(), user_data);
        return AWS_OP_ERR;
    }

    provider_user_data->allocator = provider->allocator;
    provider_user_data->provider = provider;
    aws_credentials_provider_acquire(provider);
    provider_user_data->callback = callback;
    provider_user_data->user_data = user_data;

    if (aws_retry_strategy_acquire_retry_token(
            impl->retry_strategy, NULL, s_on_retry_token_acquired, provider_user_data, 100)) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): failed to acquire retry token: %s",
            (void *)provider_user_data->provider,
            aws_error_debug_str(aws_last_error()));
        callback(NULL, aws_last_error(), user_data);
        s_clean_up_user_data(user_data);
        return AWS_OP_ERR;
    }

    return AWS_OP_SUCCESS;
}

static void s_on_credentials_provider_shutdown(void *user_data) {
    struct aws_credentials_provider *provider = user_data;
    if (provider == NULL) {
        return;
    }

    struct aws_credentials_provider_sts_impl *impl = provider->impl;
    if (impl == NULL) {
        return;
    }

    /* The wrapped provider has shut down, invoke its shutdown callback if there was one */
    if (impl->source_shutdown_options.shutdown_callback != NULL) {
        impl->source_shutdown_options.shutdown_callback(impl->source_shutdown_options.shutdown_user_data);
    }

    /* Invoke our own shutdown callback */
    aws_credentials_provider_invoke_shutdown_callback(provider);

    aws_string_destroy(impl->role_session_name);
    aws_string_destroy(impl->assume_role_profile);

    aws_tls_ctx_release(impl->ctx);

    aws_tls_connection_options_clean_up(&impl->connection_options);
    aws_mem_release(provider->allocator, provider);
}

void s_destroy(struct aws_credentials_provider *provider) {
    AWS_LOGF_TRACE(AWS_LS_AUTH_CREDENTIALS_PROVIDER, "(id=%p): cleaning up credentials provider", (void *)provider);

    struct aws_credentials_provider_sts_impl *sts_impl = provider->impl;

    if (sts_impl->connection_manager) {
        sts_impl->function_table->aws_http_connection_manager_release(sts_impl->connection_manager);
    }

    aws_retry_strategy_release(sts_impl->retry_strategy);
    aws_credentials_provider_release(sts_impl->provider);
}

static struct aws_credentials_provider_vtable s_aws_credentials_provider_sts_vtable = {
    .get_credentials = s_sts_get_creds,
    .destroy = s_destroy,
};

struct aws_credentials_provider *aws_credentials_provider_new_sts(
    struct aws_allocator *allocator,
    struct aws_credentials_provider_sts_options *options) {
    struct aws_credentials_provider *provider = NULL;
    struct aws_credentials_provider_sts_impl *impl = NULL;

    aws_mem_acquire_many(
        allocator,
        2,
        &provider,
        sizeof(struct aws_credentials_provider),
        &impl,
        sizeof(struct aws_credentials_provider_sts_impl));

    AWS_LOGF_DEBUG(AWS_LS_AUTH_CREDENTIALS_PROVIDER, "static: creating STS credentials provider");
    if (!provider) {
        return NULL;
    }

    AWS_ZERO_STRUCT(*provider);
    AWS_ZERO_STRUCT(*impl);

    aws_credentials_provider_init_base(provider, allocator, &s_aws_credentials_provider_sts_vtable, impl);

    impl->function_table = &s_default_function_table;

    if (options->function_table) {
        impl->function_table = options->function_table;
    }

    if (options->tls_ctx) {
        AWS_LOGF_TRACE(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): tls context provided, using pre-built tls context.",
            (void *)provider);
        impl->ctx = aws_tls_ctx_acquire(options->tls_ctx);
    } else {
        AWS_LOGF_TRACE(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): tls context not provided, initializing a new one",
            (void *)provider);
        struct aws_tls_ctx_options tls_options;
        aws_tls_ctx_options_init_default_client(&tls_options, allocator);
        impl->ctx = aws_tls_client_ctx_new(allocator, &tls_options);

        if (!impl->ctx) {
            AWS_LOGF_ERROR(
                AWS_LS_AUTH_CREDENTIALS_PROVIDER,
                "(id=%p): failed to create a tls context with error %s",
                (void *)provider,
                aws_error_debug_str(aws_last_error()));
            aws_tls_ctx_options_clean_up(&tls_options);
            goto cleanup_provider;
        }
    }

    if (!options->creds_provider) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER, "(id=%p): A credentials provider must be specified", (void *)provider);
        aws_raise_error(AWS_ERROR_INVALID_ARGUMENT);
        goto cleanup_provider;
    }

    impl->role_session_name =
        aws_string_new_from_array(allocator, options->session_name.ptr, options->session_name.len);

    if (!impl->role_session_name) {
        goto cleanup_provider;
    }

    AWS_LOGF_DEBUG(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): using session_name %s",
        (void *)provider,
        aws_string_c_str(impl->role_session_name));

    impl->assume_role_profile = aws_string_new_from_array(allocator, options->role_arn.ptr, options->role_arn.len);

    if (!impl->assume_role_profile) {
        goto cleanup_provider;
    }

    AWS_LOGF_DEBUG(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): using assume_role_arn %s",
        (void *)provider,
        aws_string_c_str(impl->assume_role_profile));

    impl->duration_seconds = options->duration_seconds;

    if (options->system_clock_fn != NULL) {
        impl->system_clock_fn = options->system_clock_fn;
    } else {
        impl->system_clock_fn = aws_sys_clock_get_ticks;
    }

    /* minimum for STS is 900 seconds*/
    if (impl->duration_seconds < aws_sts_assume_role_default_duration_secs) {
        impl->duration_seconds = aws_sts_assume_role_default_duration_secs;
    }

    AWS_LOGF_DEBUG(
        AWS_LS_AUTH_CREDENTIALS_PROVIDER,
        "(id=%p): using credentials duration %" PRIu16,
        (void *)provider,
        impl->duration_seconds);

    impl->provider = options->creds_provider;
    aws_credentials_provider_acquire(impl->provider);

    aws_tls_connection_options_init_from_ctx(&impl->connection_options, impl->ctx);

    if (aws_tls_connection_options_set_server_name(&impl->connection_options, allocator, &s_host_header.value)) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): failed to create a tls connection options with error %s",
            (void *)provider,
            aws_error_debug_str(aws_last_error()));
        goto cleanup_provider;
    }

    struct aws_socket_options socket_options = {
        .type = AWS_SOCKET_STREAM,
        .domain = AWS_SOCKET_IPV6,
        .connect_timeout_ms = 3000,
    };

    struct aws_http_connection_manager_options connection_manager_options = {
        .bootstrap = options->bootstrap,
        .host = s_host_header.value,
        .initial_window_size = SIZE_MAX,
        .max_connections = 2,
        .port = 443,
        .socket_options = &socket_options,
        .tls_connection_options = &impl->connection_options,
    };

    impl->connection_manager =
        impl->function_table->aws_http_connection_manager_new(allocator, &connection_manager_options);

    if (!impl->connection_manager) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): failed to create a connection manager with error %s",
            (void *)provider,
            aws_error_debug_str(aws_last_error()));
        goto cleanup_provider;
    }

    /*
     * Save the wrapped provider's shutdown callback and then swap it with our own.
     */
    impl->source_shutdown_options = impl->provider->shutdown_options;
    impl->provider->shutdown_options.shutdown_callback = s_on_credentials_provider_shutdown;
    impl->provider->shutdown_options.shutdown_user_data = provider;

    provider->shutdown_options = options->shutdown_options;

    struct aws_exponential_backoff_retry_options retry_options = {
        .el_group = options->bootstrap->event_loop_group,
        .max_retries = s_max_retries,
    };
    impl->retry_strategy = aws_retry_strategy_new_exponential_backoff(allocator, &retry_options);

    if (!impl->retry_strategy) {
        AWS_LOGF_ERROR(
            AWS_LS_AUTH_CREDENTIALS_PROVIDER,
            "(id=%p): failed to create a retry strategy with error %s",
            (void *)provider,
            aws_error_debug_str(aws_last_error()));
        goto cleanup_provider;
    }

    return provider;

cleanup_provider:
    aws_credentials_provider_release(provider);

    return NULL;
}
