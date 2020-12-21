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
exports.CrtError = exports.resource_safety = exports.platform = exports.iot = exports.crypto = exports.http = exports.mqtt = exports.io = void 0;
// This is the entry point for the browser AWS CRT shim library
/* common libs */
var platform = __importStar(require("./common/platform"));
exports.platform = platform;
var resource_safety = __importStar(require("./common/resource_safety"));
exports.resource_safety = resource_safety;
/* browser specific libs */
var io = __importStar(require("./browser/io"));
exports.io = io;
var mqtt = __importStar(require("./browser/mqtt"));
exports.mqtt = mqtt;
var http = __importStar(require("./browser/http"));
exports.http = http;
var crypto = __importStar(require("./browser/crypto"));
exports.crypto = crypto;
var iot = __importStar(require("./browser/aws_iot"));
exports.iot = iot;
var error_1 = require("./browser/error");
Object.defineProperty(exports, "CrtError", { enumerable: true, get: function () { return error_1.CrtError; } });
//# sourceMappingURL=browser.js.map