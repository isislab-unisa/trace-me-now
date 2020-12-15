"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketDomain = exports.SocketType = exports.TlsVersion = void 0;
/**
 * TLS Version
 *
 * @module aws-crt
 * @category TLS
 */
var TlsVersion;
(function (TlsVersion) {
    TlsVersion[TlsVersion["SSLv3"] = 0] = "SSLv3";
    TlsVersion[TlsVersion["TLSv1"] = 1] = "TLSv1";
    TlsVersion[TlsVersion["TLSv1_1"] = 2] = "TLSv1_1";
    TlsVersion[TlsVersion["TLSv1_2"] = 3] = "TLSv1_2";
    TlsVersion[TlsVersion["TLSv1_3"] = 4] = "TLSv1_3";
    TlsVersion[TlsVersion["Default"] = 128] = "Default";
})(TlsVersion = exports.TlsVersion || (exports.TlsVersion = {}));
/**
 * @module aws-crt
 * @category I/O
 */
var SocketType;
(function (SocketType) {
    /**
     * A streaming socket sends reliable messages over a two-way connection.
     * This means TCP when used with {@link SocketDomain.IPV4}/{@link SocketDomain.IPV6},
     * and Unix domain sockets when used with {@link SocketDomain.LOCAL }
      */
    SocketType[SocketType["STREAM"] = 0] = "STREAM";
    /**
     * A datagram socket is connectionless and sends unreliable messages.
     * This means UDP when used with {@link SocketDomain.IPV4}/{@link SocketDomain.IPV6}.
     * {@link SocketDomain.LOCAL} is not compatible with {@link DGRAM}
     */
    SocketType[SocketType["DGRAM"] = 1] = "DGRAM";
})(SocketType = exports.SocketType || (exports.SocketType = {}));
/**
 * @module aws-crt
 * @category I/O
 */
var SocketDomain;
(function (SocketDomain) {
    SocketDomain[SocketDomain["IPV4"] = 0] = "IPV4";
    SocketDomain[SocketDomain["IPV6"] = 1] = "IPV6";
    SocketDomain[SocketDomain["LOCAL"] = 2] = "LOCAL";
})(SocketDomain = exports.SocketDomain || (exports.SocketDomain = {}));
//# sourceMappingURL=io.js.map