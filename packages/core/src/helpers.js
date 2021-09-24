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
/**
 * Generic helper functions used across the code
 * These Helpers are used like this:
 * ```
 * import Helpers from "@node-wot/core"
 *
 * ...
 * Helpers.foo(bar)
 * ...
 * ```
 */
var url = require("url");
var os = require("os");
var TD = require("@node-wot/td-tools");
var content_serdes_1 = require("./content-serdes");
var Helpers = /** @class */ (function () {
    function Helpers(srv) {
        this.srv = srv;
    }
    Helpers.extractScheme = function (uri) {
        var parsed = url.parse(uri);
        // console.log(parsed)
        // remove trailing ':'
        if (parsed.protocol === null) {
            throw new Error("Protocol in url \"" + uri + "\" must be valid");
        }
        var scheme = parsed.protocol.slice(0, -1);
        console.debug("[core/helpers]", "Helpers found scheme '" + scheme + "'");
        return scheme;
    };
    Helpers.setStaticAddress = function (address) {
        Helpers.staticAddress = address;
    };
    Helpers.getAddresses = function () {
        var addresses = [];
        if (Helpers.staticAddress !== undefined) {
            addresses.push(Helpers.staticAddress);
            console.debug("[core/helpers]", "AddressHelper uses static " + addresses);
            return addresses;
        }
        else {
            var interfaces = os.networkInterfaces();
            for (var iface in interfaces) {
                interfaces[iface].forEach(function (entry) {
                    console.debug("[core/helpers]", "AddressHelper found " + entry.address);
                    if (entry.internal === false) {
                        if (entry.family === "IPv4") {
                            addresses.push(entry.address);
                        }
                        else if (entry.scopeid === 0) {
                            addresses.push(Helpers.toUriLiteral(entry.address));
                        }
                    }
                });
            }
            // add localhost only if no external addresses
            if (addresses.length === 0) {
                addresses.push('localhost');
            }
            console.debug("[core/helpers]", "AddressHelper identified " + addresses);
            return addresses;
        }
    };
    Helpers.toUriLiteral = function (address) {
        // Due to crash logged with:
        // TypeError: Cannot read property 'indexOf' of undefined at Function.Helpers.toUriLiteral 
        if (!address) {
            console.error("[core/helpers]", "AddressHelper received invalid address '" + address + "'");
            return "{invalid address}";
        }
        if (address.indexOf(':') !== -1) {
            address = "[" + address + "]";
        }
        return address;
    };
    Helpers.generateUniqueName = function (name) {
        var suffix = name.match(/.+_([0-9]+)$/);
        if (suffix !== null) {
            return name.slice(0, -suffix[1].length) + (1 + parseInt(suffix[1]));
        }
        else {
            return name + "_2";
        }
    };
    Helpers.prototype.fetch = function (uri) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var client = _this.srv.getClientFor(Helpers.extractScheme(uri));
            console.debug("[core/helpers]", "WoTImpl fetching TD from '" + uri + "' with " + client);
            client.readResource(new TD.Form(uri, content_serdes_1.ContentSerdes.TD))
                .then(function (content) {
                client.stop();
                if (content.type !== content_serdes_1.ContentSerdes.TD &&
                    content.type !== content_serdes_1.ContentSerdes.JSON_LD) {
                    console.warn("[core/helpers]", "WoTImpl received TD with media type '" + content.type + "' from " + uri);
                }
                var td = content.body.toString();
                try {
                    var jo = JSON.parse(td);
                    resolve(jo);
                }
                catch (err) {
                    reject(new Error("WoTImpl fetched invalid JSON from '" + uri + "': " + err.message));
                }
            })["catch"](function (err) { reject(err); });
        });
    };
    /**
     *  helper function to extend class
     */
    Helpers.extend = function (first, second) {
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!result.hasOwnProperty(id)) {
                result[id] = second[id];
            }
        }
        return result;
    };
    Helpers.staticAddress = undefined;
    return Helpers;
}());
exports["default"] = Helpers;
