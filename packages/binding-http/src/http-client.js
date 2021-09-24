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
/**
 * HTTP client based on http
 */
var http = require("http");
var https = require("https");
var Subscription_1 = require("rxjs/Subscription");
var node_fetch_1 = require("node-fetch");
var buffer_1 = require("buffer");
var oauth_manager_1 = require("./oauth-manager");
var url_1 = require("url");
var credential_1 = require("./credential");
var subscription_protocols_1 = require("./subscription-protocols");
var HttpClient = /** @class */ (function () {
    function HttpClient(config, secure, oauthManager) {
        if (config === void 0) { config = null; }
        if (secure === void 0) { secure = false; }
        if (oauthManager === void 0) { oauthManager = new oauth_manager_1["default"](); }
        this.proxyRequest = null;
        this.authorization = null;
        this.authorizationHeader = "Authorization";
        this.allowSelfSigned = false;
        this.credential = null;
        this.activeSubscriptions = new Map();
        // config proxy by client side (not from TD)
        if (config !== null && config.proxy && config.proxy.href) {
            this.proxyRequest = new node_fetch_1.Request(HttpClient.fixLocalhostName(config.proxy.href));
            if (config.proxy.scheme === "basic") {
                if (!config.proxy.hasOwnProperty("username") || !config.proxy.hasOwnProperty("password"))
                    console.warn("[binding-http]", "HttpClient client configured for basic proxy auth, but no username/password given");
                this.proxyRequest.headers.set('proxy-authorization', "Basic " + buffer_1.Buffer.from(config.proxy.username + ":" + config.proxy.password).toString('base64'));
            }
            else if (config.proxy.scheme === "bearer") {
                if (!config.proxy.hasOwnProperty("token"))
                    console.warn("[binding-http]", "HttpClient client configured for bearer proxy auth, but no token given");
                this.proxyRequest.headers.set('proxy-authorization', "Bearer " + config.proxy.token);
            }
            // security for hop to proxy
            if (this.proxyRequest.protocol === "https") {
                secure = true;
            }
            console.debug("[binding-http]", "HttpClient using " + (secure ? "secure " : "") + "proxy " + this.proxyRequest.hostname + ":" + this.proxyRequest.port);
        }
        // config certificate checks
        if (config !== null && config.allowSelfSigned !== undefined) {
            this.allowSelfSigned = config.allowSelfSigned;
            console.warn("[binding-http]", "HttpClient allowing self-signed/untrusted certificates -- USE FOR TESTING ONLY");
        }
        // using one client impl for both HTTP and HTTPS
        this.agent = secure ? new https.Agent({
            rejectUnauthorized: !this.allowSelfSigned
        }) : new http.Agent();
        this.provider = secure ? https : http;
        this.oauth = oauthManager;
    }
    HttpClient.prototype.toString = function () {
        return "[HttpClient]";
    };
    HttpClient.prototype.readResource = function (form) {
        return __awaiter(this, void 0, void 0, function () {
            var request, result, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generateFetchRequest(form, "GET")];
                    case 1:
                        request = _a.sent();
                        console.debug("[binding-http]", "HttpClient (readResource) sending " + request.method + " to " + request.url);
                        return [4 /*yield*/, this.fetch(request)];
                    case 2:
                        result = _a.sent();
                        this.checkFetchResponse(result);
                        return [4 /*yield*/, result.buffer()];
                    case 3:
                        buffer = _a.sent();
                        console.debug("[binding-http]", "HttpClient received headers: " + JSON.stringify(result.headers.raw()));
                        console.debug("[binding-http]", "HttpClient received Content-Type: " + result.headers.get("content-type"));
                        return [2 /*return*/, { type: result.headers.get("content-type"), body: buffer }];
                }
            });
        });
    };
    HttpClient.prototype.writeResource = function (form, content) {
        return __awaiter(this, void 0, void 0, function () {
            var request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generateFetchRequest(form, "PUT", {
                            headers: [["content-type", content.type]],
                            body: content.body
                        })];
                    case 1:
                        request = _a.sent();
                        console.debug("[binding-http]", "HttpClient (writeResource) sending " + request.method + " with '" + request.headers.get("Content-Type") + "' to " + request.url);
                        return [4 /*yield*/, this.fetch(request)];
                    case 2:
                        result = _a.sent();
                        console.debug("[binding-http]", "HttpClient received " + result.status + " from " + result.url);
                        this.checkFetchResponse(result);
                        console.debug("[binding-http]", "HttpClient received headers: " + JSON.stringify(result.headers.raw()));
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpClient.prototype.invokeResource = function (form, content) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, request, result, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = content ? [["content-type", content.type]] : [];
                        return [4 /*yield*/, this.generateFetchRequest(form, "POST", {
                                headers: headers,
                                body: content === null || content === void 0 ? void 0 : content.body
                            })];
                    case 1:
                        request = _a.sent();
                        console.debug("[binding-http]", "HttpClient (invokeResource) sending " + request.method + " " + (content ? "with '" + request.headers.get("Content-Type") + "' " : " ") + "to " + request.url);
                        return [4 /*yield*/, this.fetch(request)];
                    case 2:
                        result = _a.sent();
                        console.debug("[binding-http]", "HttpClient received " + result.status + " from " + request.url);
                        console.debug("[binding-http]", "HttpClient received Content-Type: " + result.headers.get("content-type"));
                        this.checkFetchResponse(result);
                        return [4 /*yield*/, result.buffer()];
                    case 3:
                        buffer = _a.sent();
                        return [2 /*return*/, { type: result.headers.get("content-type"), body: buffer }];
                }
            });
        });
    };
    HttpClient.prototype.unlinkResource = function (form) {
        return __awaiter(this, void 0, void 0, function () {
            var internalSub;
            return __generator(this, function (_a) {
                console.debug("[binding-http]", "HttpClient (unlinkResource) " + form.href);
                internalSub = this.activeSubscriptions.get(form.href);
                if (internalSub) {
                    this.activeSubscriptions.get(form.href).close();
                }
                else {
                    console.warn("[binding-http]", "HttpClient cannot unlink " + form.href + " no subscription found");
                }
                return [2 /*return*/, {}];
            });
        });
    };
    HttpClient.prototype.subscribeResource = function (form, next, error, complete) {
        var internalSubscription;
        if (form.subprotocol == undefined || form.subprotocol == "longpoll") {
            //longpoll or subprotocol is not defined default is longpoll
            internalSubscription = new subscription_protocols_1.LongPollingSubscription(form, this);
        }
        else if (form.subprotocol == "sse") {
            //server sent events
            internalSubscription = new subscription_protocols_1.SSESubscription(form);
        }
        internalSubscription.open(next, error, complete);
        this.activeSubscriptions.set(form.href, internalSubscription);
        return new Subscription_1.Subscription(function () { });
    };
    HttpClient.prototype.start = function () {
        return true;
    };
    HttpClient.prototype.stop = function () {
        if (this.agent && this.agent.destroy)
            this.agent.destroy(); // When running in browser mode, Agent.destroy() might not exist.
        return true;
    };
    HttpClient.prototype.setSecurity = function (metadata, credentials) {
        if (metadata === undefined || !Array.isArray(metadata) || metadata.length == 0) {
            console.warn("[binding-http]", "HttpClient without security");
            return false;
        }
        // TODO support for multiple security schemes
        var security = metadata[0];
        switch (security.scheme) {
            case "basic":
                this.credential = new credential_1.BasicCredential(credentials);
                break;
            case "bearer":
                // TODO check security.in and adjust
                this.credential = new credential_1.BearerCredential(credentials === null || credentials === void 0 ? void 0 : credentials.token);
                break;
            case "apikey":
                var securityAPIKey = security;
                this.credential = new credential_1.BasicKeyCredential(credentials === null || credentials === void 0 ? void 0 : credentials.apiKey, securityAPIKey);
                break;
            case "oauth2":
                var securityOAuth = security;
                if (securityOAuth.flow === "client_credentials") {
                    this.credential = this.oauth.handleClientCredential(securityOAuth, credentials);
                }
                else if (securityOAuth.flow === "password") {
                    this.credential = this.oauth.handleResourceOwnerCredential(securityOAuth, credentials);
                }
                break;
            case "nosec":
                break;
            case "TuyaCredential":
                var scheme = security;
                this.credential = new credential_1.TuyaCredential(scheme);
                break;
            default:
                console.error("[binding-http]", "HttpClient cannot set security scheme '" + security.scheme + "'");
                console.dir(metadata);
                return false;
        }
        if (security.proxy) {
            if (this.proxyRequest !== null) {
                console.debug("[binding-http]", "HttpClient overriding client-side proxy with security proxy '" + security.proxy);
            }
            this.proxyRequest = new node_fetch_1.Request(HttpClient.fixLocalhostName(security.proxy));
            // TODO support for different credentials at proxy and server (e.g., credentials.username vs credentials.proxy.username)
            if (security.scheme == "basic") {
                if (credentials === undefined || credentials.username === undefined || credentials.password === undefined) {
                    throw new Error("No Basic credentionals for Thing");
                }
                this.proxyRequest.headers.set('proxy-authorization', "Basic " + buffer_1.Buffer.from(credentials.username + ":" + credentials.password).toString('base64'));
            }
            else if (security.scheme == "bearer") {
                if (credentials === undefined || credentials.token === undefined) {
                    throw new Error("No Bearer credentionals for Thing");
                }
                this.proxyRequest.headers.set('proxy-authorization', "Bearer " + credentials.token);
            }
        }
        console.debug("[binding-http]", "HttpClient using security scheme '" + security.scheme + "'");
        return true;
    };
    HttpClient.prototype.generateFetchRequest = function (form, defaultMethod, additionalOptions) {
        var _a;
        if (additionalOptions === void 0) { additionalOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var requestInit, url, headers, _i, headers_1, option, option, request, parsedBaseURL;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestInit = additionalOptions;
                        url = HttpClient.fixLocalhostName(form.href);
                        requestInit.method = form["htv:methodName"] ? form["htv:methodName"] : defaultMethod;
                        requestInit.headers = (_a = requestInit.headers) !== null && _a !== void 0 ? _a : [];
                        requestInit.headers = requestInit.headers;
                        if (Array.isArray(form["htv:headers"])) {
                            console.debug("[binding-http]", "HttpClient got Form 'headers'", form["htv:headers"]);
                            headers = form["htv:headers"];
                            for (_i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                                option = headers_1[_i];
                                requestInit.headers.push([option["htv:fieldName"], option["htv:fieldValue"]]);
                            }
                        }
                        else if (typeof form["htv:headers"] === "object") {
                            console.debug("[binding-http]", "HttpClient got Form SINGLE-ENTRY 'headers'", form["htv:headers"]);
                            option = form["htv:headers"];
                            requestInit.headers.push([option["htv:fieldName"], option["htv:fieldValue"]]);
                        }
                        requestInit.agent = this.agent;
                        request = this.proxyRequest ? new node_fetch_1.Request(this.proxyRequest, requestInit) : new node_fetch_1.Request(url, requestInit);
                        if (!this.credential) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.credential.sign(request)];
                    case 1:
                        request = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (this.proxyRequest) {
                            parsedBaseURL = url_1.parse(url);
                            request.url = request.url + parsedBaseURL.path;
                            console.debug("[binding-http]", "HttpClient proxy request URL:", request.url);
                            request.headers.set("host", parsedBaseURL.hostname);
                        }
                        return [2 /*return*/, request];
                }
            });
        });
    };
    HttpClient.prototype.fetch = function (request, content) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, node_fetch_1["default"](request, { body: content === null || content === void 0 ? void 0 : content.body })];
                    case 1:
                        result = _c.sent();
                        if (!HttpClient.isOAuthTokenExpired(result, this.credential)) return [3 /*break*/, 5];
                        _a = this;
                        return [4 /*yield*/, this.credential.refreshToken()];
                    case 2:
                        _a.credential = _c.sent();
                        _b = node_fetch_1["default"];
                        return [4 /*yield*/, this.credential.sign(request)];
                    case 3: return [4 /*yield*/, _b.apply(void 0, [_c.sent()])];
                    case 4: return [2 /*return*/, _c.sent()];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    HttpClient.prototype.checkFetchResponse = function (response) {
        var statusCode = response.status;
        if (statusCode < 200) {
            throw new Error("HttpClient received " + statusCode + " and cannot continue (not implemented, open GitHub Issue)");
        }
        else if (statusCode < 300) {
            return; // No error
        }
        else if (statusCode < 400) {
            throw new Error("HttpClient received " + statusCode + " and cannot continue (not implemented, open GitHub Issue)");
        }
        else if (statusCode < 500) {
            throw new Error("Client error: " + response.statusText);
        }
        else {
            throw new Error("Server error: " + response.statusText);
        }
    };
    HttpClient.isOAuthTokenExpired = function (result, credential) {
        return result.status === 401 && credential instanceof credential_1.OAuthCredential;
    };
    HttpClient.fixLocalhostName = function (url) {
        var localhostPresent = /^(https?:)?(\/\/)?(?:[^@\n]+@)?(www\.)?(localhost)/gm;
        if (localhostPresent.test(url)) {
            console.warn("[binding-http]", "LOCALHOST FIX");
            return url.replace(localhostPresent, "$1$2127.0.0.1");
        }
        return url;
    };
    return HttpClient;
}());
exports["default"] = HttpClient;
