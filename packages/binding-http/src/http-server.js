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
 * HTTP Server based on http
 */
var fs = require("fs");
var http = require("http");
var https = require("https");
var bauth = require("basic-auth");
var url = require("url");
var TD = require("@node-wot/td-tools");
var core_1 = require("@node-wot/core");
var oauth_token_validation_1 = require("./oauth-token-validation");
var HttpServer = /** @class */ (function () {
    function HttpServer(config) {
        var _this = this;
        if (config === void 0) { config = {}; }
        var _a;
        this.ALL_DIR = "all";
        this.ALL_PROPERTIES = "properties";
        this.PROPERTY_DIR = "properties";
        this.ACTION_DIR = "actions";
        this.EVENT_DIR = "events";
        this.OBSERVABLE_DIR = "observable";
        // private readonly OPTIONS_URI_VARIABLES ='uriVariables';
        // private readonly OPTIONS_BODY_VARIABLES ='body';
        this.port = 8080;
        this.address = undefined;
        this.baseUri = undefined;
        this.httpSecurityScheme = "NoSec"; // HTTP header compatible string
        this.validOAuthClients = /.*/g;
        this.server = null;
        this.things = new Map();
        this.servient = null;
        if (typeof config !== "object") {
            throw new Error("HttpServer requires config object (got " + typeof config + ")");
        }
        if (config.port !== undefined) {
            this.port = config.port;
        }
        var environmentObj = ['WOT_PORT', 'PORT']
            .map(function (envVar) { return { key: envVar, value: process.env[envVar] }; })
            .find(function (envObj) { return envObj.value != null; });
        if (environmentObj) {
            console.info("[binding-http]", "HttpServer Port Overridden to " + environmentObj.value + " by Environment Variable " + environmentObj.key);
            this.port = +environmentObj.value;
        }
        if (config.address !== undefined) {
            this.address = config.address;
        }
        if (config.baseUri !== undefined) {
            this.baseUri = config.baseUri;
        }
        // TLS
        if (config.serverKey && config.serverCert) {
            var options = {};
            options.key = fs.readFileSync(config.serverKey);
            options.cert = fs.readFileSync(config.serverCert);
            this.scheme = "https";
            this.server = https.createServer(options, function (req, res) { _this.handleRequest(req, res); });
        }
        else {
            this.scheme = "http";
            this.server = http.createServer(function (req, res) { _this.handleRequest(req, res); });
        }
        // Auth
        if (config.security) {
            // storing HTTP header compatible string
            switch (config.security.scheme) {
                case "nosec":
                    this.httpSecurityScheme = "NoSec";
                    break;
                case "basic":
                    this.httpSecurityScheme = "Basic";
                    break;
                case "digest":
                    this.httpSecurityScheme = "Digest";
                    break;
                case "bearer":
                    this.httpSecurityScheme = "Bearer";
                    break;
                case "oauth2":
                    this.httpSecurityScheme = "OAuth";
                    var oAuthConfig = config.security;
                    this.validOAuthClients = new RegExp((_a = oAuthConfig.allowedClients) !== null && _a !== void 0 ? _a : ".*");
                    this.oAuthValidator = oauth_token_validation_1["default"](oAuthConfig.method);
                    break;
                default:
                    throw new Error("HttpServer does not support security scheme '" + config.security.scheme);
            }
        }
    }
    HttpServer.prototype.start = function (servient) {
        var _this = this;
        console.info("[binding-http]", "HttpServer starting on " + (this.address !== undefined ? this.address + ' ' : '') + "port " + this.port);
        return new Promise(function (resolve, reject) {
            // store servient to get credentials
            _this.servient = servient;
            // long timeout for long polling
            _this.server.setTimeout(60 * 60 * 1000, function () { console.debug("[binding-http]", "HttpServer on port " + _this.getPort() + " timed out connection"); });
            // no keep-alive because NodeJS HTTP clients do not properly use same socket due to pooling
            _this.server.keepAliveTimeout = 0;
            // start promise handles all errors until successful start
            _this.server.once('error', function (err) { reject(err); });
            _this.server.once('listening', function () {
                // once started, console "handles" errors
                _this.server.on('error', function (err) {
                    console.error("[binding-http]", "HttpServer on port " + _this.port + " failed: " + err.message);
                });
                resolve();
            });
            _this.server.listen(_this.port, _this.address);
        });
    };
    HttpServer.prototype.stop = function () {
        var _this = this;
        console.info("[binding-http]", "HttpServer stopping on port " + this.getPort());
        return new Promise(function (resolve, reject) {
            // stop promise handles all errors from now on
            _this.server.once('error', function (err) { reject(err); });
            _this.server.once('close', function () { resolve(); });
            _this.server.close();
        });
    };
    /** returns http.Server to be re-used by other HTTP-based bindings (e.g., WebSockets) */
    HttpServer.prototype.getServer = function () {
        return this.server;
    };
    /** returns server port number and indicates that server is running when larger than -1  */
    HttpServer.prototype.getPort = function () {
        if (this.server.address() && typeof this.server.address() === "object") {
            return this.server.address().port;
        }
        else {
            // includes address() typeof "string" case, which is only for unix sockets
            return -1;
        }
    };
    HttpServer.prototype.getHttpSecurityScheme = function () {
        return this.httpSecurityScheme;
    };
    HttpServer.prototype.updateInteractionNameWithUriVariablePattern = function (interactionName, uriVariables) {
        if (uriVariables && Object.keys(uriVariables).length > 0) {
            var pattern = "{?";
            var index = 0;
            for (var key in uriVariables) {
                if (index != 0) {
                    pattern += ",";
                }
                pattern += encodeURIComponent(key);
                index++;
            }
            pattern += "}";
            return encodeURIComponent(interactionName) + pattern;
        }
        else {
            return encodeURIComponent(interactionName);
        }
    };
    HttpServer.prototype.expose = function (thing, tdTemplate) {
        var slugify = require('slugify');
        var urlPath = slugify(thing.title, { lower: true });
        if (this.things.has(urlPath)) {
            urlPath = core_1.Helpers.generateUniqueName(urlPath);
        }
        if (this.getPort() !== -1) {
            console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " exposes '" + thing.title + "' as unique '/" + urlPath + "'");
            this.things.set(urlPath, thing);
            if (this.baseUri !== undefined) {
                var base = this.baseUri.concat("/", encodeURIComponent(urlPath));
                console.info("[binding-http]", "HttpServer TD hrefs using baseUri " + this.baseUri);
                this.addEndpoint(thing, tdTemplate, base);
            }
            else {
                // fill in binding data
                for (var _i = 0, _a = core_1.Helpers.getAddresses(); _i < _a.length; _i++) {
                    var address = _a[_i];
                    var base = this.scheme + "://" + address + ":" + this.getPort() + "/" + encodeURIComponent(urlPath);
                    this.addEndpoint(thing, tdTemplate, base);
                    // media types
                } // addresses
                if (this.scheme === "https") {
                    this.fillSecurityScheme(thing);
                }
                return new Promise(function (resolve, reject) {
                    resolve();
                });
            }
        }
    };
    HttpServer.prototype.destroy = function (thingId) {
        var _this = this;
        console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " destroying thingId '" + thingId + "'");
        return new Promise(function (resolve, reject) {
            var removedThing = undefined;
            for (var _i = 0, _a = Array.from(_this.things.keys()); _i < _a.length; _i++) {
                var name_1 = _a[_i];
                var expThing = _this.things.get(name_1);
                if ((expThing === null || expThing === void 0 ? void 0 : expThing.id) === thingId) {
                    _this.things["delete"](name_1);
                    removedThing = expThing;
                }
            }
            if (removedThing) {
                console.info("[binding-http]", "HttpServer succesfully destroyed '" + removedThing.title + "'");
            }
            else {
                console.info("[binding-http]", "HttpServer failed to destroy thing with thingId '" + thingId + "'");
            }
            resolve(removedThing != undefined);
        });
    };
    HttpServer.prototype.addEndpoint = function (thing, tdTemplate, base) {
        for (var _i = 0, _a = core_1.ContentSerdes.get().getOfferedMediaTypes(); _i < _a.length; _i++) {
            var type = _a[_i];
            var allReadOnly = true;
            var allWriteOnly = true;
            var anyProperties = false;
            for (var propertyName in thing.properties) {
                anyProperties = true;
                if (!thing.properties[propertyName].readOnly) {
                    allReadOnly = false;
                }
                else if (!thing.properties[propertyName].writeOnly) {
                    allWriteOnly = false;
                }
            }
            if (anyProperties) {
                var href = base + "/" + this.ALL_DIR + "/" + encodeURIComponent(this.ALL_PROPERTIES);
                var form = new TD.Form(href, type);
                if (allReadOnly) {
                    form.op = ["readallproperties", "readmultipleproperties"];
                }
                else if (allWriteOnly) {
                    form.op = ["writeallproperties", "writemultipleproperties"];
                }
                else {
                    form.op = ["readallproperties", "readmultipleproperties", "writeallproperties", "writemultipleproperties"];
                }
                if (!thing.forms) {
                    thing.forms = [];
                }
                thing.forms.push(form);
            }
            for (var propertyName in thing.properties) {
                var propertyNamePattern = this.updateInteractionNameWithUriVariablePattern(propertyName, thing.properties[propertyName].uriVariables);
                var href = base + "/" + this.PROPERTY_DIR + "/" + propertyNamePattern;
                var form = new TD.Form(href, type);
                core_1.ProtocolHelpers.updatePropertyFormWithTemplate(form, tdTemplate, propertyName);
                if (thing.properties[propertyName].readOnly) {
                    form.op = ["readproperty"];
                    var hform = form;
                    if (hform["htv:methodName"] === undefined) {
                        hform["htv:methodName"] = "GET";
                    }
                }
                else if (thing.properties[propertyName].writeOnly) {
                    form.op = ["writeproperty"];
                    var hform = form;
                    if (hform["htv:methodName"] === undefined) {
                        hform["htv:methodName"] = "PUT";
                    }
                }
                else {
                    form.op = ["readproperty", "writeproperty"];
                }
                thing.properties[propertyName].forms.push(form);
                console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " assigns '" + href + "' to Property '" + propertyName + "'");
                // if property is observable add an additional form with a observable href
                if (thing.properties[propertyName].observable) {
                    var href_1 = base + "/" + this.PROPERTY_DIR + "/" + encodeURIComponent(propertyName) + "/" + this.OBSERVABLE_DIR;
                    var form_1 = new TD.Form(href_1, type);
                    form_1.op = ["observeproperty", "unobserveproperty"];
                    form_1.subprotocol = "longpoll";
                    thing.properties[propertyName].forms.push(form_1);
                    console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " assigns '" + href_1 + "' to observable Property '" + propertyName + "'");
                }
            }
            for (var actionName in thing.actions) {
                var actionNamePattern = this.updateInteractionNameWithUriVariablePattern(actionName, thing.actions[actionName].uriVariables);
                var href = base + "/" + this.ACTION_DIR + "/" + actionNamePattern;
                var form = new TD.Form(href, type);
                core_1.ProtocolHelpers.updateActionFormWithTemplate(form, tdTemplate, actionName);
                form.op = ["invokeaction"];
                var hform = form;
                if (hform["htv:methodName"] === undefined) {
                    hform["htv:methodName"] = "POST";
                }
                thing.actions[actionName].forms.push(form);
                console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " assigns '" + href + "' to Action '" + actionName + "'");
            }
            for (var eventName in thing.events) {
                var eventNamePattern = this.updateInteractionNameWithUriVariablePattern(eventName, thing.events[eventName].uriVariables);
                var href = base + "/" + this.EVENT_DIR + "/" + eventNamePattern;
                var form = new TD.Form(href, type);
                core_1.ProtocolHelpers.updateEventFormWithTemplate(form, tdTemplate, eventName);
                form.subprotocol = "longpoll";
                form.op = ["subscribeevent", "unsubscribeevent"];
                thing.events[eventName].forms.push(form);
                console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " assigns '" + href + "' to Event '" + eventName + "'");
            }
        }
    };
    HttpServer.prototype.checkCredentials = function (thing, req) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var creds, _b, basic, oAuthScheme, scopes, valid, error_1, auth;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " checking credentials for '" + thing.id + "'");
                        creds = this.servient.getCredentials(thing.id);
                        _b = this.httpSecurityScheme;
                        switch (_b) {
                            case "NoSec": return [3 /*break*/, 1];
                            case "Basic": return [3 /*break*/, 2];
                            case "Digest": return [3 /*break*/, 3];
                            case "OAuth": return [3 /*break*/, 4];
                            case "Bearer": return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 10];
                    case 1: return [2 /*return*/, true];
                    case 2:
                        basic = bauth(req);
                        return [2 /*return*/, (creds !== undefined) &&
                                (basic !== undefined) &&
                                (basic.name === creds.username && basic.pass === creds.password)];
                    case 3: return [2 /*return*/, false];
                    case 4:
                        oAuthScheme = thing.securityDefinitions[thing.security[0]];
                        scopes = (_a = oAuthScheme.scopes) !== null && _a !== void 0 ? _a : [];
                        valid = false;
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.oAuthValidator.validate(req, scopes, this.validOAuthClients)];
                    case 6:
                        valid = _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _c.sent();
                        // TODO: should we answer differently to the client if something went wrong?
                        console.error("OAuth authorization error; sending unauthorized response error");
                        console.error("this was possibly caused by a misconfiguration of the server");
                        console.error(error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, valid];
                    case 9:
                        if (req.headers["authorization"] === undefined)
                            return [2 /*return*/, false];
                        auth = req.headers["authorization"].split(" ");
                        return [2 /*return*/, (auth[0] === "Bearer") &&
                                (creds !== undefined) &&
                                (auth[1] === creds.token)];
                    case 10: return [2 /*return*/, false];
                }
            });
        });
    };
    HttpServer.prototype.fillSecurityScheme = function (thing) {
        var _this = this;
        if (thing.securityDefinitions) {
            var secCandidate = Object.keys(thing.securityDefinitions).find(function (key) {
                var scheme = thing.securityDefinitions[key].scheme;
                // HTTP Authentication Scheme for OAuth does not contain the version number
                // see https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
                // remove version number for oauth2 schemes
                scheme = scheme === "oauth2" ? scheme.split("2")[0] : scheme;
                return scheme === _this.httpSecurityScheme.toLowerCase();
            });
            if (!secCandidate) {
                throw new Error("Servient does not support thing security schemes. Current scheme supported: " + this.httpSecurityScheme);
            }
            var selectedSecurityScheme = thing.securityDefinitions[secCandidate];
            thing.securityDefinitions = {};
            thing.securityDefinitions[secCandidate] = selectedSecurityScheme;
            thing.security = [secCandidate];
        }
        else {
            thing.securityDefinitions = {
                "noSec": { scheme: "nosec" }
            };
            thing.security = ["noSec"];
        }
    };
    HttpServer.prototype.parseUrlParameters = function (url, uriVariables) {
        var params = {};
        if (url == null || !uriVariables) {
            return params;
        }
        var queryparams = url.split('?')[1];
        if (queryparams == null) {
            return params;
        }
        var queries = queryparams.split("&");
        queries.forEach(function (indexQuery) {
            var indexPair = indexQuery.split("=");
            var queryKey = decodeURIComponent(indexPair[0]);
            var queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "");
            if (uriVariables[queryKey]) {
                if (uriVariables[queryKey].type === "integer" || uriVariables[queryKey].type === "number") {
                    // *cast* it to number
                    params[queryKey] = +queryValue;
                }
                else {
                    params[queryKey] = queryValue;
                }
            }
        });
        return params;
    };
    HttpServer.prototype.handleRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            // Handle requests where the path is correct and the HTTP method is not allowed.
            function respondUnallowedMethod(res, allowed) {
                // Always allow OPTIONS to handle CORS pre-flight requests
                if (!allowed.includes("OPTIONS")) {
                    allowed += ", OPTIONS";
                }
                if (req.method === "OPTIONS" && req.headers["origin"] && req.headers["access-control-request-method"]) {
                    console.debug("[binding-http]", "HttpServer received an CORS preflight request from " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
                    res.setHeader("Access-Control-Allow-Methods", allowed);
                    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, *");
                    res.writeHead(200);
                    res.end();
                }
                else {
                    res.setHeader("Allow", allowed);
                    res.writeHead(405);
                    res.end("Method Not Allowed");
                }
            }
            var requestUri, contentTypeHeader, contentType, segments, list, _i, _a, address, _b, _c, name_2, thing_1, td, alparser, supportedLanguagesArray, lang, prefLang, _d, property_1, options_1, uriVariables, body_1, action_1, body_2, event_1, options, uriVariables;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        requestUri = url.parse(req.url);
                        console.debug("[binding-http]", "HttpServer on port " + this.getPort() + " received '" + req.method + " " + requestUri.pathname + "' from " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
                        res.on("finish", function () {
                            console.debug("[binding-http]", "HttpServer on port " + _this.getPort() + " replied with '" + res.statusCode + "' to " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
                        });
                        // Set CORS headers
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        contentTypeHeader = req.headers["content-type"];
                        contentType = Array.isArray(contentTypeHeader) ? contentTypeHeader[0] : contentTypeHeader;
                        if (req.method === "PUT" || req.method === "POST") {
                            if (!contentType) {
                                // FIXME should be rejected with 400 Bad Request, as guessing is not good in M2M -> debug/testing flag to allow
                                // FIXME would need to check if payload is present
                                console.warn("[binding-http]", "HttpServer on port " + this.getPort() + " received no Content-Type from " + core_1.Helpers.toUriLiteral(req.socket.remoteAddress) + ":" + req.socket.remotePort);
                                contentType = core_1.ContentSerdes.DEFAULT;
                            }
                            else if (core_1.ContentSerdes.get().getSupportedMediaTypes().indexOf(core_1.ContentSerdes.getMediaType(contentType)) < 0) {
                                res.writeHead(415);
                                res.end("Unsupported Media Type");
                                return [2 /*return*/];
                            }
                        }
                        try {
                            segments = decodeURI(requestUri.pathname).split("/");
                        }
                        catch (ex) {
                            // catch URIError, see https://github.com/eclipse/thingweb.node-wot/issues/389
                            console.warn("[binding-http]", "HttpServer on port " + this.getPort() + " cannot decode URI for '" + requestUri.pathname + "'");
                            res.writeHead(400);
                            res.end("decodeURI error for " + requestUri.pathname);
                            return [2 /*return*/];
                        }
                        if (!(segments[1] === "")) return [3 /*break*/, 1];
                        // no path -> list all Things
                        if (req.method === "GET") {
                            res.setHeader("Content-Type", core_1.ContentSerdes.DEFAULT);
                            res.writeHead(200);
                            list = [];
                            for (_i = 0, _a = core_1.Helpers.getAddresses(); _i < _a.length; _i++) {
                                address = _a[_i];
                                // FIXME are Iterables really such a non-feature that I need array?
                                for (_b = 0, _c = Array.from(this.things.keys()); _b < _c.length; _b++) {
                                    name_2 = _c[_b];
                                    // FIXME the undefined check should NOT be necessary (however there seems to be null in it)
                                    if (name_2) {
                                        list.push(this.scheme + "://" + core_1.Helpers.toUriLiteral(address) + ":" + this.getPort() + "/" + encodeURIComponent(name_2));
                                    }
                                }
                            }
                            res.end(JSON.stringify(list));
                        }
                        else {
                            respondUnallowedMethod(res, "GET");
                        }
                        // resource found and response sent
                        return [2 /*return*/];
                    case 1:
                        thing_1 = this.things.get(segments[1]);
                        if (!thing_1) return [3 /*break*/, 5];
                        if (!(segments.length === 2 || segments[2] === "")) return [3 /*break*/, 2];
                        // Thing root -> send TD
                        if (req.method === "GET") {
                            td = thing_1.getThingDescription();
                            // look for language negotiation through the Accept-Language header field of HTTP (e.g., "de", "de-CH", "en-US,en;q=0.5")
                            // Note: "title" on thing level is mandatory term --> check whether "titles" exists for multi-languages
                            // Note: HTTP header names are case-insensitive and req.headers seems to contain them in lowercase
                            if (req.headers["accept-language"] && req.headers["accept-language"] != "*") {
                                if (thing_1.titles) {
                                    alparser = require('accept-language-parser');
                                    supportedLanguagesArray = [];
                                    // collect supported languages by checking titles (given title is the only mandatory multi-lang term)
                                    for (lang in thing_1.titles) {
                                        supportedLanguagesArray.push(lang);
                                    }
                                    prefLang = alparser.pick(supportedLanguagesArray, req.headers["accept-language"], { loose: true });
                                    if (prefLang) {
                                        // if a preferred language can be found use it
                                        console.debug("[binding-http]", "TD language negotiation through the Accept-Language header field of HTTP leads to \"" + prefLang + "\"");
                                        this.resetMultiLangThing(td, prefLang);
                                    }
                                }
                            }
                            res.setHeader("Content-Type", core_1.ContentSerdes.TD);
                            res.writeHead(200);
                            res.end(JSON.stringify(td));
                        }
                        else {
                            respondUnallowedMethod(res, "GET");
                        }
                        // resource found and response sent
                        return [2 /*return*/];
                    case 2:
                        _d = this.httpSecurityScheme !== "NoSec";
                        if (!_d) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.checkCredentials(thing_1, req)];
                    case 3:
                        _d = !(_e.sent());
                        _e.label = 4;
                    case 4:
                        // Thing Interaction - Access Control
                        if (_d) {
                            res.setHeader("WWW-Authenticate", this.httpSecurityScheme + " realm=\"" + thing_1.id + "\"");
                            res.writeHead(401);
                            res.end();
                            return [2 /*return*/];
                        }
                        if (segments[2] === this.ALL_DIR) {
                            if (this.ALL_PROPERTIES == segments[3]) {
                                if (req.method === "GET") {
                                    thing_1.readAllProperties()
                                        .then(function (value) {
                                        var content = core_1.ContentSerdes.get().valueToContent(value, undefined); // contentType handling? <any>property);
                                        res.setHeader("Content-Type", content.type);
                                        res.writeHead(200);
                                        res.end(content.body);
                                    })["catch"](function (err) {
                                        console.error("[binding-http]", "HttpServer on port " + _this.getPort() + " got internal error on read '" + requestUri.pathname + "': " + err.message);
                                        res.writeHead(500);
                                        res.end(err.message);
                                    });
                                }
                                else {
                                    respondUnallowedMethod(res, "GET");
                                }
                                // resource found and response sent
                                return [2 /*return*/];
                            }
                        }
                        else if (segments[2] === this.PROPERTY_DIR) {
                            property_1 = thing_1.properties[segments[3]];
                            if (property_1) {
                                uriVariables = this.parseUrlParameters(req.url, property_1.uriVariables);
                                if (!this.isEmpty(uriVariables)) {
                                    options_1 = { uriVariables: uriVariables };
                                }
                                if (req.method === "GET") {
                                    // check if this an observable request (longpoll)
                                    if (segments[4] === this.OBSERVABLE_DIR) {
                                        // FIXME must decide on Content-Type here, not on next()
                                        res.setHeader("Content-Type", core_1.ContentSerdes.DEFAULT);
                                        res.writeHead(200);
                                        thing_1.observeProperty(segments[3], function (data) {
                                            var content;
                                            try {
                                                var contentType_1 = core_1.ProtocolHelpers.getPropertyContentType(thing_1.getThingDescription(), segments[3], "http");
                                                content = core_1.ContentSerdes.get().valueToContent(data, property_1.data, contentType_1);
                                            }
                                            catch (err) {
                                                console.warn("[binding-http]", "HttpServer on port " + _this.getPort() + " cannot process data for Event '" + segments[3] + ": " + err.message + "'");
                                                res.writeHead(500);
                                                res.end("Invalid Event Data");
                                                return;
                                            }
                                            // send event data
                                            res.end(content.body);
                                        }, options_1)
                                            .then(function () { return res.end(); })["catch"](function () { return res.end(); });
                                        res.on("finish", function () {
                                            console.debug("[binding-http]", "HttpServer on port " + _this.getPort() + " closed connection");
                                            thing_1.unobserveProperty(segments[3]);
                                        });
                                        res.setTimeout(60 * 60 * 1000, function () { return thing_1.unobserveProperty(segments[3]); });
                                    }
                                    else {
                                        thing_1.readProperty(segments[3], options_1)
                                            // property.read(options)
                                            .then(function (value) {
                                            var contentType = core_1.ProtocolHelpers.getPropertyContentType(thing_1.getThingDescription(), segments[3], "http");
                                            var content = core_1.ContentSerdes.get().valueToContent(value, property_1, contentType);
                                            res.setHeader("Content-Type", content.type);
                                            res.writeHead(200);
                                            res.end(content.body);
                                        })["catch"](function (err) {
                                            console.error("[binding-http]", "HttpServer on port " + _this.getPort() + " got internal error on read '" + requestUri.pathname + "': " + err.message);
                                            res.writeHead(500);
                                            res.end(err.message);
                                        });
                                    }
                                }
                                else if (req.method === "PUT") {
                                    if (!property_1.readOnly) {
                                        body_1 = [];
                                        req.on("data", function (data) { body_1.push(data); });
                                        req.on("end", function () {
                                            console.debug("[binding-http]", "HttpServer on port " + _this.getPort() + " completed body '" + body_1 + "'");
                                            var value;
                                            try {
                                                value = core_1.ContentSerdes.get().contentToValue({ type: contentType, body: Buffer.concat(body_1) }, property_1);
                                            }
                                            catch (err) {
                                                console.warn("[binding-http]", "HttpServer on port " + _this.getPort() + " cannot process write value for Property '" + segments[3] + ": " + err.message + "'");
                                                res.writeHead(400);
                                                res.end("Invalid Data");
                                                return;
                                            }
                                            thing_1.writeProperty(segments[3], value, options_1)
                                                // property.write(value, options)
                                                .then(function () {
                                                res.writeHead(204);
                                                res.end("Changed");
                                            })["catch"](function (err) {
                                                console.error("[binding-http]", "HttpServer on port " + _this.getPort() + " got internal error on write '" + requestUri.pathname + "': " + err.message);
                                                res.writeHead(500);
                                                res.end(err.message);
                                            });
                                        });
                                    }
                                    else {
                                        res.writeHead(400);
                                        res.end("Property readOnly");
                                    }
                                }
                                else {
                                    respondUnallowedMethod(res, "GET, PUT");
                                }
                                // resource found and response sent
                                return [2 /*return*/];
                            } // Property exists?
                        }
                        else if (segments[2] === this.ACTION_DIR) {
                            action_1 = thing_1.actions[segments[3]];
                            if (action_1) {
                                if (req.method === "POST") {
                                    body_2 = [];
                                    req.on("data", function (data) { body_2.push(data); });
                                    req.on("end", function () {
                                        console.debug("[binding-http]", "HttpServer on port " + _this.getPort() + " completed body '" + body_2 + "'");
                                        var input;
                                        try {
                                            input = core_1.ContentSerdes.get().contentToValue({ type: contentType, body: Buffer.concat(body_2) }, action_1.input);
                                        }
                                        catch (err) {
                                            console.warn("[binding-http]", "HttpServer on port " + _this.getPort() + " cannot process input to Action '" + segments[3] + ": " + err.message + "'");
                                            res.writeHead(400);
                                            res.end("Invalid Input Data");
                                            return;
                                        }
                                        var options;
                                        var uriVariables = _this.parseUrlParameters(req.url, action_1.uriVariables);
                                        if (!_this.isEmpty(uriVariables)) {
                                            options = { uriVariables: uriVariables };
                                        }
                                        thing_1.invokeAction(segments[3], input, options)
                                            // action.invoke(input, options)
                                            .then(function (output) {
                                            if (output) {
                                                var contentType_2 = core_1.ProtocolHelpers.getActionContentType(thing_1.getThingDescription(), segments[3], "http");
                                                var content = core_1.ContentSerdes.get().valueToContent(output, action_1.output, contentType_2);
                                                res.setHeader("Content-Type", content.type);
                                                res.writeHead(200);
                                                res.end(content.body);
                                            }
                                            else {
                                                res.writeHead(200);
                                                res.end();
                                            }
                                        })["catch"](function (err) {
                                            console.error("[binding-http]", "HttpServer on port " + _this.getPort() + " got internal error on invoke '" + requestUri.pathname + "': " + err.message);
                                            res.writeHead(500);
                                            res.end(err.message);
                                        });
                                    });
                                }
                                else {
                                    respondUnallowedMethod(res, "POST");
                                }
                                // resource found and response sent
                                return [2 /*return*/];
                            } // Action exists?
                        }
                        else if (segments[2] === this.EVENT_DIR) {
                            event_1 = thing_1.events[segments[3]];
                            if (event_1) {
                                if (req.method === "GET") {
                                    // FIXME must decide on Content-Type here, not on next()
                                    res.setHeader("Content-Type", core_1.ContentSerdes.DEFAULT);
                                    res.writeHead(200);
                                    options = void 0;
                                    uriVariables = this.parseUrlParameters(req.url, event_1.uriVariables);
                                    if (!this.isEmpty(uriVariables)) {
                                        options = { uriVariables: uriVariables };
                                    }
                                    thing_1.subscribeEvent(segments[3], 
                                    // let subscription = event.subscribe(
                                    function (data) {
                                        var content;
                                        try {
                                            var contentType_3 = core_1.ProtocolHelpers.getEventContentType(thing_1.getThingDescription(), segments[3], "http");
                                            content = core_1.ContentSerdes.get().valueToContent(data, event_1.data, contentType_3);
                                        }
                                        catch (err) {
                                            console.warn("[binding-http]", "HttpServer on port " + _this.getPort() + " cannot process data for Event '" + segments[3] + ": " + err.message + "'");
                                            res.writeHead(500);
                                            res.end("Invalid Event Data");
                                            return;
                                        }
                                        // send event data
                                        res.end(content.body);
                                    }, options)
                                        .then(function () { return res.end(); })["catch"](function () { return res.end(); });
                                    res.on("finish", function () {
                                        console.debug("[binding-http]", "HttpServer on port " + _this.getPort() + " closed Event connection");
                                        // subscription.unsubscribe();
                                        thing_1.unsubscribeEvent(segments[3]);
                                    });
                                    res.setTimeout(60 * 60 * 1000, function () { return thing_1.unsubscribeEvent(segments[3]); }); // subscription.unsubscribe());
                                }
                                else {
                                    respondUnallowedMethod(res, "GET");
                                }
                                // resource found and response sent
                                return [2 /*return*/];
                            } // Event exists?
                        }
                        _e.label = 5;
                    case 5:
                        // resource not found
                        res.writeHead(404);
                        res.end("Not Found");
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpServer.prototype.isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };
    HttpServer.prototype.resetMultiLangThing = function (thing, prefLang) {
        // TODO can we reset "title" to another name given that title is used in URI creation?
        // update/set @language in @context
        if (thing["@context"] && Array.isArray(thing["@context"])) {
            var arrayContext = thing["@context"];
            var languageSet = false;
            for (var _i = 0, arrayContext_1 = arrayContext; _i < arrayContext_1.length; _i++) {
                var arrayEntry = arrayContext_1[_i];
                if (arrayEntry instanceof Object) {
                    if (arrayEntry["@language"] !== undefined) {
                        arrayEntry["@language"] = prefLang;
                        languageSet = true;
                    }
                }
            }
            if (!languageSet) {
                arrayContext.push({
                    "@language": prefLang
                });
            }
        }
        // use new language title
        if (thing["titles"]) {
            for (var titleLang in thing["titles"]) {
                if (titleLang.startsWith(prefLang)) {
                    thing["title"] = thing["titles"][titleLang];
                }
            }
        }
        // use new language description
        if (thing["descriptions"]) {
            for (var titleLang in thing["descriptions"]) {
                if (titleLang.startsWith(prefLang)) {
                    thing["description"] = thing["descriptions"][titleLang];
                }
            }
        }
        // remove any titles or descriptions and update title / description accordingly
        delete thing["titles"];
        delete thing["descriptions"];
        // reset multi-language terms for interactions
        this.resetMultiLangInteraction(thing.properties, prefLang);
        this.resetMultiLangInteraction(thing.actions, prefLang);
        this.resetMultiLangInteraction(thing.events, prefLang);
    };
    HttpServer.prototype.resetMultiLangInteraction = function (interactions, prefLang) {
        if (interactions) {
            for (var interName in interactions) {
                // unset any current title and/or description
                delete interactions[interName]["title"];
                delete interactions[interName]["description"];
                // use new language title
                if (interactions[interName]["titles"]) {
                    for (var titleLang in interactions[interName]["titles"]) {
                        if (titleLang.startsWith(prefLang)) {
                            interactions[interName]["title"] = interactions[interName]["titles"][titleLang];
                        }
                    }
                }
                // use new language description
                if (interactions[interName]["descriptions"]) {
                    for (var descLang in interactions[interName]["descriptions"]) {
                        if (descLang.startsWith(prefLang)) {
                            interactions[interName]["description"] = interactions[interName]["descriptions"][descLang];
                        }
                    }
                }
                // unset any multilanguage titles and/or descriptions
                delete interactions[interName]["titles"];
                delete interactions[interName]["descriptions"];
            }
        }
    };
    return HttpServer;
}());
exports["default"] = HttpServer;
