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
var TextCodec = /** @class */ (function () {
    function TextCodec(subMediaType) {
        if (!subMediaType) {
            this.subMediaType = 'text/plain';
        }
        else {
            this.subMediaType = subMediaType;
        }
    }
    TextCodec.prototype.getMediaType = function () {
        return this.subMediaType;
    };
    TextCodec.prototype.bytesToValue = function (bytes, schema, parameters) {
        //console.debug(`TextCodec parsing '${bytes.toString()}'`);
        var parsed;
        parsed = bytes.toString(parameters.charset);
        // TODO apply schema to convert string to real type
        return parsed;
    };
    TextCodec.prototype.valueToBytes = function (value, schema, parameters) {
        //console.debug(`TextCodec serializing '${value}'`);
        var body = "";
        if (value !== undefined) {
            body = value;
        }
        // type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";
        var be = undefined;
        if (parameters && parameters.charset) {
            switch (parameters.charset) {
                case "ascii":
                    be = "ascii";
                    break;
                case "utf8":
                    be = "utf8";
                    break;
                case "utf-8":
                    be = "utf-8";
                    break;
                case "utf16le":
                    be = "utf16le";
                    break;
                case "ucs2":
                    be = "ucs2";
                    break;
                case "ucs-2":
                    be = "ucs-2";
                    break;
                case "base64":
                    be = "base64";
                    break;
                case "latin1":
                    be = "latin1";
                    break;
                case "binary":
                    be = "binary";
                    break;
                case "hex":
                    be = "hex";
                    break;
            }
        }
        if (be) {
            return Buffer.from(body, be);
        }
        else {
            return Buffer.from(body);
        }
    };
    return TextCodec;
}());
exports["default"] = TextCodec;
