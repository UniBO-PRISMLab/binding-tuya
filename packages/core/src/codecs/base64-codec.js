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
var Base64Codec = /** @class */ (function () {
    function Base64Codec(subMediaType) {
        this.subMediaType = subMediaType;
    }
    Base64Codec.prototype.getMediaType = function () {
        return this.subMediaType;
    };
    Base64Codec.prototype.bytesToValue = function (bytes, schema, parameters) {
        var parsed;
        parsed = bytes.toString("ascii");
        return parsed;
    };
    Base64Codec.prototype.valueToBytes = function (value, schema, parameters) {
        var body = "";
        if (value !== undefined) {
            body = value;
        }
        return Buffer.from(body, "base64");
    };
    return Base64Codec;
}());
exports["default"] = Base64Codec;
