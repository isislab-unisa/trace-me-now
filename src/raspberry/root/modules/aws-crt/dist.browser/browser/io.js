"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketOptions = exports.ClientTlsContext = exports.TlsContext = exports.TlsConnectionOptions = exports.ClientBootstrap = exports.InputStream = exports.is_alpn_available = void 0;
var io_1 = require("../common/io");
Object.defineProperty(exports, "TlsVersion", { enumerable: true, get: function () { return io_1.TlsVersion; } });
Object.defineProperty(exports, "SocketType", { enumerable: true, get: function () { return io_1.SocketType; } });
Object.defineProperty(exports, "SocketDomain", { enumerable: true, get: function () { return io_1.SocketDomain; } });
var io_2 = require("../common/io");
/**
 * @return false, as ALPN is not configurable from the browser
 *
 * @module aws-crt
 * @category TLS
*/
function is_alpn_available() {
    return false;
}
exports.is_alpn_available = is_alpn_available;
/**
 * Wrapper for any sort of body data in requests. As the browser does not implement streaming,
 * this is merely an interface wrapper around a memory buffer.
 *
 * @module aws-crt
 * @category I/O
 */
var InputStream = /** @class */ (function () {
    function InputStream(data) {
        this.data = data;
    }
    return InputStream;
}());
exports.InputStream = InputStream;
/**
 * Represents resources required to bootstrap a client connection, provided as
 * a stub for the browser API
 *
 * @module aws-crt
 * @category I/O
 */
var ClientBootstrap = /** @class */ (function () {
    function ClientBootstrap() {
    }
    return ClientBootstrap;
}());
exports.ClientBootstrap = ClientBootstrap;
;
/**
 * TLS options that are unique to a given connection using a shared TlsContext.
 * Provided as a stub for browser API.
 *
 * @module aws-crt
 * @category TLS
 */
var TlsConnectionOptions = /** @class */ (function () {
    function TlsConnectionOptions(tls_ctx, server_name, alpn_list) {
        if (alpn_list === void 0) { alpn_list = []; }
        this.tls_ctx = tls_ctx;
        this.server_name = server_name;
        this.alpn_list = alpn_list;
    }
    return TlsConnectionOptions;
}());
exports.TlsConnectionOptions = TlsConnectionOptions;
;
/**
 * TLS context used for TLS communications over sockets. Provided as a
 * stub for the browser API
 *
 * @module aws-crt
 * @category TLS
 */
var TlsContext = /** @class */ (function () {
    function TlsContext() {
    }
    return TlsContext;
}());
exports.TlsContext = TlsContext;
;
/**
 * TLS context used for client TLS communications over sockets. Provided as a
 * stub for the browser API
 *
 * @module aws-crt
 * @category TLS
 */
var ClientTlsContext = /** @class */ (function (_super) {
    __extends(ClientTlsContext, _super);
    function ClientTlsContext(options) {
        return _super.call(this) || this;
    }
    return ClientTlsContext;
}(TlsContext));
exports.ClientTlsContext = ClientTlsContext;
;
/**
 * Standard Berkeley socket style options.
 *
 * Provided for compatibility with nodejs, but this version is largely unused.
 * @module aws-crt
 * @category I/O
*/
var SocketOptions = /** @class */ (function () {
    function SocketOptions(type, domain, connect_timeout_ms, keepalive, keep_alive_interval_sec, keep_alive_timeout_sec, keep_alive_max_failed_probes) {
        if (type === void 0) { type = io_2.SocketType.STREAM; }
        if (domain === void 0) { domain = io_2.SocketDomain.IPV6; }
        if (connect_timeout_ms === void 0) { connect_timeout_ms = 5000; }
        if (keepalive === void 0) { keepalive = false; }
        if (keep_alive_interval_sec === void 0) { keep_alive_interval_sec = 0; }
        if (keep_alive_timeout_sec === void 0) { keep_alive_timeout_sec = 0; }
        if (keep_alive_max_failed_probes === void 0) { keep_alive_max_failed_probes = 0; }
        this.type = type;
        this.domain = domain;
        this.connect_timeout_ms = connect_timeout_ms;
        this.keepalive = keepalive;
        this.keep_alive_interval_sec = keep_alive_interval_sec;
        this.keep_alive_timeout_sec = keep_alive_timeout_sec;
        this.keep_alive_max_failed_probes = keep_alive_max_failed_probes;
    }
    return SocketOptions;
}());
exports.SocketOptions = SocketOptions;
//# sourceMappingURL=io.js.map