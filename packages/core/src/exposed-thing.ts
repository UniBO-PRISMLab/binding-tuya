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

import * as WoT from "wot-typescript-definitions";

import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

import * as TD from "@node-wot/td-tools";

import Servient from "./servient";
import { ContentSerdes } from "./content-serdes";
import Helpers from "./helpers";
import { Content } from "./protocol-interfaces";

export default class ExposedThing extends TD.Thing implements WoT.ExposedThing {
    security: Array<String>;
    securityDefinitions: { [key: string]: TD.SecurityScheme };

    id: string;
    title: string;
    base: string;
    forms: Array<TD.Form>;

    /** A map of interactable Thing Properties with read()/write()/subscribe() functions */
    properties: {
        [key: string]: TD.ThingProperty
    };

    /** A map of interactable Thing Actions with invoke() function */
    actions: {
        [key: string]: TD.ThingAction;
    }

    /** A map of interactable Thing Events with emit() function */
    events: {
        [key: string]: TD.ThingEvent;
    }

    private getServient: () => Servient;
    private getSubjectTD: () => Subject<any>;

    constructor(servient: Servient) {
        super();

        this.getServient = () => { return servient; };
        this.getSubjectTD = (new class {
            subjectTDChange: Subject<any> = new Subject<any>();
            getSubject = () => { return this.subjectTDChange };
        }).getSubject;
    }

    extendInteractions(): void {
        for (let propertyName in this.properties) {
            let newProp = Helpers.extend(this.properties[propertyName], new ExposedThingProperty(propertyName, this));
            this.properties[propertyName] = newProp;
        }
        for (let actionName in this.actions) {
            let newAction = Helpers.extend(this.actions[actionName], new ExposedThingAction(actionName, this));
            this.actions[actionName] = newAction;
        }
        for (let eventName in this.events) {
            let newEvent = Helpers.extend(this.events[eventName], new ExposedThingEvent(eventName, this));
            this.events[eventName] = newEvent;
        }
    }

    public getThingDescription(): WoT.ThingDescription {
        return JSON.parse(TD.serializeTD(this));
    }

    public emitEvent(name: string, data: any): void {
        if(this.events[name]) {
            this.events[name].getState().subject.next(data);
        } else {
            // NotFoundError
            throw new Error("NotFoundError for event '" + name + "'");
        }
    }

    /** @inheritDoc */
    expose(): Promise<void> {
        console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' exposing all Interactions and TD`);

        return new Promise<void>((resolve, reject) => {
            // let servient forward exposure to the servers
            this.getServient().expose(this).then(() => {
                // inform TD observers
                this.getSubjectTD().next(this.getThingDescription());
                resolve();
            })
                .catch((err) => reject(err));
        });
    }

    /** @inheritDoc */
    destroy(): Promise<void> {
        console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' destroying the thing and its interactions`);

        return new Promise<void>((resolve, reject) => {
            this.getServient().destroyThing(this.id).then(() => {
                // indicate to possible subscriptions that subject has been completed
                for (let propertyName in this.properties) {
                    let ps: PropertyState = this.properties[propertyName].getState();
                    if (ps.subject) {
                        ps.subject.complete();
                    }
                }
                for (let eventName in this.events) {
                    let es: EventState = this.events[eventName].getState();
                    if (es.subject) {
                        es.subject.complete();
                    }
                }
                // inform TD observers that thing is gone
                this.getSubjectTD().next(null);
                // resolve with success
                resolve();
            }).catch((err) => reject(err));
        });
    }

    /** @inheritDoc */
    setPropertyReadHandler(propertyName: string, handler: WoT.PropertyReadHandler): WoT.ExposedThing {
        console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' setting read handler for '${propertyName}'`);

        if (this.properties[propertyName]) {
            // setting read handler for writeOnly not allowed
            if (this.properties[propertyName].writeOnly) {
                throw new Error(`ExposedThing '${this.title}' cannot set read handler for property '${propertyName}' due to writeOnly flag`);
            } else {
                // in case of function instead of lambda, the handler is bound to a scope shared with the writeHandler in PropertyState
                this.properties[propertyName].getState().readHandler = handler.bind(this.properties[propertyName].getState().scope);
            }
        } else {
            throw new Error(`ExposedThing '${this.title}' has no Property '${propertyName}'`);
        }
        return this;
    }

    /** @inheritDoc */
    setPropertyWriteHandler(propertyName: string, handler: WoT.PropertyWriteHandler): WoT.ExposedThing {
        console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' setting write handler for '${propertyName}'`);
        if (this.properties[propertyName]) {
            // Note: setting write handler allowed for readOnly also (see https://github.com/eclipse/thingweb.node-wot/issues/165)
            // The reason is that it may make sense to define its own "reject"
            // 
            // in case of function instead of lambda, the handler is bound to a scope shared with the readHandler in PropertyState
            this.properties[propertyName].getState().writeHandler = handler.bind(this.properties[propertyName].getState().scope);
        } else {
            throw new Error(`ExposedThing '${this.title}' has no Property '${propertyName}'`);
        }
        return this;
    }

    /** @inheritDoc */
    setActionHandler(actionName: string, handler: WoT.ActionHandler): WoT.ExposedThing {
        console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' setting action Handler for '${actionName}'`);

        if (this.actions[actionName]) {
            // in case of function instead of lambda, the handler is bound to a clean scope of the ActionState
            this.actions[actionName].getState().handler = handler.bind(this.actions[actionName].getState().scope);
        } else {
            throw new Error(`ExposedThing '${this.title}' has no Action '${actionName}'`);
        }
        return this;
    }

    readProperty(propertyName: string, options?: WoT.InteractionOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.properties[propertyName]) {
                // writeOnly check skipped so far, see https://github.com/eclipse/thingweb.node-wot/issues/333#issuecomment-724583234
                /* if(this.properties[propertyName].writeOnly && this.properties[propertyName].writeOnly === true) {
                    reject(new Error(`ExposedThing '${this.title}', property '${propertyName}' is writeOnly`));
                } */

                let ps: PropertyState = this.properties[propertyName].getState();
                // call read handler (if any)
                if (ps.readHandler != null) {
                    console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' calls registered readHandler for Property '${propertyName}'`);
                    ps.readHandler(options)
                        .then((customValue) => {
                            resolve(customValue);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                } else {
                    console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' gets internal value '${ps.value}' for Property '${propertyName}'`);
                    resolve(ps.value);
                }
            } else {
                reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
            }
        });
    }


    _readProperties(propertyNames: string[], options?: WoT.InteractionOptions): Promise<WoT.PropertyValueMap> {
        return new Promise<object>((resolve, reject) => {
            // collect all single promises into array
            var promises: Promise<any>[] = [];
            for (let propertyName of propertyNames) {
                promises.push(this.readProperty(propertyName, options));
            }
            // wait for all promises to succeed and create response
            Promise.all(promises)
                .then((result) => {
                    let allProps: {
                        [key: string]: any;
                    } = {};
                    let index = 0;
                    for (let propertyName of propertyNames) {
                        allProps[propertyName] = result[index];
                        index++;
                    }
                    resolve(allProps);
                })
                .catch(err => {
                    reject(new Error(`ExposedThing '${this.title}', failed to read properties ` + propertyNames));
                });
        });
    }

    readAllProperties(options?: WoT.InteractionOptions): Promise<WoT.PropertyValueMap> {
        let propertyNames: string[] = [];
        for (let propertyName in this.properties) {
            propertyNames.push(propertyName);
        }
        return this._readProperties(propertyNames, options);
    }
    readMultipleProperties(propertyNames: string[], options?: WoT.InteractionOptions): Promise<WoT.PropertyValueMap> {
        return this._readProperties(propertyNames, options);
    }

    writeProperty(propertyName: string, value: any, options?: WoT.InteractionOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.properties[propertyName]) {
                // readOnly check skipped so far, see https://github.com/eclipse/thingweb.node-wot/issues/333#issuecomment-724583234
                /* if (this.properties[propertyName].readOnly && this.properties[propertyName].readOnly === true) {
                    reject(new Error(`ExposedThing '${this.title}', property '${propertyName}' is readOnly`));
                } */

                let ps: PropertyState = this.properties[propertyName].getState();

                // call write handler (if any)
                if (ps.writeHandler != null) {
                    // be generous when no promise is returned
                    let promiseOrValueOrNil = ps.writeHandler(value, options);

                    if (promiseOrValueOrNil !== undefined) {
                        if (typeof promiseOrValueOrNil.then === "function") {
                            promiseOrValueOrNil.then((customValue) => {
                                console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' sets custom value '${customValue}'`);
                                // notify state change
                                // FIXME object comparison
                                if (ps.value !== customValue) {
                                    ps.value = customValue;
                                    ps.subject.next(customValue);
                                }
                                resolve();
                            })
                                .catch((customError) => {
                                    console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
                                    reject(customError);
                                });
                        } else {
                            console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' does not return promise`);
                            if (ps.value !== promiseOrValueOrNil) {
                                ps.value = <any>promiseOrValueOrNil;
                                ps.subject.next(<any>promiseOrValueOrNil);
                            }
                            resolve();
                        }
                    } else {
                        console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' does not return custom value, using direct value '${value}'`);
                        if (ps.value !== value) {
                            ps.value = value;
                            ps.subject.next(value);
                        }
                        resolve();
                    }
                } else {
                    console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
                    // write and notify state change
                    if (ps.value !== value) {
                        ps.value = value;
                        ps.subject.next(value);
                    }
                    resolve();
                }
            } else {
                reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
            }
        });
    }
    writeMultipleProperties(valueMap: WoT.PropertyValueMap, options?: WoT.InteractionOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // collect all single promises into array
            var promises: Promise<void>[] = [];
            for (let propertyName in valueMap) {
                let oValueMap: { [key: string]: any; } = valueMap;
                promises.push(this.writeProperty(propertyName, oValueMap[propertyName], options));
            }
            // wait for all promises to succeed and create response
            Promise.all(promises)
                .then((result) => {
                    resolve();
                })
                .catch(err => {
                    reject(new Error(`ExposedThing '${this.title}', failed to read properties ` + valueMap));
                });
        });
    }

    public invokeAction(actionName: string, parameter?: any, options?: WoT.InteractionOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.actions[actionName]) {
                console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' has Action state of '${actionName}'`);

                let as: ActionState = this.actions[actionName].getState();
                if (as.handler != null) {
                    console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' calls registered handler for Action '${actionName}'`);
                    resolve(as.handler(parameter, options));
                } else {
                    reject(new Error(`ExposedThing '${this.title}' has no handler for Action '${actionName}'`));
                }
            } else {
                reject(new Error(`ExposedThing '${this.title}', no action found for '${actionName}'`));
            }
        });
    }

    public observeProperty(name: string, listener: WoT.WotListener, options?: WoT.InteractionOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.properties[name]) {
                let next = listener;
                let error = null;
                let complete = null;
                let sub: Subject<Content> = this.properties[name].getState().subject;
                sub.asObservable().subscribe(next, error, complete);
                console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' subscribes to property '${name}'`);
            } else {
                reject(new Error(`ExposedThing '${this.title}', no property found for '${name}'`));
            }
        });
    }

    public unobserveProperty(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.properties[name]) {
                let sub: Subject<Content> = this.properties[name].getState().subject;
                // sub.unsubscribe();  // XXX causes loop issue (see browser counter example)
                console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' unsubscribes from property '${name}'`);
            } else {
                reject(new Error(`ExposedThing '${this.title}', no property found for '${name}'`));
            }
        });
    }

    public subscribeEvent(name: string, listener: WoT.WotListener, options?: WoT.InteractionOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.events[name]) {
                let next = listener;
                let error = null;
                let complete = null;
                let sub: Subject<any> = this.events[name].getState().subject;
                sub.asObservable().subscribe(next, error, complete);
                console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' subscribes to event '${name}'`);
            } else {
                reject(new Error(`ExposedThing '${this.title}', no event found for '${name}'`));
            }
        });
    }

    public unsubscribeEvent(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.events[name]) {
                let sub: Subject<any> = this.events[name].getState().subject;
                // sub.unsubscribe(); // XXX causes loop issue (see browser counter example)
                console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' unsubscribes from event '${name}'`);
            } else {
                reject(new Error(`ExposedThing '${this.title}', no event found for '${name}'`));
            }
        });
    }
}

class ExposedThingProperty extends TD.ThingProperty implements TD.ThingProperty, TD.BaseSchema {

    // functions for wrapping internal state
    getName: () => string;
    getThing: () => ExposedThing;
    getState: () => PropertyState;

    constructor(name: string, thing: ExposedThing) {
        super();

        // wrap internal state into functions to not be stringified in TD
        this.getName = () => { return name; }
        this.getThing = () => { return thing; }
        this.getState = (new class {
            state: PropertyState = new PropertyState();
            getInternalState = () => { return this.state };
        }).getInternalState;

        // apply defaults
        this.readOnly = false;
        this.writeOnly = false;
        this.observable = false;
    }
}

class ExposedThingAction extends TD.ThingAction implements TD.ThingAction {
    // functions for wrapping internal state
    getName: () => string;
    getThing: () => ExposedThing;
    getState: () => ActionState;

    constructor(name: string, thing: ExposedThing) {
        super();

        // wrap internal state into functions to not be stringified
        this.getName = () => { return name; }
        this.getThing = () => { return thing; }
        this.getState = (new class {
            state: ActionState = new ActionState();
            getInternalState = () => { return this.state };
        }).getInternalState;
    }
}

class ExposedThingEvent extends TD.ThingEvent implements TD.ThingEvent {
    // functions for wrapping internal state
    getName: () => string;
    getThing: () => ExposedThing;
    getState: () => EventState;

    constructor(name: string, thing: ExposedThing) {
        super();

        // wrap internal state into functions to not be stringified
        this.getName = () => { return name; }
        this.getThing = () => { return thing; }
        this.getState = (new class {
            state: EventState = new EventState();
            getInternalState = () => { return this.state };
        }).getInternalState;
    }
}

class PropertyState {
    public value: any;
    public subject: Subject<Content>;
    public scope: Object;

    public readHandler: WoT.PropertyReadHandler;
    public writeHandler: WoT.PropertyWriteHandler;

    constructor(value: any = null) {
        this.value = value;
        this.subject = new Subject<Content>();
        this.scope = {};
        this.writeHandler = null;
        this.readHandler = null;
    }
}

class ActionState {
    public scope: Object;
    public handler: WoT.ActionHandler;

    constructor() {
        this.scope = {};
        this.handler = null;
    }
}

class EventState {
    public subject: Subject<any>;

    constructor() {
        this.subject = new Subject<any>();
    }
}
