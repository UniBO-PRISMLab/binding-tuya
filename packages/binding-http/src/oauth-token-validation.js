"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.EndpointValidator = exports.Validator = void 0;
/********************************************************************************
 * Copyright (c) 2018 - 2020 Contributors to the Eclipse Foundation
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
var node_fetch_1 = require("node-fetch");
var credential_1 = require("./credential");
var http = require("http");
var https_1 = require("https");
function default_1(method) {
    if (!method || !(method === null || method === void 0 ? void 0 : method.name)) {
        throw new Error("Undefined oauth token validation method");
    }
    switch (method.name) {
        case "introspection_endpoint":
            return new EndpointValidator(method);
        default:
            throw new Error("Unsupported oauth token validation method " + method.name);
    }
}
exports["default"] = default_1;
var Validator = /** @class */ (function () {
    function Validator() {
    }
    return Validator;
}());
exports.Validator = Validator;
var EndpointValidator = /** @class */ (function (_super) {
    __extends(EndpointValidator, _super);
    function EndpointValidator(config) {
        var _this = _super.call(this) || this;
        _this.config = config;
        var endpoint = config.endpoint;
        _this.agent = endpoint.startsWith("https") ? new https_1.Agent({
            rejectUnauthorized: !config.allowSelfSigned
        }) : new http.Agent();
        return _this;
    }
    EndpointValidator.prototype.validate = function (tokenRequest, scopes, clients) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var token, request, response, contentType, validationResult, tokenScopes, validScope;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = extractTokenFromRequest(tokenRequest);
                        request = new node_fetch_1.Request(this.config.endpoint, {
                            method: "POST",
                            body: "token=" + token,
                            headers: {
                                "content-type": "application/x-www-form-urlencoded"
                            },
                            agent: this.agent
                        });
                        if (!this.config.credentials) return [3 /*break*/, 2];
                        return [4 /*yield*/, new credential_1.BasicCredential(this.config.credentials).sign(request)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, node_fetch_1["default"](request)];
                    case 3:
                        response = _b.sent();
                        if (response.status != 200) {
                            throw new Error("Introspection endpoint error: " + response.statusText);
                        }
                        contentType = response.headers.get("content-type");
                        contentType = (_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.split(";")[0];
                        if (contentType !== "application/json") {
                            throw new Error("Introspection response is not a json file. Content-Type: " + response.headers.get("content-type"));
                        }
                        return [4 /*yield*/, response.json()];
                    case 4:
                        validationResult = _b.sent();
                        if (validationResult.active === undefined) {
                            throw new Error("Malformed token introspection response: active is undefined");
                        }
                        // Endpoint validation
                        if (!validationResult.active) {
                            return [2 /*return*/, false];
                        }
                        // Check if the token's scopes are allowed by the Thing Descriptor
                        if (validationResult.scope) {
                            tokenScopes = validationResult.scope.split(" ");
                            validScope = tokenScopes.some(function (tokenScope) {
                                return scopes.some(function (thingScope) { return tokenScope === thingScope; });
                            });
                            if (!validScope)
                                return [2 /*return*/, false];
                        }
                        // Check if the client was allowed in the servient configuration file
                        if (validationResult.client_id && !validationResult.client_id.match(clients)) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return EndpointValidator;
}(Validator));
exports.EndpointValidator = EndpointValidator;
function extractTokenFromRequest(request) {
    var headerToken = request.headers.authorization;
    var url = new URL(request.url, "http://" + request.headers.host);
    var queryToken = url.searchParams.get("access_token");
    if (!headerToken && !queryToken) {
        throw new Error("Invalid request: only one authentication method is allowed");
    }
    if (queryToken) {
        return queryToken;
    }
    var matches = headerToken.match(/Bearer\s(\S+)/);
    if (!matches) {
        throw new Error('Invalid request: malformed authorization header');
    }
    return matches[1];
}
