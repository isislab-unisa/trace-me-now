"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsIotMqttConnectionConfigBuilder = void 0;
var io_1 = require("./io");
var platform = __importStar(require("../common/platform"));
/**
 * Builder functions to create a {@link MqttConnectionConfig} which can then be used to create
 * a {@link MqttClientConnection}, configured for use with AWS IoT.
 *
 * @module aws-crt
 * @category IoT
 */
var AwsIotMqttConnectionConfigBuilder = /** @class */ (function () {
    function AwsIotMqttConnectionConfigBuilder() {
        this.params = {
            client_id: '',
            host_name: '',
            socket_options: new io_1.SocketOptions(),
            port: 8883,
            clean_session: false,
            keep_alive: undefined,
            will: undefined,
            username: "?SDK=BrowserJSv2&Version=" + platform.crt_version(),
            password: undefined,
            websocket: {},
        };
    }
    /**
     * For API compatibility with the native version. Does not set up mTLS.
     */
    AwsIotMqttConnectionConfigBuilder.new_mtls_builder = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return AwsIotMqttConnectionConfigBuilder.new_builder_for_websocket();
    };
    /**
     * For API compatibility with the native version. Alias for {@link new_builder_for_websocket}.
     */
    AwsIotMqttConnectionConfigBuilder.new_with_websockets = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return AwsIotMqttConnectionConfigBuilder.new_builder_for_websocket();
    };
    /**
     * Creates a new builder using MQTT over websockets (the only option in browser)
     */
    AwsIotMqttConnectionConfigBuilder.new_builder_for_websocket = function () {
        var builder = new AwsIotMqttConnectionConfigBuilder();
        return builder;
    };
    /**
     * Configures the IoT endpoint for this connection
     * @param endpoint The IoT endpoint to connect to
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_endpoint = function (endpoint) {
        this.params.host_name = endpoint;
        return this;
    };
    /**
     * The port to connect to on the IoT endpoint
     * @param port The port to connect to on the IoT endpoint. Usually 8883 for MQTT, or 443 for websockets
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_client_id = function (client_id) {
        this.params.client_id = client_id;
        return this;
    };
    /**
     * Determines whether or not the service should try to resume prior subscriptions, if it has any
     * @param clean_session true if the session should drop prior subscriptions when this client connects, false to resume the session
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_clean_session = function (clean_session) {
        this.params.clean_session = clean_session;
        return this;
    };
    /**
     * Configures the connection to use MQTT over websockets. No-op in the browser.
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_use_websockets = function () {
        /* no-op, but valid in the browser */
        return this;
    };
    /**
     * Configures MQTT keep-alive via PING messages. Note that this is not TCP keepalive.
     * @param keep_alive How often in seconds to send an MQTT PING message to the service to keep the connection alive
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_keep_alive_seconds = function (keep_alive) {
        this.params.keep_alive = keep_alive;
        return this;
    };
    /**
     * Configures the TCP socket timeout (in milliseconds)
     * @param timeout_ms TCP socket timeout
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_timeout_ms = function (timeout_ms) {
        this.params.timeout = timeout_ms;
        return this;
    };
    /**
     * Configures the will message to be sent when this client disconnects
     * @param will The will topic, qos, and message
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_will = function (will) {
        this.params.will = will;
        return this;
    };
    /**
     * Configures the common settings for the socket to use when opening a connection to the server
     * @param socket_options The socket settings
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_socket_options = function (socket_options) {
        this.params.socket_options = socket_options;
        return this;
    };
    /**
     * Allows additional headers to be sent when establishing a websocket connection. Useful for custom authentication.
     * @param headers Additional headers to send during websocket connect
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_websocket_headers = function (headers) {
        this.params.websocket = {
            headers: headers
        };
        return this;
    };
    /**
     * Configures AWS credentials (usually from Cognito) for this connection
     * @param aws_region The service region to connect to
     * @param aws_access_id IAM Access ID
     * @param aws_secret_key IAM Secret Key
     * @param aws_sts_token STS token from Cognito (optional)
     */
    AwsIotMqttConnectionConfigBuilder.prototype.with_credentials = function (aws_region, aws_access_id, aws_secret_key, aws_sts_token) {
        this.params.credentials = {
            aws_region: aws_region,
            aws_access_id: aws_access_id,
            aws_secret_key: aws_secret_key,
            aws_sts_token: aws_sts_token,
        };
        return this;
    };
    /**
     * Returns the configured MqttConnectionConfig
     * @returns The configured MqttConnectionConfig
     */
    AwsIotMqttConnectionConfigBuilder.prototype.build = function () {
        if (this.params.client_id === undefined || this.params.host_name === undefined) {
            throw 'client_id and endpoint are required';
        }
        return this.params;
    };
    return AwsIotMqttConnectionConfigBuilder;
}());
exports.AwsIotMqttConnectionConfigBuilder = AwsIotMqttConnectionConfigBuilder;
//# sourceMappingURL=aws_iot.js.map