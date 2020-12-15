/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
import { SocketOptions } from "./io";
import { MqttConnectionConfig, MqttWill } from "./mqtt";
/**
 * Builder functions to create a {@link MqttConnectionConfig} which can then be used to create
 * a {@link MqttClientConnection}, configured for use with AWS IoT.
 *
 * @module aws-crt
 * @category IoT
 */
export declare class AwsIotMqttConnectionConfigBuilder {
    private params;
    private constructor();
    /**
     * For API compatibility with the native version. Does not set up mTLS.
     */
    static new_mtls_builder(...args: any[]): AwsIotMqttConnectionConfigBuilder;
    /**
     * For API compatibility with the native version. Alias for {@link new_builder_for_websocket}.
     */
    static new_with_websockets(...args: any[]): AwsIotMqttConnectionConfigBuilder;
    /**
     * Creates a new builder using MQTT over websockets (the only option in browser)
     */
    static new_builder_for_websocket(): AwsIotMqttConnectionConfigBuilder;
    /**
     * Configures the IoT endpoint for this connection
     * @param endpoint The IoT endpoint to connect to
     */
    with_endpoint(endpoint: string): this;
    /**
     * The port to connect to on the IoT endpoint
     * @param port The port to connect to on the IoT endpoint. Usually 8883 for MQTT, or 443 for websockets
     */
    with_client_id(client_id: string): this;
    /**
     * Determines whether or not the service should try to resume prior subscriptions, if it has any
     * @param clean_session true if the session should drop prior subscriptions when this client connects, false to resume the session
     */
    with_clean_session(clean_session: boolean): this;
    /**
     * Configures the connection to use MQTT over websockets. No-op in the browser.
     */
    with_use_websockets(): this;
    /**
     * Configures MQTT keep-alive via PING messages. Note that this is not TCP keepalive.
     * @param keep_alive How often in seconds to send an MQTT PING message to the service to keep the connection alive
     */
    with_keep_alive_seconds(keep_alive: number): this;
    /**
     * Configures the TCP socket timeout (in milliseconds)
     * @param timeout_ms TCP socket timeout
     */
    with_timeout_ms(timeout_ms: number): this;
    /**
     * Configures the will message to be sent when this client disconnects
     * @param will The will topic, qos, and message
     */
    with_will(will: MqttWill): this;
    /**
     * Configures the common settings for the socket to use when opening a connection to the server
     * @param socket_options The socket settings
     */
    with_socket_options(socket_options: SocketOptions): this;
    /**
     * Allows additional headers to be sent when establishing a websocket connection. Useful for custom authentication.
     * @param headers Additional headers to send during websocket connect
     */
    with_websocket_headers(headers: {
        [index: string]: string;
    }): this;
    /**
     * Configures AWS credentials (usually from Cognito) for this connection
     * @param aws_region The service region to connect to
     * @param aws_access_id IAM Access ID
     * @param aws_secret_key IAM Secret Key
     * @param aws_sts_token STS token from Cognito (optional)
     */
    with_credentials(aws_region: string, aws_access_id: string, aws_secret_key: string, aws_sts_token?: string): this;
    /**
     * Returns the configured MqttConnectionConfig
     * @returns The configured MqttConnectionConfig
     */
    build(): MqttConnectionConfig;
}