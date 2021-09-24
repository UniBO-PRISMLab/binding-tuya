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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ThingEvent = exports.ThingAction = exports.ThingProperty = exports.BaseSchema = exports.Form = exports.ExpectedResponse = exports.DEFAULT_THING_TYPE = exports.DEFAULT_CONTEXT_LANGUAGE = exports.DEFAULT_CONTEXT = void 0;
exports.DEFAULT_CONTEXT = "https://www.w3.org/2019/wot/td/v1";
exports.DEFAULT_CONTEXT_LANGUAGE = "en";
exports.DEFAULT_THING_TYPE = "Thing";
/** Implements the Thing Description as software object */
var Thing = /** @class */ (function () {
    function Thing() {
        this["@context"] = exports.DEFAULT_CONTEXT;
        this["@type"] = exports.DEFAULT_THING_TYPE;
        this.security = [];
        this.properties = {};
        this.actions = {};
        this.events = {};
        this.links = [];
    }
    return Thing;
}());
exports["default"] = Thing;
var ExpectedResponse = /** @class */ (function () {
    function ExpectedResponse() {
    }
    return ExpectedResponse;
}());
exports.ExpectedResponse = ExpectedResponse;
/** Implements the Interaction Form description */
var Form = /** @class */ (function () {
    function Form(href, contentType) {
        this.href = href;
        if (contentType)
            this.contentType = contentType;
    }
    return Form;
}());
exports.Form = Form;
var BaseSchema = /** @class */ (function () {
    function BaseSchema() {
    }
    return BaseSchema;
}());
exports.BaseSchema = BaseSchema;
/** Implements the Thing Property description */
var ThingProperty = /** @class */ (function (_super) {
    __extends(ThingProperty, _super);
    function ThingProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ThingProperty;
}(BaseSchema));
exports.ThingProperty = ThingProperty;
/** Implements the Thing Action description */
var ThingAction = /** @class */ (function () {
    function ThingAction() {
    }
    return ThingAction;
}());
exports.ThingAction = ThingAction;
/** Implements the Thing Event description */
var ThingEvent = /** @class */ (function () {
    function ThingEvent() {
    }
    return ThingEvent;
}());
exports.ThingEvent = ThingEvent;
