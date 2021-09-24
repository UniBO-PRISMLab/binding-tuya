"use strict";
/********************************************************************************
 * Copyright (c) 2018 - 2019 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 * Document License (2015-05-13) which is available at
 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.HttpHeader = exports.HttpForm = exports.HttpsClientFactory = exports.HttpClientFactory = exports.HttpClient = exports.HttpServer = void 0;
var TD = require("@node-wot/td-tools");
var http_server_1 = require("./http-server");
__createBinding(exports, http_server_1, "default", "HttpServer");
var http_client_1 = require("./http-client");
__createBinding(exports, http_client_1, "default", "HttpClient");
var http_client_factory_1 = require("./http-client-factory");
__createBinding(exports, http_client_factory_1, "default", "HttpClientFactory");
var https_client_factory_1 = require("./https-client-factory");
__createBinding(exports, https_client_factory_1, "default", "HttpsClientFactory");
__exportStar(require("./http-server"), exports);
__exportStar(require("./http-client"), exports);
__exportStar(require("./http-client-factory"), exports);
__exportStar(require("./https-client-factory"), exports);
var HttpForm = /** @class */ (function (_super) {
    __extends(HttpForm, _super);
    function HttpForm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return HttpForm;
}(TD.Form));
exports.HttpForm = HttpForm;
var HttpHeader = /** @class */ (function () {
    function HttpHeader() {
    }
    return HttpHeader;
}());
exports.HttpHeader = HttpHeader;
