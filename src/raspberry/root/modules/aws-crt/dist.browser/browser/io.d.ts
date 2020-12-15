/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
export { TlsVersion, SocketType, SocketDomain } from "../common/io";
import { SocketType, SocketDomain } from "../common/io";
/**
 * @return false, as ALPN is not configurable from the browser
 *
 * @module aws-crt
 * @category TLS
*/
export declare function is_alpn_available(): boolean;
declare type BodyData = string | object | ArrayBuffer | ArrayBufferView | Blob | File;
/**
 * Wrapper for any sort of body data in requests. As the browser does not implement streaming,
 * this is merely an interface wrapper around a memory buffer.
 *
 * @module aws-crt
 * @category I/O
 */
export declare class InputStream {
    data: BodyData;
    constructor(data: BodyData);
}
/**
 * Represents resources required to bootstrap a client connection, provided as
 * a stub for the browser API
 *
 * @module aws-crt
 * @category I/O
 */
export declare class ClientBootstrap {
}
/**
 * Options for creating a {@link ClientTlsContext}. Provided as a stub for
 * browser API.
 *
 * @module aws-crt
 * @category TLS
 */
export declare type TlsContextOptions = any;
/**
 * TLS options that are unique to a given connection using a shared TlsContext.
 * Provided as a stub for browser API.
 *
 * @module aws-crt
 * @category TLS
 */
export declare class TlsConnectionOptions {
    readonly tls_ctx: TlsContext;
    readonly server_name?: string | undefined;
    readonly alpn_list: string[];
    constructor(tls_ctx: TlsContext, server_name?: string | undefined, alpn_list?: string[]);
}
/**
 * TLS context used for TLS communications over sockets. Provided as a
 * stub for the browser API
 *
 * @module aws-crt
 * @category TLS
 */
export declare abstract class TlsContext {
}
/**
 * TLS context used for client TLS communications over sockets. Provided as a
 * stub for the browser API
 *
 * @module aws-crt
 * @category TLS
 */
export declare class ClientTlsContext extends TlsContext {
    constructor(options?: TlsContextOptions);
}
/**
 * Standard Berkeley socket style options.
 *
 * Provided for compatibility with nodejs, but this version is largely unused.
 * @module aws-crt
 * @category I/O
*/
export declare class SocketOptions {
    type: SocketType;
    domain: SocketDomain;
    connect_timeout_ms: number;
    keepalive: boolean;
    keep_alive_interval_sec: number;
    keep_alive_timeout_sec: number;
    keep_alive_max_failed_probes: number;
    constructor(type?: SocketType, domain?: SocketDomain, connect_timeout_ms?: number, keepalive?: boolean, keep_alive_interval_sec?: number, keep_alive_timeout_sec?: number, keep_alive_max_failed_probes?: number);
}
