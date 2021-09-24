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
exports.__esModule = true;
var ClientOAuth2 = require("client-oauth2");
var https_1 = require("https");
var url_1 = require("url");
var credential_1 = require("./credential");
function createRequestFunction(rejectUnauthorized) {
    //TODO: Does not work inside a browser
    return function (method, url, body, headers) {
        return new Promise(function (resolve, reject) {
            var parsedURL = url_1.parse(url);
            var options = {
                method: method,
                host: parsedURL.hostname,
                port: parseInt(parsedURL.port),
                path: parsedURL.path,
                headers: headers
            };
            options.rejectUnauthorized = rejectUnauthorized;
            var req = https_1.request(options);
            req.on("response", function (response) {
                response.setEncoding('utf8');
                var body = [];
                response.on('data', function (data) { body.push(data); });
                response.on('end', function () {
                    resolve({
                        status: response.statusCode,
                        body: body.toString()
                    });
                });
            });
            req.on("error", function (er) {
                reject(er);
            });
            req.write(body);
            req.end();
        });
    };
}
var OAuthManager = /** @class */ (function () {
    function OAuthManager() {
        this.tokenStore = new Map();
    }
    OAuthManager.prototype.handleClientCredential = function (securityScheme, credentials) {
        var clientFlow = new ClientOAuth2({
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
            accessTokenUri: securityScheme.token,
            scopes: securityScheme.scopes,
            body: {
            // TODO: some server implementation may require client_id and secret inside
            // the request body
            // client_id: credentials.clientId,
            //  client_secret: credentials.clientSecret
            }
        }, createRequestFunction(false));
        var token = clientFlow.credentials.getToken();
        return new credential_1.OAuthCredential(token, clientFlow.credentials.getToken.bind(clientFlow.credentials));
    };
    OAuthManager.prototype.handleResourceOwnerCredential = function (securityScheme, credentials) {
        var clientFlow = new ClientOAuth2({
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
            accessTokenUri: securityScheme.token,
            scopes: securityScheme.scopes
        }, createRequestFunction(false));
        var token = clientFlow.owner.getToken(credentials.username, credentials.password);
        return new credential_1.OAuthCredential(token);
    };
    return OAuthManager;
}());
exports["default"] = OAuthManager;
