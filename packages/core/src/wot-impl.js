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
exports.DataType = exports.ThingDiscoveryImpl = exports.DiscoveryMethod = void 0;
var TD = require("@node-wot/td-tools");
var exposed_thing_1 = require("./exposed-thing");
var consumed_thing_1 = require("./consumed-thing");
var helpers_1 = require("./helpers");
var WoTImpl = /** @class */ (function () {
    function WoTImpl(srv) {
        this.srv = srv;
    }
    /** @inheritDoc */
    WoTImpl.prototype.discover = function (filter) {
        return new ThingDiscoveryImpl(filter);
    };
    /** @inheritDoc */
    WoTImpl.prototype.consume = function (td) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var thing = void 0;
                thing = TD.parseTD(JSON.stringify(td), true);
                var newThing = helpers_1["default"].extend(thing, new consumed_thing_1["default"](_this.srv));
                newThing.extendInteractions();
                console.debug("[core/wot-impl]", "WoTImpl consuming TD " + (newThing.id ? "'" + newThing.id + "'" : "without id") + " to instantiate ConsumedThing '" + newThing.title + "'");
                resolve(newThing);
            }
            catch (err) {
                reject(new Error("Cannot consume TD because " + err.message));
            }
        });
    };
    // Note: copy from td-parser.ts 
    WoTImpl.prototype.addDefaultLanguage = function (thing) {
        // add @language : "en" if no @language set
        if (Array.isArray(thing["@context"])) {
            var arrayContext = thing["@context"];
            var languageSet = false;
            for (var _i = 0, arrayContext_1 = arrayContext; _i < arrayContext_1.length; _i++) {
                var arrayEntry = arrayContext_1[_i];
                if (typeof arrayEntry == "object") {
                    if (arrayEntry["@language"] !== undefined) {
                        languageSet = true;
                    }
                }
            }
            if (!languageSet) {
                arrayContext.push({
                    "@language": TD.DEFAULT_CONTEXT_LANGUAGE
                });
            }
        }
    };
    /**
     * create a new Thing
     *
     * @param title title/identifier of the thing to be created
     */
    WoTImpl.prototype.produce = function (td) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var newThing = void 0;
                // FIXME should be constrained version that omits instance-specific parts (but keeps "id")
                var template = td;
                _this.addDefaultLanguage(template);
                newThing = helpers_1["default"].extend(template, new exposed_thing_1["default"](_this.srv));
                // augment Interaction descriptions with interactable functions
                newThing.extendInteractions();
                console.debug("[core/servient]", "WoTImpl producing new ExposedThing '" + newThing.title + "'");
                if (_this.srv.addThing(newThing)) {
                    resolve(newThing);
                }
                else {
                    throw new Error("Thing already exists: " + newThing.title);
                }
            }
            catch (err) {
                reject(new Error("Cannot produce ExposedThing because " + err.message));
            }
        });
    };
    return WoTImpl;
}());
exports["default"] = WoTImpl;
var DiscoveryMethod;
(function (DiscoveryMethod) {
    /** does not provide any restriction */
    DiscoveryMethod[DiscoveryMethod["any"] = 0] = "any";
    /** for discovering Things defined in the same device */
    DiscoveryMethod[DiscoveryMethod["local"] = 1] = "local";
    /** for discovery based on a service provided by a directory or repository of Things  */
    DiscoveryMethod[DiscoveryMethod["directory"] = 2] = "directory";
    /** for discovering Things in the device's network by using a supported multicast protocol  */
    DiscoveryMethod[DiscoveryMethod["multicast"] = 3] = "multicast";
})(DiscoveryMethod = exports.DiscoveryMethod || (exports.DiscoveryMethod = {}));
var ThingDiscoveryImpl = /** @class */ (function () {
    function ThingDiscoveryImpl(filter) {
        this.filter = filter ? filter : null;
        this.active = false;
        this.done = false;
        this.error = new Error("not implemented");
    }
    ThingDiscoveryImpl.prototype.start = function () {
        this.active = true;
    };
    ThingDiscoveryImpl.prototype.next = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            reject(_this.error); // not implemented
        });
    };
    ThingDiscoveryImpl.prototype.stop = function () {
        this.active = false;
        this.done = false;
    };
    return ThingDiscoveryImpl;
}());
exports.ThingDiscoveryImpl = ThingDiscoveryImpl;
/** Instantiation of the WoT.DataType declaration */
var DataType;
(function (DataType) {
    DataType["boolean"] = "boolean";
    DataType["number"] = "number";
    DataType["integer"] = "integer";
    DataType["string"] = "string";
    DataType["object"] = "object";
    DataType["array"] = "array";
    DataType["null"] = "null";
})(DataType = exports.DataType || (exports.DataType = {}));
