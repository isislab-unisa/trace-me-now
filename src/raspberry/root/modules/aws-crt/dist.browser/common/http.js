"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpProxyOptions = exports.HttpProxyAuthenticationType = exports.HttpVersion = void 0;
/**
 * HTTP protocol version
 *
 * @module aws-crt
* @category HTTP
 */
var HttpVersion;
(function (HttpVersion) {
    HttpVersion[HttpVersion["Unknown"] = 0] = "Unknown";
    /** HTTP/1.0 */
    HttpVersion[HttpVersion["Http1_0"] = 1] = "Http1_0";
    /** HTTP/1.1 */
    HttpVersion[HttpVersion["Http1_1"] = 2] = "Http1_1";
    /** HTTP/2 */
    HttpVersion[HttpVersion["Http2"] = 3] = "Http2";
})(HttpVersion = exports.HttpVersion || (exports.HttpVersion = {}));
/**
 * Proxy authentication types
 *
 * @module aws-crt
 * @category HTTP
 */
var HttpProxyAuthenticationType;
(function (HttpProxyAuthenticationType) {
    HttpProxyAuthenticationType[HttpProxyAuthenticationType["None"] = 0] = "None";
    HttpProxyAuthenticationType[HttpProxyAuthenticationType["Basic"] = 1] = "Basic";
})(HttpProxyAuthenticationType = exports.HttpProxyAuthenticationType || (exports.HttpProxyAuthenticationType = {}));
;
/**
 * Options used when connecting to an HTTP endpoint via a proxy
 *
 * @module aws-crt
 * @category HTTP
 */
var HttpProxyOptions = /** @class */ (function () {
    function HttpProxyOptions(host_name, port, auth_method, auth_username, auth_password) {
        if (auth_method === void 0) { auth_method = HttpProxyAuthenticationType.None; }
        this.host_name = host_name;
        this.port = port;
        this.auth_method = auth_method;
        this.auth_username = auth_username;
        this.auth_password = auth_password;
    }
    return HttpProxyOptions;
}());
exports.HttpProxyOptions = HttpProxyOptions;
//# sourceMappingURL=http.js.map