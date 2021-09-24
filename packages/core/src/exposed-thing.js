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
var Subject_1 = require("rxjs/Subject");
var TD = require("@node-wot/td-tools");
var helpers_1 = require("./helpers");
var ExposedThing = /** @class */ (function (_super) {
    __extends(ExposedThing, _super);
    function ExposedThing(servient) {
        var _this = _super.call(this) || this;
        _this.getServient = function () { return servient; };
        _this.getSubjectTD = (new /** @class */ (function () {
            function class_1() {
                var _this = this;
                this.subjectTDChange = new Subject_1.Subject();
                this.getSubject = function () { return _this.subjectTDChange; };
            }
            return class_1;
        }())).getSubject;
        return _this;
    }
    ExposedThing.prototype.extendInteractions = function () {
        for (var propertyName in this.properties) {
            var newProp = helpers_1["default"].extend(this.properties[propertyName], new ExposedThingProperty(propertyName, this));
            this.properties[propertyName] = newProp;
        }
        for (var actionName in this.actions) {
            var newAction = helpers_1["default"].extend(this.actions[actionName], new ExposedThingAction(actionName, this));
            this.actions[actionName] = newAction;
        }
        for (var eventName in this.events) {
            var newEvent = helpers_1["default"].extend(this.events[eventName], new ExposedThingEvent(eventName, this));
            this.events[eventName] = newEvent;
        }
    };
    ExposedThing.prototype.getThingDescription = function () {
        return JSON.parse(TD.serializeTD(this));
    };
    ExposedThing.prototype.emitEvent = function (name, data) {
        if (this.events[name]) {
            this.events[name].getState().subject.next(data);
        }
        else {
            // NotFoundError
            throw new Error("NotFoundError for event '" + name + "'");
        }
    };
    /** @inheritDoc */
    ExposedThing.prototype.expose = function () {
        var _this = this;
        console.debug("[core/exposed-thing]", "ExposedThing '" + this.title + "' exposing all Interactions and TD");
        return new Promise(function (resolve, reject) {
            // let servient forward exposure to the servers
            _this.getServient().expose(_this).then(function () {
                // inform TD observers
                _this.getSubjectTD().next(_this.getThingDescription());
                resolve();
            })["catch"](function (err) { return reject(err); });
        });
    };
    /** @inheritDoc */
    ExposedThing.prototype.destroy = function () {
        var _this = this;
        console.debug("[core/exposed-thing]", "ExposedThing '" + this.title + "' destroying the thing and its interactions");
        return new Promise(function (resolve, reject) {
            _this.getServient().destroyThing(_this.id).then(function () {
                // indicate to possible subscriptions that subject has been completed
                for (var propertyName in _this.properties) {
                    var ps = _this.properties[propertyName].getState();
                    if (ps.subject) {
                        ps.subject.complete();
                    }
                }
                for (var eventName in _this.events) {
                    var es = _this.events[eventName].getState();
                    if (es.subject) {
                        es.subject.complete();
                    }
                }
                // inform TD observers that thing is gone
                _this.getSubjectTD().next(null);
                // resolve with success
                resolve();
            })["catch"](function (err) { return reject(err); });
        });
    };
    /** @inheritDoc */
    ExposedThing.prototype.setPropertyReadHandler = function (propertyName, handler) {
        console.debug("[core/exposed-thing]", "ExposedThing '" + this.title + "' setting read handler for '" + propertyName + "'");
        if (this.properties[propertyName]) {
            // setting read handler for writeOnly not allowed
            if (this.properties[propertyName].writeOnly) {
                throw new Error("ExposedThing '" + this.title + "' cannot set read handler for property '" + propertyName + "' due to writeOnly flag");
            }
            else {
                // in case of function instead of lambda, the handler is bound to a scope shared with the writeHandler in PropertyState
                this.properties[propertyName].getState().readHandler = handler.bind(this.properties[propertyName].getState().scope);
            }
        }
        else {
            throw new Error("ExposedThing '" + this.title + "' has no Property '" + propertyName + "'");
        }
        return this;
    };
    /** @inheritDoc */
    ExposedThing.prototype.setPropertyWriteHandler = function (propertyName, handler) {
        console.debug("[core/exposed-thing]", "ExposedThing '" + this.title + "' setting write handler for '" + propertyName + "'");
        if (this.properties[propertyName]) {
            // Note: setting write handler allowed for readOnly also (see https://github.com/eclipse/thingweb.node-wot/issues/165)
            // The reason is that it may make sense to define its own "reject"
            // 
            // in case of function instead of lambda, the handler is bound to a scope shared with the readHandler in PropertyState
            this.properties[propertyName].getState().writeHandler = handler.bind(this.properties[propertyName].getState().scope);
        }
        else {
            throw new Error("ExposedThing '" + this.title + "' has no Property '" + propertyName + "'");
        }
        return this;
    };
    /** @inheritDoc */
    ExposedThing.prototype.setActionHandler = function (actionName, handler) {
        console.debug("[core/exposed-thing]", "ExposedThing '" + this.title + "' setting action Handler for '" + actionName + "'");
        if (this.actions[actionName]) {
            // in case of function instead of lambda, the handler is bound to a clean scope of the ActionState
            this.actions[actionName].getState().handler = handler.bind(this.actions[actionName].getState().scope);
        }
        else {
            throw new Error("ExposedThing '" + this.title + "' has no Action '" + actionName + "'");
        }
        return this;
    };
    ExposedThing.prototype.readProperty = function (propertyName, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.properties[propertyName]) {
                // writeOnly check skipped so far, see https://github.com/eclipse/thingweb.node-wot/issues/333#issuecomment-724583234
                /* if(this.properties[propertyName].writeOnly && this.properties[propertyName].writeOnly === true) {
                    reject(new Error(`ExposedThing '${this.title}', property '${propertyName}' is writeOnly`));
                } */
                var ps = _this.properties[propertyName].getState();
                // call read handler (if any)
                if (ps.readHandler != null) {
                    console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' calls registered readHandler for Property '" + propertyName + "'");
                    ps.readHandler(options)
                        .then(function (customValue) {
                        resolve(customValue);
                    })["catch"](function (err) {
                        reject(err);
                    });
                }
                else {
                    console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' gets internal value '" + ps.value + "' for Property '" + propertyName + "'");
                    resolve(ps.value);
                }
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no property found for '" + propertyName + "'"));
            }
        });
    };
    ExposedThing.prototype._readProperties = function (propertyNames, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // collect all single promises into array
            var promises = [];
            for (var _i = 0, propertyNames_1 = propertyNames; _i < propertyNames_1.length; _i++) {
                var propertyName = propertyNames_1[_i];
                promises.push(_this.readProperty(propertyName, options));
            }
            // wait for all promises to succeed and create response
            Promise.all(promises)
                .then(function (result) {
                var allProps = {};
                var index = 0;
                for (var _i = 0, propertyNames_2 = propertyNames; _i < propertyNames_2.length; _i++) {
                    var propertyName = propertyNames_2[_i];
                    allProps[propertyName] = result[index];
                    index++;
                }
                resolve(allProps);
            })["catch"](function (err) {
                reject(new Error("ExposedThing '" + _this.title + "', failed to read properties " + propertyNames));
            });
        });
    };
    ExposedThing.prototype.readAllProperties = function (options) {
        var propertyNames = [];
        for (var propertyName in this.properties) {
            propertyNames.push(propertyName);
        }
        return this._readProperties(propertyNames, options);
    };
    ExposedThing.prototype.readMultipleProperties = function (propertyNames, options) {
        return this._readProperties(propertyNames, options);
    };
    ExposedThing.prototype.writeProperty = function (propertyName, value, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.properties[propertyName]) {
                // readOnly check skipped so far, see https://github.com/eclipse/thingweb.node-wot/issues/333#issuecomment-724583234
                /* if (this.properties[propertyName].readOnly && this.properties[propertyName].readOnly === true) {
                    reject(new Error(`ExposedThing '${this.title}', property '${propertyName}' is readOnly`));
                } */
                var ps_1 = _this.properties[propertyName].getState();
                // call write handler (if any)
                if (ps_1.writeHandler != null) {
                    // be generous when no promise is returned
                    var promiseOrValueOrNil = ps_1.writeHandler(value, options);
                    if (promiseOrValueOrNil !== undefined) {
                        if (typeof promiseOrValueOrNil.then === "function") {
                            promiseOrValueOrNil.then(function (customValue) {
                                console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' write handler for Property '" + propertyName + "' sets custom value '" + customValue + "'");
                                // notify state change
                                // FIXME object comparison
                                if (ps_1.value !== customValue) {
                                    ps_1.value = customValue;
                                    ps_1.subject.next(customValue);
                                }
                                resolve();
                            })["catch"](function (customError) {
                                console.warn("[core/exposed-thing]", "ExposedThing '" + _this.title + "' write handler for Property '" + propertyName + "' rejected the write with error '" + customError + "'");
                                reject(customError);
                            });
                        }
                        else {
                            console.warn("[core/exposed-thing]", "ExposedThing '" + _this.title + "' write handler for Property '" + propertyName + "' does not return promise");
                            if (ps_1.value !== promiseOrValueOrNil) {
                                ps_1.value = promiseOrValueOrNil;
                                ps_1.subject.next(promiseOrValueOrNil);
                            }
                            resolve();
                        }
                    }
                    else {
                        console.warn("[core/exposed-thing]", "ExposedThing '" + _this.title + "' write handler for Property '" + propertyName + "' does not return custom value, using direct value '" + value + "'");
                        if (ps_1.value !== value) {
                            ps_1.value = value;
                            ps_1.subject.next(value);
                        }
                        resolve();
                    }
                }
                else {
                    console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' directly sets Property '" + propertyName + "' to value '" + value + "'");
                    // write and notify state change
                    if (ps_1.value !== value) {
                        ps_1.value = value;
                        ps_1.subject.next(value);
                    }
                    resolve();
                }
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no property found for '" + propertyName + "'"));
            }
        });
    };
    ExposedThing.prototype.writeMultipleProperties = function (valueMap, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // collect all single promises into array
            var promises = [];
            for (var propertyName in valueMap) {
                var oValueMap = valueMap;
                promises.push(_this.writeProperty(propertyName, oValueMap[propertyName], options));
            }
            // wait for all promises to succeed and create response
            Promise.all(promises)
                .then(function (result) {
                resolve();
            })["catch"](function (err) {
                reject(new Error("ExposedThing '" + _this.title + "', failed to read properties " + valueMap));
            });
        });
    };
    ExposedThing.prototype.invokeAction = function (actionName, parameter, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.actions[actionName]) {
                console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' has Action state of '" + actionName + "'");
                var as = _this.actions[actionName].getState();
                if (as.handler != null) {
                    console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' calls registered handler for Action '" + actionName + "'");
                    resolve(as.handler(parameter, options));
                }
                else {
                    reject(new Error("ExposedThing '" + _this.title + "' has no handler for Action '" + actionName + "'"));
                }
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no action found for '" + actionName + "'"));
            }
        });
    };
    ExposedThing.prototype.observeProperty = function (name, listener, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.properties[name]) {
                var next = listener;
                var error = null;
                var complete = null;
                var sub = _this.properties[name].getState().subject;
                sub.asObservable().subscribe(next, error, complete);
                console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' subscribes to property '" + name + "'");
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no property found for '" + name + "'"));
            }
        });
    };
    ExposedThing.prototype.unobserveProperty = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.properties[name]) {
                var sub = _this.properties[name].getState().subject;
                // sub.unsubscribe();  // XXX causes loop issue (see browser counter example)
                console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' unsubscribes from property '" + name + "'");
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no property found for '" + name + "'"));
            }
        });
    };
    ExposedThing.prototype.subscribeEvent = function (name, listener, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.events[name]) {
                var next = listener;
                var error = null;
                var complete = null;
                var sub = _this.events[name].getState().subject;
                sub.asObservable().subscribe(next, error, complete);
                console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' subscribes to event '" + name + "'");
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no event found for '" + name + "'"));
            }
        });
    };
    ExposedThing.prototype.unsubscribeEvent = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.events[name]) {
                var sub = _this.events[name].getState().subject;
                // sub.unsubscribe(); // XXX causes loop issue (see browser counter example)
                console.debug("[core/exposed-thing]", "ExposedThing '" + _this.title + "' unsubscribes from event '" + name + "'");
            }
            else {
                reject(new Error("ExposedThing '" + _this.title + "', no event found for '" + name + "'"));
            }
        });
    };
    return ExposedThing;
}(TD.Thing));
exports["default"] = ExposedThing;
var ExposedThingProperty = /** @class */ (function (_super) {
    __extends(ExposedThingProperty, _super);
    function ExposedThingProperty(name, thing) {
        var _this = _super.call(this) || this;
        // wrap internal state into functions to not be stringified in TD
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        _this.getState = (new /** @class */ (function () {
            function class_2() {
                var _this = this;
                this.state = new PropertyState();
                this.getInternalState = function () { return _this.state; };
            }
            return class_2;
        }())).getInternalState;
        // apply defaults
        _this.readOnly = false;
        _this.writeOnly = false;
        _this.observable = false;
        return _this;
    }
    return ExposedThingProperty;
}(TD.ThingProperty));
var ExposedThingAction = /** @class */ (function (_super) {
    __extends(ExposedThingAction, _super);
    function ExposedThingAction(name, thing) {
        var _this = _super.call(this) || this;
        // wrap internal state into functions to not be stringified
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        _this.getState = (new /** @class */ (function () {
            function class_3() {
                var _this = this;
                this.state = new ActionState();
                this.getInternalState = function () { return _this.state; };
            }
            return class_3;
        }())).getInternalState;
        return _this;
    }
    return ExposedThingAction;
}(TD.ThingAction));
var ExposedThingEvent = /** @class */ (function (_super) {
    __extends(ExposedThingEvent, _super);
    function ExposedThingEvent(name, thing) {
        var _this = _super.call(this) || this;
        // wrap internal state into functions to not be stringified
        _this.getName = function () { return name; };
        _this.getThing = function () { return thing; };
        _this.getState = (new /** @class */ (function () {
            function class_4() {
                var _this = this;
                this.state = new EventState();
                this.getInternalState = function () { return _this.state; };
            }
            return class_4;
        }())).getInternalState;
        return _this;
    }
    return ExposedThingEvent;
}(TD.ThingEvent));
var PropertyState = /** @class */ (function () {
    function PropertyState(value) {
        if (value === void 0) { value = null; }
        this.value = value;
        this.subject = new Subject_1.Subject();
        this.scope = {};
        this.writeHandler = null;
        this.readHandler = null;
    }
    return PropertyState;
}());
var ActionState = /** @class */ (function () {
    function ActionState() {
        this.scope = {};
        this.handler = null;
    }
    return ActionState;
}());
var EventState = /** @class */ (function () {
    function EventState() {
        this.subject = new Subject_1.Subject();
    }
    return EventState;
}());
