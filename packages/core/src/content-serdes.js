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
exports.ContentSerdes = void 0;
var json_codec_1 = require("./codecs/json-codec");
var text_codec_1 = require("./codecs/text-codec");
var base64_codec_1 = require("./codecs/base64-codec");
var octetstream_codec_1 = require("./codecs/octetstream-codec");
/**
 * is a singleton that is used to serialize and deserialize data
 * it can accept multiple serializers and decoders
 */
var ContentSerdes = /** @class */ (function () {
    function ContentSerdes() {
        this.codecs = new Map();
        this.offered = new Set();
    }
    ContentSerdes.get = function () {
        if (!this.instance) {
            this.instance = new ContentSerdes();
            // JSON
            this.instance.addCodec(new json_codec_1["default"](), true);
            this.instance.addCodec(new json_codec_1["default"]("application/senml+json"));
            // Text
            this.instance.addCodec(new text_codec_1["default"]());
            this.instance.addCodec(new text_codec_1["default"]("text/html"));
            this.instance.addCodec(new text_codec_1["default"]("text/css"));
            this.instance.addCodec(new text_codec_1["default"]("application/xml"));
            this.instance.addCodec(new text_codec_1["default"]("application/xhtml+xml"));
            this.instance.addCodec(new text_codec_1["default"]("image/svg+xml"));
            // Base64
            this.instance.addCodec(new base64_codec_1["default"]("image/png"));
            this.instance.addCodec(new base64_codec_1["default"]("image/gif"));
            this.instance.addCodec(new base64_codec_1["default"]("image/jpeg"));
            // OctetStream
            this.instance.addCodec(new octetstream_codec_1["default"]());
        }
        return this.instance;
    };
    ContentSerdes.getMediaType = function (contentType) {
        var parts = contentType.split(";");
        return parts[0].trim();
    };
    ContentSerdes.getMediaTypeParameters = function (contentType) {
        var parts = contentType.split(";").slice(1);
        // parse parameters into object
        var params = {};
        parts.forEach(function (p) {
            var eq = p.indexOf("=");
            if (eq >= 0) {
                params[p.substr(0, eq).trim()] = p.substr(eq + 1).trim();
            }
            else {
                // handle parameters without value
                params[p.trim()] = null;
            }
        });
        return params;
    };
    ContentSerdes.prototype.addCodec = function (codec, offered) {
        if (offered === void 0) { offered = false; }
        ContentSerdes.get().codecs.set(codec.getMediaType(), codec);
        if (offered)
            ContentSerdes.get().offered.add(codec.getMediaType());
    };
    ContentSerdes.prototype.getSupportedMediaTypes = function () {
        return Array.from(ContentSerdes.get().codecs.keys());
    };
    ContentSerdes.prototype.getOfferedMediaTypes = function () {
        return Array.from(ContentSerdes.get().offered);
    };
    ContentSerdes.prototype.contentToValue = function (content, schema) {
        if (content.type === undefined) {
            if (content.body.byteLength > 0) {
                // default to application/json
                content.type = ContentSerdes.DEFAULT;
            }
            else {
                // empty payload without media type -> void/undefined (note: e.g., empty payload with text/plain -> "")
                return;
            }
        }
        // split into media type and parameters
        var mt = ContentSerdes.getMediaType(content.type);
        var par = ContentSerdes.getMediaTypeParameters(content.type);
        // choose codec based on mediaType
        if (this.codecs.has(mt)) {
            console.debug("[core/content-serdes]", "ContentSerdes deserializing from " + content.type);
            var codec = this.codecs.get(mt);
            // use codec to deserialize
            var res = codec.bytesToValue(content.body, schema, par);
            return res;
        }
        else {
            console.warn("[core/content-serdes]", "ContentSerdes passthrough due to unsupported media type '" + mt + "'");
            return content.body.toString();
        }
    };
    ContentSerdes.prototype.valueToContent = function (value, schema, contentType) {
        if (contentType === void 0) { contentType = ContentSerdes.DEFAULT; }
        if (value === undefined)
            console.warn("[core/content-serdes]", "ContentSerdes valueToContent got no value");
        var bytes = null;
        // split into media type and parameters
        var mt = ContentSerdes.getMediaType(contentType);
        var par = ContentSerdes.getMediaTypeParameters(contentType);
        // choose codec based on mediaType
        if (this.codecs.has(mt)) {
            console.debug("[core/content-serdes]", "ContentSerdes serializing to " + contentType);
            var codec = this.codecs.get(mt);
            bytes = codec.valueToBytes(value, schema, par);
        }
        else {
            console.warn("[core/content-serdes]", "ContentSerdes passthrough due to unsupported serialization format '" + contentType + "'");
            bytes = Buffer.from(value);
        }
        return { type: contentType, body: bytes };
    };
    ContentSerdes.DEFAULT = "application/json";
    ContentSerdes.TD = "application/td+json";
    ContentSerdes.JSON_LD = "application/ld+json";
    return ContentSerdes;
}());
exports.ContentSerdes = ContentSerdes;
// export singleton instance
exports["default"] = ContentSerdes.get();
