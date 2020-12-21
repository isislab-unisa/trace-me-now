"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextDecoder = exports.TextEncoder = void 0;
/** This file contains polyfills for possibly missing browser features */
var window = ((_a = global !== null && global !== void 0 ? global : self) !== null && _a !== void 0 ? _a : this);
exports.TextEncoder = (_b = window['TextEncoder']) !== null && _b !== void 0 ? _b : require('fastestsmallesttextencoderdecoder').TextEncoder;
exports.TextDecoder = (_c = window['TextDecoder']) !== null && _c !== void 0 ? _c : require('fastestsmallesttextencoderdecoder').TextDecoder;
//# sourceMappingURL=polyfills.js.map