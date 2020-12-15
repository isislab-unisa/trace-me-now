/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
/// <reference types="node" />
import * as WebsocketUtils from "./ws";
import { BufferedEventEmitter } from "../common/event";
import { CrtError } from "../browser";
import { ClientBootstrap, SocketOptions } from "./io";
import { QoS, Payload, MqttRequest, MqttSubscribeRequest, MqttWill } from "../common/mqtt";
export { QoS, Payload, MqttRequest, MqttSubscribeRequest, MqttWill } from "../common/mqtt";
/** @category MQTT */
export declare type WebsocketOptions = WebsocketUtils.WebsocketOptions;
/** @category MQTT */
export declare type AWSCredentials = WebsocketUtils.AWSCredentials;
/**
 * Configuration options for an MQTT connection
 *
 * @module aws-crt
 * @category MQTT
 */
export interface MqttConnectionConfig {
    /**
    * ID to place in CONNECT packet. Must be unique across all devices/clients.
    * If an ID is already in use, the other client will be disconnected.
    */
    client_id: string;
    /** Server name to connect to */
    host_name: string;
    /** Server port to connect to */
    port: number;
    /** Socket options, ignored in browser */
    socket_options: SocketOptions;
    /**
     * Whether or not to start a clean session with each reconnect.
     * If True, the server will forget all subscriptions with each reconnect.
     * Set False to request that the server resume an existing session
     * or start a new session that may be resumed after a connection loss.
     * The `session_present` bool in the connection callback informs
     * whether an existing session was successfully resumed.
     * If an existing session is resumed, the server remembers previous subscriptions
     * and sends mesages (with QoS1 or higher) that were published while the client was offline.
     */
    clean_session?: boolean;
    /**
     * The keep alive value, in seconds, to send in CONNECT packet.
     * A PING will automatically be sent at this interval.
     * The server will assume the connection is lost if no PING is received after 1.5X this value.
     * This duration must be longer than {@link timeout}.
     */
    keep_alive?: number;
    /**
     * Milliseconds to wait for ping response before client assumes
     * the connection is invalid and attempts to reconnect.
     * This duration must be shorter than keep_alive_secs.
     * Alternatively, TCP keep-alive via :attr:`SocketOptions.keep_alive`
     * may accomplish this in a more efficient (low-power) scenario,
     * but keep-alive options may not work the same way on every platform and OS version.
     */
    timeout?: number;
    /**
     * Will to send with CONNECT packet. The will is
     * published by the server when its connection to the client is unexpectedly lost.
     */
    will?: MqttWill;
    /** Username to connect with */
    username?: string;
    /** Password to connect with */
    password?: string;
    /** Options for the underlying websocket connection */
    websocket?: WebsocketOptions;
    /** AWS credentials, which will be used to sign the websocket request */
    credentials?: AWSCredentials;
}
/**
 * MQTT client
 *
 * @module aws-crt
 * @category MQTT
 */
export declare class MqttClient {
    constructor(bootstrap?: ClientBootstrap);
    /**
     * Creates a new {@link MqttClientConnection}
     * @param config Configuration for the connection
     * @returns A new connection
     */
    new_connection(config: MqttConnectionConfig): MqttClientConnection;
}
/**
 * MQTT client connection
 *
 * @module aws-crt
 * @category MQTT
 */
export declare class MqttClientConnection extends BufferedEventEmitter {
    readonly client: MqttClient;
    private config;
    private connection;
    private subscriptions;
    private connection_count;
    /**
     * @param client The client that owns this connection
     * @param config The configuration for this connection
     */
    constructor(client: MqttClient, config: MqttConnectionConfig);
    /** Emitted when the connection is ready and is about to start sending response data */
    on(event: 'connect', listener: (session_present: boolean) => void): this;
    /** Emitted when connection has closed sucessfully. */
    on(event: 'disconnect', listener: () => void): this;
    /**
     * Emitted when an error occurs
     * @param error - A CrtError containing the error that occurred
     */
    on(event: 'error', listener: (error: CrtError) => void): this;
    /**
     * Emitted when the connection is dropped unexpectedly. The error will contain the error
     * code and message.
     */
    on(event: 'interrupt', listener: (error: CrtError) => void): this;
    /**
     * Emitted when the connection reconnects. Only triggers on connections after the initial one.
     */
    on(event: 'resume', listener: (return_code: number, session_present: boolean) => void): this;
    /**
     * Emitted when any MQTT publish message arrives.
     */
    on(event: 'message', listener: (topic: string, payload: Buffer) => void): this;
    private on_connect;
    private on_online;
    private on_offline;
    private on_disconnected;
    private on_error;
    private on_message;
    /**
     * Open the actual connection to the server (async).
     * @returns A Promise which completes whether the connection succeeds or fails.
     *          If connection fails, the Promise will reject with an exception.
     *          If connection succeeds, the Promise will return a boolean that is
     *          true for resuming an existing session, or false if the session is new
     */
    connect(): Promise<boolean>;
    /**
     * The connection will automatically reconnect. To cease reconnection attempts, call {@link disconnect}.
     * To resume the connection, call {@link connect}.
     * @deprecated
     */
    reconnect(): Promise<boolean>;
    /**
     * Publish message (async).
     * If the device is offline, the PUBLISH packet will be sent once the connection resumes.
     *
     * @param topic Topic name
     * @param payload Contents of message
     * @param qos Quality of Service for delivering this message
     * @param retain If true, the server will store the message and its QoS so that it can be
     *               delivered to future subscribers whose subscriptions match the topic name
     * @returns Promise which returns a {@link MqttRequest} which will contain the packet id of
     *          the PUBLISH packet.
     *
     * * For QoS 0, completes as soon as the packet is sent.
     * * For QoS 1, completes when PUBACK is received.
     * * For QoS 2, completes when PUBCOMP is received.
     */
    publish(topic: string, payload: Payload, qos: QoS, retain?: boolean): Promise<MqttRequest>;
    /**
     * Subscribe to a topic filter (async).
     * The client sends a SUBSCRIBE packet and the server responds with a SUBACK.
     *
     * subscribe() may be called while the device is offline, though the async
     * operation cannot complete successfully until the connection resumes.
     *
     * Once subscribed, `callback` is invoked each time a message matching
     * the `topic` is received. It is possible for such messages to arrive before
     * the SUBACK is received.
     *
     * @param topic Subscribe to this topic filter, which may include wildcards
     * @param qos Maximum requested QoS that server may use when sending messages to the client.
     *            The server may grant a lower QoS in the SUBACK
     * @param on_message Optional callback invoked when message received.
     * @returns Promise which returns a {@link MqttSubscribeRequest} which will contain the
     *          result of the SUBSCRIBE. The Promise resolves when a SUBACK is returned
     *          from the server or is rejected when an exception occurs.
     */
    subscribe(topic: string, qos: QoS, on_message?: (topic: string, payload: ArrayBuffer) => void): Promise<MqttSubscribeRequest>;
    /**
    * Unsubscribe from a topic filter (async).
    * The client sends an UNSUBSCRIBE packet, and the server responds with an UNSUBACK.
    * @param topic The topic filter to unsubscribe from. May contain wildcards.
    * @returns Promise wihch returns a {@link MqttRequest} which will contain the packet id
    *          of the UNSUBSCRIBE packet being acknowledged. Promise is resolved when an
    *          UNSUBACK is received from the server or is rejected when an exception occurs.
    */
    unsubscribe(topic: string): Promise<MqttRequest>;
    /**
     * Close the connection (async).
     * @returns Promise which completes when the connection is closed.
    */
    disconnect(): Promise<unknown>;
}