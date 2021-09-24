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
var ProtocolHelpers = /** @class */ (function () {
    function ProtocolHelpers() {
    }
    // set contentType (extend with more?)
    ProtocolHelpers.updatePropertyFormWithTemplate = function (form, tdTemplate, propertyName) {
        if (form && tdTemplate && tdTemplate.properties && tdTemplate.properties[propertyName] && tdTemplate.properties[propertyName].forms) {
            for (var _i = 0, _a = tdTemplate.properties[propertyName].forms; _i < _a.length; _i++) {
                var formTemplate = _a[_i];
                // 1. Try to find match with correct href scheme
                if (formTemplate.href) {
                    // TODO match for example http only?
                }
                // 2. Use any form
                if (formTemplate.contentType) {
                    form.contentType = formTemplate.contentType;
                    return; // abort loop
                }
            }
        }
    };
    ProtocolHelpers.updateActionFormWithTemplate = function (form, tdTemplate, actionName) {
        if (form && tdTemplate && tdTemplate.actions && tdTemplate.actions[actionName] && tdTemplate.actions[actionName].forms) {
            for (var _i = 0, _a = tdTemplate.actions[actionName].forms; _i < _a.length; _i++) {
                var formTemplate = _a[_i];
                // 1. Try to find match with correct href scheme
                if (formTemplate.href) {
                    // TODO match for example http only?
                }
                // 2. Use any form
                if (formTemplate.contentType) {
                    form.contentType = formTemplate.contentType;
                    return; // abort loop
                }
            }
        }
    };
    ProtocolHelpers.updateEventFormWithTemplate = function (form, tdTemplate, eventName) {
        if (form && tdTemplate && tdTemplate.events && tdTemplate.events[eventName] && tdTemplate.events[eventName].forms) {
            for (var _i = 0, _a = tdTemplate.events[eventName].forms; _i < _a.length; _i++) {
                var formTemplate = _a[_i];
                // 1. Try to find match with correct href scheme
                if (formTemplate.href) {
                    // TODO match for example http only?
                }
                // 2. Use any form
                if (formTemplate.contentType) {
                    form.contentType = formTemplate.contentType;
                    return; // abort loop
                }
            }
        }
    };
    ProtocolHelpers.getPropertyContentType = function (td, propertyName, uriScheme) {
        // try to find contentType (How to do this better)
        // Should interaction methods like readProperty() return an encapsulated value container with value&contenType
        // as sketched in https://github.com/w3c/wot-scripting-api/issues/201#issuecomment-573702999
        if (td && propertyName && uriScheme && td.properties && td.properties[propertyName] && td.properties[propertyName].forms && Array.isArray(td.properties[propertyName].forms)) {
            for (var _i = 0, _a = td.properties[propertyName].forms; _i < _a.length; _i++) {
                var form = _a[_i];
                if (form.href && form.href.startsWith(uriScheme) && form.contentType) {
                    return form.contentType; // abort loop
                }
            }
        }
        return undefined; // not found
    };
    ProtocolHelpers.getActionContentType = function (td, actionName, uriScheme) {
        // try to find contentType
        if (td && actionName && uriScheme && td.actions && td.actions[actionName] && td.actions[actionName].forms && Array.isArray(td.actions[actionName].forms)) {
            for (var _i = 0, _a = td.actions[actionName].forms; _i < _a.length; _i++) {
                var form = _a[_i];
                if (form.href && form.href.startsWith(uriScheme) && form.contentType) {
                    return form.contentType; // abort loop
                }
            }
        }
        return undefined; // not found
    };
    ProtocolHelpers.getEventContentType = function (td, eventName, uriScheme) {
        // try to find contentType
        if (td && eventName && uriScheme && td.events && td.events[eventName] && td.events[eventName].forms && Array.isArray(td.events[eventName].forms)) {
            for (var _i = 0, _a = td.events[eventName].forms; _i < _a.length; _i++) {
                var form = _a[_i];
                if (form.href && form.href.startsWith(uriScheme) && form.contentType) {
                    return form.contentType; // abort loop
                }
            }
        }
        return undefined; // not found
    };
    return ProtocolHelpers;
}());
exports["default"] = ProtocolHelpers;
