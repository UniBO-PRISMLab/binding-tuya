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
var vm2_1 = require("vm2");
var wot_impl_1 = require("./wot-impl");
var helpers_1 = require("./helpers");
var content_serdes_1 = require("./content-serdes");
var Servient = /** @class */ (function () {
    function Servient() {
        this.servers = [];
        this.clientFactories = new Map();
        this.things = new Map();
        this.credentialStore = new Map();
        this.uncaughtListeners = [];
    }
    /** runs the script in a new sandbox */
    Servient.prototype.runScript = function (code, filename) {
        var _this = this;
        if (filename === void 0) { filename = 'script'; }
        var context = {
            "WoT": new wot_impl_1["default"](this),
            "WoTHelpers": new helpers_1["default"](this)
        };
        var vm = new vm2_1.NodeVM({
            sandbox: context
        });
        var listener = function (err) {
            _this.logScriptError("Asynchronous script error '" + filename + "'", err);
            //TODO: clean up script resources
            process.exit(1);
        };
        process.prependListener('uncaughtException', listener);
        this.uncaughtListeners.push(listener);
        try {
            return vm.run(code, filename);
        }
        catch (err) {
            this.logScriptError("Servient found error in privileged script '" + filename + "'", err);
        }
    };
    /** runs the script in privileged context (dangerous) - means here: scripts can require */
    Servient.prototype.runPrivilegedScript = function (code, filename, options) {
        var _this = this;
        if (filename === void 0) { filename = 'script'; }
        if (options === void 0) { options = {}; }
        var context = {
            "WoT": new wot_impl_1["default"](this),
            "WoTHelpers": new helpers_1["default"](this)
        };
        var vm = new vm2_1.NodeVM({
            sandbox: context,
            require: {
                external: true,
                builtin: ["*"]
            },
            argv: options.argv,
            compiler: options.compiler,
            env: options.env
        });
        var listener = function (err) {
            _this.logScriptError("Asynchronous script error '" + filename + "'", err);
            //TODO: clean up script resources
            process.exit(1);
        };
        process.prependListener('uncaughtException', listener);
        this.uncaughtListeners.push(listener);
        try {
            return vm.run(code, filename);
        }
        catch (err) {
            this.logScriptError("Servient found error in privileged script '" + filename + "'", err);
        }
    };
    Servient.prototype.logScriptError = function (description, error) {
        var message;
        if (typeof error === "object" && error.stack) {
            var match = error.stack.match(/evalmachine\.<anonymous>\:([0-9]+\:[0-9]+)/);
            if (Array.isArray(match)) {
                message = "and halted at line " + match[1] + "\n    " + error;
            }
            else {
                message = "and halted with " + error.stack;
            }
        }
        else {
            message = "that threw " + typeof error + " instead of Error\n    " + error;
        }
        console.error("[core/servient]", "Servient caught " + description + " " + message);
    };
    /** add a new codec to support a mediatype; offered mediatypes are listed in TDs */
    Servient.prototype.addMediaType = function (codec, offered) {
        if (offered === void 0) { offered = false; }
        content_serdes_1["default"].addCodec(codec, offered);
    };
    Servient.prototype.expose = function (thing) {
        if (this.servers.length === 0) {
            console.warn("[core/servient]", "Servient has no servers to expose Things");
            return new Promise(function (resolve) { resolve(); });
        }
        console.debug("[core/servient]", "Servient exposing '" + thing.title + "'");
        // What is a good way to to convey forms information like contentType et cetera for interactions
        var tdTemplate = JSON.parse(JSON.stringify(thing));
        // initializing forms fields
        thing.forms = [];
        for (var name_1 in thing.properties) {
            thing.properties[name_1].forms = [];
        }
        for (var name_2 in thing.actions) {
            thing.actions[name_2].forms = [];
        }
        for (var name_3 in thing.events) {
            thing.events[name_3].forms = [];
        }
        var serverPromises = [];
        this.servers.forEach(function (server) { serverPromises.push(server.expose(thing, tdTemplate)); });
        return new Promise(function (resolve, reject) {
            Promise.all(serverPromises).then(function () { return resolve(); })["catch"](function (err) { return reject(err); });
        });
    };
    Servient.prototype.addThing = function (thing) {
        if (thing.id === undefined) {
            thing.id = "urn:uuid:" + require("uuid").v4();
            console.warn("[core/servient]", "Servient generating ID for '" + thing.title + "': '" + thing.id + "'");
        }
        if (!this.things.has(thing.id)) {
            this.things.set(thing.id, thing);
            console.debug("[core/servient]", "Servient reset ID '" + thing.id + "' with '" + thing.title + "'");
            return true;
        }
        else {
            return false;
        }
    };
    Servient.prototype.destroyThing = function (thingId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.things.has(thingId)) {
                console.debug("[core/servient]", "Servient destroying thing with id '" + thingId + "'");
                _this.things["delete"](thingId);
                var serverPromises_1 = [];
                _this.servers.forEach(function (server) { serverPromises_1.push(server.destroy(thingId)); });
                Promise.all(serverPromises_1).then(function () { return resolve(true); })["catch"](function (err) { return reject(err); });
            }
            else {
                console.warn("[core/servient]", "Servient was asked to destroy thing but failed to find thing with id '" + thingId + "'");
                resolve(false);
            }
        });
    };
    Servient.prototype.getThing = function (id) {
        if (this.things.has(id)) {
            return this.things.get(id);
        }
        else
            return null;
    };
    // FIXME should be getThingDescriptions (breaking change)
    Servient.prototype.getThings = function () {
        console.debug("[core/servient]", "Servient getThings size == '" + this.things.size + "'");
        var ts = {};
        this.things.forEach(function (thing, id) {
            ts[id] = thing.getThingDescription();
        });
        return ts;
    };
    Servient.prototype.addServer = function (server) {
        // add all exposed Things to new server
        this.things.forEach(function (thing, id) { return server.expose(thing); });
        this.servers.push(server);
        return true;
    };
    Servient.prototype.getServers = function () {
        // return a copy -- FIXME: not a deep copy
        return this.servers.slice(0);
    };
    Servient.prototype.addClientFactory = function (clientFactory) {
        this.clientFactories.set(clientFactory.scheme, clientFactory);
    };
    Servient.prototype.hasClientFor = function (scheme) {
        console.debug("[core/servient]", "Servient checking for '" + scheme + "' scheme in " + this.clientFactories.size + " ClientFactories");
        return this.clientFactories.has(scheme);
    };
    Servient.prototype.getClientFor = function (scheme) {
        if (this.clientFactories.has(scheme)) {
            console.debug("[core/servient]", "Servient creating client for scheme '" + scheme + "'");
            return this.clientFactories.get(scheme).getClient();
        }
        else {
            // FIXME returning null was bad - Error or Promise?
            // h0ru5: caller cannot react gracefully - I'd throw Error
            throw new Error("Servient has no ClientFactory for scheme '" + scheme + "'");
        }
    };
    Servient.prototype.getClientSchemes = function () {
        return Array.from(this.clientFactories.keys());
    };
    Servient.prototype.addCredentials = function (credentials) {
        if (typeof credentials === "object") {
            for (var i in credentials) {
                console.debug("[core/servient]", "Servient storing credentials for '" + i + "'");
                var currentCredentials = this.credentialStore.get(i);
                if (!currentCredentials) {
                    currentCredentials = [];
                    this.credentialStore.set(i, currentCredentials);
                }
                currentCredentials.push(credentials[i]);
            }
        }
    };
    /**
     * @deprecated use retrieveCredentials() instead which may return multiple credentials
     *
     * @param identifier id
     */
    Servient.prototype.getCredentials = function (identifier) {
        console.debug("[core/servient]", "Servient looking up credentials for '" + identifier + "' (@deprecated)");
        var currentCredentials = this.credentialStore.get(identifier);
        if (currentCredentials && currentCredentials.length > 0) {
            // return first
            return currentCredentials[0];
        }
        else {
            return undefined;
        }
    };
    Servient.prototype.retrieveCredentials = function (identifier) {
        console.debug("[core/servient]", "Servient looking up credentials for '" + identifier + "'");
        return this.credentialStore.get(identifier);
    };
    // will return WoT object
    Servient.prototype.start = function () {
        var _this = this;
        var serverStatus = [];
        this.servers.forEach(function (server) { return serverStatus.push(server.start(_this)); });
        this.clientFactories.forEach(function (clientFactory) { return clientFactory.init(); });
        return new Promise(function (resolve, reject) {
            Promise.all(serverStatus)
                .then(function () {
                resolve(new wot_impl_1["default"](_this));
            })["catch"](function (err) {
                reject(err);
            });
        });
    };
    Servient.prototype.shutdown = function () {
        this.clientFactories.forEach(function (clientFactory) { return clientFactory.destroy(); });
        this.servers.forEach(function (server) { return server.stop(); });
        this.uncaughtListeners.forEach(function (listener) {
            process.removeListener("uncaughtException", listener);
        });
    };
    return Servient;
}());
exports["default"] = Servient;
