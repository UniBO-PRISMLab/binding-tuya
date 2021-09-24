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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
/** default implementation offering JSON de-/serialisation */
var NetconfCodec = /** @class */ (function () {
    function NetconfCodec() {
    }
    NetconfCodec.prototype.getMediaType = function () {
        return 'application/netconf';
    };
    NetconfCodec.prototype.bytesToValue = function (bytes, schema, parameters) {
        //console.debug(`NetconfCodec parsing '${bytes.toString()}'`);
        var parsed;
        try {
            parsed = JSON.parse(bytes.toString());
        }
        catch (err) {
            if (err instanceof SyntaxError) {
                if (bytes.byteLength == 0) {
                    // empty payload -> void/undefined
                    parsed = undefined;
                }
                else {
                    // be relaxed about what is received -> string without quotes
                    parsed = bytes.toString();
                }
            }
            else {
                throw err;
            }
        }
        // TODO validate using schema
        // remove legacy wrapping and use RFC 7159
        // TODO remove once dropped from all PlugFest implementation
        if (parsed && parsed.value !== undefined) {
            console.warn("[core/netconf-codec]", "NetconfCodec removing { value: ... } wrapper");
            parsed = parsed.value;
        }
        return parsed;
    };
    NetconfCodec.prototype.valueToBytes = function (value, schema, parameters) {
        //console.debug("NetconfCodec serializing", value);
        var body = "";
        if (value !== undefined) {
            var NSs = {};
            var tmp_obj = this.getPayloadNamespaces(schema, value, NSs, false);
            body = JSON.stringify(tmp_obj);
        }
        return Buffer.from(body);
    };
    NetconfCodec.prototype.getPayloadNamespaces = function (schema, payload, NSs, hasNamespace) {
        if (hasNamespace) { //expect to have xmlns
            var properties = schema.properties;
            if (!properties) {
                throw new Error("Missing \"properties\" field in TD");
            }
            var ns_found = false;
            var alias_ns = '';
            var value = void 0;
            for (var key in properties) {
                var el = properties[key];
                if (!(payload[key])) {
                    throw new Error("Payload is missing '" + key + "' field specified in TD");
                }
                if (el["nc:attribute"] === true && payload[key]) { //if (el.format && el.format === 'urn')
                    var ns = payload[key];
                    alias_ns = ns.split(':')[ns.split(':').length - 1];
                    NSs[alias_ns] = payload[key];
                    ns_found = true;
                }
                else if (payload[key]) {
                    value = payload[key];
                }
            }
            if (!ns_found) {
                throw new Error("Namespace not found in the payload");
            }
            else { //change the payload in order to be parsed by the xpath2json library
                payload = alias_ns + '\\' + ':' + value;
            }
            return { payload: payload, NSs: NSs }; //return objects
        }
        if (schema && schema.type && schema.type === 'object' && schema.properties) { //nested object, go down
            var tmp_hasNamespace = false;
            var tmp_obj = void 0;
            if (schema.properties && schema["nc:container"]) { //check the root level
                tmp_obj = this.getPayloadNamespaces(schema, payload, NSs, true); //root case				
            }
            else {
                tmp_obj = this.getPayloadNamespaces(schema.properties, payload, NSs, false);
            }
            payload = tmp_obj.payload;
            NSs = __assign(__assign({}, NSs), tmp_obj.NSs);
        }
        //once here schema is properties
        for (var key in schema) {
            if ((schema[key].type && schema[key].type === 'object') || hasNamespace) { //go down only if it is a nested object or it has a namespace
                var tmp_hasNamespace = false;
                if (schema[key].properties && schema[key]["nc:container"]) {
                    tmp_hasNamespace = true;
                }
                var tmp_obj = this.getPayloadNamespaces(schema[key], payload[key], NSs, tmp_hasNamespace);
                payload[key] = tmp_obj.payload;
                NSs = __assign(__assign({}, NSs), tmp_obj.NSs);
            }
        }
        return { payload: payload, NSs: NSs }; //return objects
    };
    return NetconfCodec;
}());
exports["default"] = NetconfCodec;
