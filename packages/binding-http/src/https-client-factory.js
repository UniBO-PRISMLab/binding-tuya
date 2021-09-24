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
var HttpsClientFactory = /** @class */ (function () {
    function HttpsClientFactory(config) {
        if (config === void 0) { config = null; }
        this.scheme = "https";
        this.config = null;
        this.config = config;
    }
    HttpsClientFactory.prototype.getClient = function () {
        // HTTPS over HTTP proxy requires HttpClient
        if (this.config && this.config.proxy && this.config.proxy.href && this.config.proxy.href.startsWith("http:")) {
            console.warn("\"[binding-http]\",HttpsClientFactory creating client for 'http' due to insecure proxy configuration");
            return new http_client_1["default"](this.config);
        }
        else {
            console.debug("[binding-http]", "HttpsClientFactory creating client for '" + this.scheme + "'");
            return new http_client_1["default"](this.config, true);
        }
    };
    HttpsClientFactory.prototype.init = function () {
        // console.info(`HttpsClientFactory for '${HttpsClientFactory.scheme}' initializing`);
        // TODO uncomment info if something is executed here
        return true;
    };
    HttpsClientFactory.prototype.destroy = function () {
        // console.info(`HttpsClientFactory for '${HttpsClientFactory.scheme}' destroyed`);
        // TODO uncomment info if something is executed here
        return true;
    };
    return HttpsClientFactory;
}());
exports["default"] = HttpsClientFactory;
