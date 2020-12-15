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
exports.CrtError = void 0;
/**
 * Represents an error thrown by the CRT browser shim
 *
 * @module aws-crt
* @category System
 */
var CrtError = /** @class */ (function (_super) {
    __extends(CrtError, _super);
    /** @var error - The original error, provided for context. Could be any type, often from underlying libraries */
    function CrtError(error) {
        var _this = _super.call(this, error.toString()) || this;
        _this.error = error;
        return _this;
    }
    return CrtError;
}(Error));
exports.CrtError = CrtError;
//# sourceMappingURL=error.js.map