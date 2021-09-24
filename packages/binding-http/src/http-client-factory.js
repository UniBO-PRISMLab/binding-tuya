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
exports.__esModule = true;
var http_client_1 = require("./http-client");
var oauth_manager_1 = require("./oauth-manager");
var HttpClientFactory = /** @class */ (function () {
    function HttpClientFactory(config) {
        if (config === void 0) { config = null; }
        this.scheme = "http";
        this.config = null;
        this.oAuthManager = new oauth_manager_1["default"]();
        this.config = config;
    }
    HttpClientFactory.prototype.getClient = function () {
        // HTTP over HTTPS proxy requires HttpsClient
        if (this.config && this.config.proxy && this.config.proxy.href && this.config.proxy.href.startsWith("https:")) {
            console.warn("[binding-http]", "HttpClientFactory creating client for 'https' due to secure proxy configuration");
            return new http_client_1["default"](this.config, true, this.oAuthManager);
        }
        else {
            console.debug("[binding-http]", "HttpClientFactory creating client for '" + this.scheme + "'");
            return new http_client_1["default"](this.config);
        }
    };
    HttpClientFactory.prototype.init = function () {
        // console.info(`HttpClientFactory for '${HttpClientFactory.scheme}' initializing`);
        // TODO uncomment info if something is executed here
        return true;
    };
    HttpClientFactory.prototype.destroy = function () {
        // console.info(`HttpClientFactory for '${HttpClientFactory.scheme}' destroyed`);
        // TODO uncomment info if something is executed here
        return true;
    };
    return HttpClientFactory;
}());
exports["default"] = HttpClientFactory;
