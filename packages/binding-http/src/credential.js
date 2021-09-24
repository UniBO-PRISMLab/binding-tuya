"use strict";
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
exports.TuyaCredential = exports.OAuthCredential = exports.BasicKeyCredential = exports.BearerCredential = exports.BasicCredential = exports.Credential = void 0;
var node_fetch_1 = require("node-fetch");
var crypto = require("crypto");
var queryString = require("query-string");
var Credential = /** @class */ (function () {
    function Credential() {
    }
    return Credential;
}());
exports.Credential = Credential;
var BasicCredential = /** @class */ (function (_super) {
    __extends(BasicCredential, _super);
    /**
     *
     */
    function BasicCredential(_a) {
        var username = _a.username, password = _a.password;
        var _this = _super.call(this) || this;
        if (username === undefined || password === undefined ||
            username === null || password === null) {
            throw new Error("No Basic credentials for Thing");
        }
        _this.username = username;
        _this.password = password;
        return _this;
    }
    BasicCredential.prototype.sign = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = request.clone();
                result.headers.set("authorization", "Basic " + Buffer.from(this.username + ":" + this.password).toString('base64'));
                return [2 /*return*/, result];
            });
        });
    };
    return BasicCredential;
}(Credential));
exports.BasicCredential = BasicCredential;
var BearerCredential = /** @class */ (function (_super) {
    __extends(BearerCredential, _super);
    function BearerCredential(token) {
        var _this = _super.call(this) || this;
        if (token === undefined || token === null) {
            throw new Error("No Bearer credentionals for Thing");
        }
        _this.token = token;
        return _this;
    }
    BearerCredential.prototype.sign = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = request.clone();
                result.headers.set("authorization", "Bearer " + this.token);
                return [2 /*return*/, result];
            });
        });
    };
    return BearerCredential;
}(Credential));
exports.BearerCredential = BearerCredential;
var BasicKeyCredential = /** @class */ (function (_super) {
    __extends(BasicKeyCredential, _super);
    function BasicKeyCredential(apiKey, options) {
        var _this = _super.call(this) || this;
        if (apiKey === undefined || apiKey === null) {
            throw new Error("No API key credentials for Thing");
        }
        _this.apiKey = apiKey;
        _this.options = options;
        return _this;
    }
    BasicKeyCredential.prototype.sign = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var result, headerName;
            return __generator(this, function (_a) {
                result = request.clone();
                headerName = "authorization";
                if (this.options["in"] === "header" && this.options.name !== undefined) {
                    headerName = this.options.name;
                }
                result.headers.append(headerName, this.apiKey);
                return [2 /*return*/, result];
            });
        });
    };
    return BasicKeyCredential;
}(Credential));
exports.BasicKeyCredential = BasicKeyCredential;
var OAuthCredential = /** @class */ (function (_super) {
    __extends(OAuthCredential, _super);
    /**
     *
     * @param tokenRequest oAuth2 token instance
     * @param refresh use a custom refresh function
     */
    function OAuthCredential(token, refresh) {
        var _this = _super.call(this) || this;
        _this.token = token;
        _this.refresh = refresh;
        _this.token = token;
        return _this;
    }
    OAuthCredential.prototype.sign = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenRequest, _a, tempRequest, mergeHeaders;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.token instanceof Promise)) return [3 /*break*/, 2];
                        tokenRequest = this.token;
                        _a = this;
                        return [4 /*yield*/, tokenRequest];
                    case 1:
                        _a.token = _b.sent();
                        _b.label = 2;
                    case 2:
                        tempRequest = { url: request.url, headers: {} };
                        tempRequest = this.token.sign(tempRequest);
                        mergeHeaders = new node_fetch_1.Request(request, tempRequest);
                        return [2 /*return*/, mergeHeaders];
                }
            });
        });
    };
    OAuthCredential.prototype.refreshToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.token instanceof Promise) {
                            throw new Error("Uninitialized token. You have to call sing before refresh");
                        }
                        if (!this.refresh) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh()];
                    case 1:
                        newToken = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.token.refresh()];
                    case 3:
                        newToken = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, new OAuthCredential(newToken, this.refresh)];
                }
            });
        });
    };
    return OAuthCredential;
}(Credential));
exports.OAuthCredential = OAuthCredential;
var TuyaCredential = /** @class */ (function (_super) {
    __extends(TuyaCredential, _super);
    function TuyaCredential(scheme) {
        var _this = _super.call(this) || this;
        _this.key = scheme.key;
        _this.secret = scheme.secret;
        _this.region = scheme.region;
        return _this;
    }
    TuyaCredential.prototype.sign = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var isTokenExpired, url, body, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isTokenExpired = this.isTokenExpired();
                        if (!(this.token == undefined || this.token == '' || isTokenExpired)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.requestAndRefreshToken(isTokenExpired)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        url = request[Object.getOwnPropertySymbols(request)[1]].parsedURL.href;
                        body = request.body != null ? request.body.toString() : null;
                        headers = this.getHeaders(true, request.headers.raw(), body, url, request.method);
                        Object.assign(headers, request.headers.raw());
                        return [2 /*return*/, new node_fetch_1.Request(url, { method: request.method, body: body, headers: headers })];
                }
            });
        });
    };
    TuyaCredential.prototype.requestAndRefreshToken = function (refresh) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, request, url, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = this.getHeaders(false, {}, null, null, null);
                        request = {
                            headers: headers,
                            method: 'GET'
                        };
                        url = "https://openapi.tuya" + this.region + ".com/v1.0/token?grant_type=1";
                        if (refresh) {
                            url = "https://openapi.tuya" + this.region + ".com/v1.0/token/" + this.refresh_Token;
                        }
                        return [4 /*yield*/, node_fetch_1["default"](url, request)];
                    case 1: return [4 /*yield*/, (_a.sent()).json()];
                    case 2:
                        data = _a.sent();
                        if (data.success) {
                            this.token = data.result.access_token;
                            this.refresh_Token = data.result.refresh_token;
                            this.expireTime = new Date(Date.now() + (data.result.expire_time * 1000));
                        }
                        else {
                            throw new Error("token fetch failed");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TuyaCredential.prototype.getHeaders = function (NormalRequest, headers, body, url, method) {
        var requestTime = Date.now().toString();
        var _url = url != null ? url.replace("https://openapi.tuya" + this.region + ".com", '') : null;
        var sign = this.requestSign(NormalRequest, requestTime, body, headers, _url, method);
        return {
            t: requestTime,
            'client_id': this.key,
            sign_method: "HMAC-SHA256",
            sign: sign,
            access_token: this.token || ''
        };
    };
    TuyaCredential.prototype.requestSign = function (NormalRequest, requestTime, body, headers, path, method) {
        var bodyHash = crypto.createHash('sha256').update(body != null ? body : '').digest('hex');
        var signUrl = "/v1.0/token?grant_type=1";
        ;
        var headersKeys = Object.keys(headers);
        var headerString = '';
        var useToken = NormalRequest ? this.token : '';
        var _method = method != null ? method : 'GET';
        if (NormalRequest) {
            var pathQuery = queryString.parse(path.split('?')[1]);
            var query_1 = {};
            query_1 = Object.assign(query_1, pathQuery);
            var sortedQuery_1 = {};
            Object.keys(query_1).sort().forEach(function (i) { return sortedQuery_1[i] = query_1[i]; });
            var qs_1 = queryString.stringify(sortedQuery_1);
            signUrl = decodeURIComponent(qs_1 ? path.split('?')[0] + "?" + qs_1 : path);
        }
        var endStr = [this.key, useToken, requestTime, [_method, bodyHash, headerString, signUrl].join('\n')].join('');
        var sign = crypto
            .createHmac('sha256', this.secret)
            .update(endStr)
            .digest('hex')
            .toUpperCase();
        return sign;
    };
    TuyaCredential.prototype.isTokenExpired = function () {
        if (this.expireTime != null) {
            return Date.now() > this.expireTime.getTime();
        }
        return false;
    };
    return TuyaCredential;
}(Credential));
exports.TuyaCredential = TuyaCredential;
