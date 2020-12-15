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
exports.create_websocket_stream = exports.create_websocket_url = void 0;
var WebsocketStream = require("websocket-stream");
var Crypto = __importStar(require("crypto-js"));
function zero_pad(n) {
    return (n > 9) ? n : '0' + n.toString();
}
function canonical_time() {
    var now = new Date();
    return "" + now.getUTCFullYear() + zero_pad(now.getUTCMonth() + 1) + zero_pad(now.getUTCDate()) + "T" +
        ("" + zero_pad(now.getUTCHours()) + zero_pad(now.getUTCMinutes()) + zero_pad(now.getUTCSeconds()) + "Z");
}
function canonical_day(time) {
    if (time === void 0) { time = canonical_time(); }
    return time.substring(0, time.indexOf('T'));
}
function make_signing_key(credentials, day, service_name) {
    var hash_opts = { asBytes: true };
    var hash = Crypto.HmacSHA256(day, 'AWS4' + credentials.aws_secret_key, hash_opts);
    hash = Crypto.HmacSHA256(credentials.aws_region || '', hash, hash_opts);
    hash = Crypto.HmacSHA256(service_name, hash, hash_opts);
    hash = Crypto.HmacSHA256('aws4_request', hash, hash_opts);
    return hash;
}
function sign_url(method, url, credentials, service_name, time, day, payload) {
    if (time === void 0) { time = canonical_time(); }
    if (day === void 0) { day = canonical_day(time); }
    if (payload === void 0) { payload = ''; }
    var signed_headers = 'host';
    var canonical_headers = "host:" + url.hostname.toLowerCase() + "\n";
    var payload_hash = Crypto.SHA256(payload, { asBytes: true });
    var canonical_params = url.search.replace(new RegExp('^\\?'), '');
    var canonical_request = method + "\n" + url.pathname + "\n" + canonical_params + "\n" + canonical_headers + "\n" + signed_headers + "\n" + payload_hash;
    var canonical_request_hash = Crypto.SHA256(canonical_request, { asBytes: true });
    var signature_raw = "AWS4-HMAC-SHA256\n" + time + "\n" + day + "/" + credentials.aws_region + "/" + service_name + "/aws4_request\n" + canonical_request_hash;
    var signing_key = make_signing_key(credentials, day, service_name);
    var signature = Crypto.HmacSHA256(signature_raw, signing_key, { asBytes: true });
    var query_params = url.search + "&X-Amz-Signature=" + signature;
    if (credentials.aws_sts_token) {
        query_params += "&X-Amz-Security-Token=" + encodeURIComponent(credentials.aws_sts_token);
    }
    var signed_url = url.protocol + "//" + url.hostname + url.pathname + query_params;
    return signed_url;
}
/** @internal */
function create_websocket_url(config) {
    var time = canonical_time();
    var day = canonical_day(time);
    var path = '/mqtt';
    var protocol = (config.websocket || {}).protocol || 'wss';
    if (protocol === 'wss') {
        var service_name = 'iotdevicegateway';
        var credentials = config.credentials;
        var query_params = "X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=" + credentials.aws_access_id +
            ("%2F" + day + "%2F" + credentials.aws_region + "%2F" + service_name + "%2Faws4_request&X-Amz-Date=" + time + "&X-Amz-SignedHeaders=host");
        var url = new URL("wss://" + config.host_name + path + "?" + query_params);
        return sign_url('GET', url, credentials, service_name, time, day);
    }
    else if (protocol === 'wss-custom-auth') {
        return "wss://" + config.host_name + "/" + path;
    }
    throw new URIError("Invalid protocol requested: " + protocol);
}
exports.create_websocket_url = create_websocket_url;
/** @internal */
function create_websocket_stream(config) {
    var url = create_websocket_url(config);
    return WebsocketStream(url, ['mqttv3.1'], config.websocket);
}
exports.create_websocket_stream = create_websocket_stream;
//# sourceMappingURL=ws.js.map