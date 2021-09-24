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

// global W3C WoT Scripting API definitions
// import * as WoT from "wot-typescript-definitions";

// import * as TD from "@node-wot/td-tools";
// // node-wot implementation of W3C WoT Servient 
// import { Servient, Helpers, ExposedThing, ConsumedThing } from "../../../../packages/core/src/core";

// import { TuyaCredential } from "../../../../packages/binding-http/src/credential";
// import { TuyaCredentialSecurityScheme } from "../../../../packages/td-tools/src/thing-description";
// // protocols used
// import { HttpServer } from "../../../../packages/binding-http/src/http";
// import fetch, {Request ,Headers} from 'node-fetch';


// export class TuyaServient extends Servient {

//     private things: Map<string, TuyaThing> = new Map<string, TuyaThing>();

//     private static readonly defaultConfig = {
//         servient: {
//             clientOnly: false,
//             scriptAction: false
//         },
//         http: {
//             port: 8080,
//             selfSigned: false
//         }
//     }

//     public readonly config: any;


//     public constructor(clientOnly: boolean, config?: any) {
//         super();

//         // init config
//         this.config = /*(typeof config === "object") ? config : */TuyaServient.defaultConfig;
//         if (!this.config.servient) this.config.servient = TuyaServient.defaultConfig.servient;

//         // apply flags
//         if (clientOnly) {
//             if (!this.config.servient) { this.config.servient = {}; }
//             this.config.servient.clientOnly = true;
//         }

//         // load credentials from config
//         this.addCredentials(this.config.credentials);
//         // remove secrets from original for displaying config (already added)
//         if(this.config.credentials) delete this.config.credentials;

//         // display
//         console.info("OpcuaServient configured with");
//         console.dir(this.config);

//         // apply config
//         if (typeof this.config.servient.staticAddress === "string") {
//             Helpers.setStaticAddress(this.config.servient.staticAddress);
//         }
//         if (!this.config.servient.clientOnly) {

//             if (this.config.http !== undefined) {
//                 let httpServer = new HttpServer(this.config.http);
//                 this.addServer(httpServer);

//             }
//         }
//     }

//     public addThing(thing: TuyaThing){
//         if (thing.id === undefined) {
//             thing.id = "urn:uuid:" + require("uuid").v4();
//             console.warn("[core/servient]",`Servient generating ID for '${thing.title}': '${thing.id}'`);
//         }

//         if (!this.things.has(thing.id)) {
//             this.things.set(thing.id, thing);
//             console.debug("[core/servient]",`Servient reset ID '${thing.id}' with '${thing.title}'`);
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * start
//      */
//  public start(): Promise<WoT.WoT> {

//     let serverStatus: Array<Promise<void>> = [];
//     this.servers.forEach((server) => serverStatus.push(server.start(this)));
//     this.clientFactories.forEach((clientFactory) => clientFactory.init());

//         return new Promise<WoT.WoT>((resolve, reject) => {
//             let server = new Promise<WoT.WoT>((resolve, reject) => {
//                 Promise.all(serverStatus)
//                     .then(() => {
//                         resolve(new TuyaWotImplements(this));
//                     })
//                     .catch(err => {
//                         reject(err);
//                     });
//             });
//             server.then((myWoT) => {
//                 console.info("DefaultServient started");

//                 // TODO think about builder pattern that starts with produce() ends with expose(), which exposes/publishes the Thing
//                 myWoT.produce({
//                     "title": "servient",
//                     "description": "node-wot CLI Servient",
//                     'id':'bff89e2b5a8e1516d6l89a',
//                     'region':'eu',
//                     properties: {
//                         switch_led: {
//                             type: "boolean",
//                             description: "power",
//                             observable: true,
//                             readOnly: false,
//                         }
//                     },
//                     actions: {
//                         log: {
//                             description: "Enable logging",
//                             input: { type: "string" },
//                             output: { type: "string" }
//                         }
//                     }
//                 })
//                     .then((thing) => {
//                         thing.setActionHandler("log", (msg) => {
//                             console.log(msg);
//                             return null;
//                         });
//                         thing.expose().then(()=>{
//                             //thing.startSincronizingWithRemoteServer();
//                             console.log("exposed");
//                         });
//                     });
//                 }).catch((err) => reject(err));
//         });
//     }
     
// }

// class TuyaWotImplements implements WoT.WoT{
//     private srv: TuyaServient;

//     constructor(srv: TuyaServient) {
//         this.srv = srv;
//     }

//     /** @inheritDoc */
//     discover(filter?: WoT.ThingFilter): WoT.ThingDiscovery {
//         return new ThingDiscoveryImpl(filter);
//     }

//     /** @inheritDoc */
//     consume(td: WoT.ThingDescription): Promise<WoT.ConsumedThing> {
//         return new Promise<WoT.ConsumedThing>((resolve, reject) => {
//             try {
//                 let thing: TD.Thing;
//                 thing = TD.parseTD(JSON.stringify(td), true);
//                 let newThing: ConsumedThing = Helpers.extend(thing, new ConsumedThing(this.srv));

//                 newThing.extendInteractions();

//                 console.debug("[core/wot-impl]",`WoTImpl consuming TD ${newThing.id ? "'" + newThing.id + "'" : "without id"} to instantiate ConsumedThing '${newThing.title}'`);
//                 resolve(newThing);
//             } catch (err) {
//                 reject(new Error("Cannot consume TD because " + err.message));
//             }
//         });
//     }

//     // Note: copy from td-parser.ts 
//     addDefaultLanguage(thing: any) {
//         // add @language : "en" if no @language set
//         if (Array.isArray(thing["@context"])) {
//             let arrayContext: Array<any> = thing["@context"];
//             let languageSet = false;
//             for (let arrayEntry of arrayContext) {
//                 if (typeof arrayEntry == "object") {
//                     if (arrayEntry["@language"] !== undefined) {
//                         languageSet = true;
//                     }
//                 }
//             }
//             if (!languageSet) {
//                 arrayContext.push({
//                     "@language": TD.DEFAULT_CONTEXT_LANGUAGE
//                 });
//             }
//         }
//     }

//     /**
//      * create a new Thing
//      *
//      * @param title title/identifier of the thing to be created
//      */
//     produce(td: WoT.ThingDescription): Promise<WoT.ExposedThing> {
//         return new Promise<WoT.ExposedThing>((resolve, reject) => {
//             try {
//                 let newThing: TuyaThing;

//                 // FIXME should be constrained version that omits instance-specific parts (but keeps "id")
//                 let template = td;
//                 this.addDefaultLanguage(template);
//                 newThing = Helpers.extend(template, new TuyaThing(this.srv, TuyaSecurity));

//                 // augment Interaction descriptions with interactable functions
//                 newThing.extendInteractions();

//                 console.debug("[core/servient]",`WoTImpl producing new ExposedThing '${newThing.title}'`);

//                 if (this.srv.addThing(newThing)) {
//                     resolve(newThing);
//                 } else {
//                     throw new Error("Thing already exists: " + newThing.title);
//                 }
//             } catch (err) {
//                 reject(new Error("Cannot produce ExposedThing because " + err.message));
//             }
//         });
//     }
// }

// enum DiscoveryMethod {
//     /** does not provide any restriction */
//     "any",
//     /** for discovering Things defined in the same device */
//     "local",
//     /** for discovery based on a service provided by a directory or repository of Things  */
//     "directory",
//     /** for discovering Things in the device's network by using a supported multicast protocol  */
//     "multicast"
// }

// class ThingDiscoveryImpl implements WoT.ThingDiscovery {
//     filter?: WoT.ThingFilter;
//     active: boolean;
//     done: boolean;
//     error?: Error;
//     constructor(filter?: WoT.ThingFilter) {
//         this.filter = filter ? filter : null;
//         this.active = false;
//         this.done = false;
//         this.error = new Error("not implemented");
//     }

//     start(): void {
//         this.active = true;
//     }
//     next(): Promise<WoT.ThingDescription> {
//         return new Promise<WoT.ThingDescription>((resolve, reject) => {
//             reject(this.error); // not implemented
//         });
//     }
//     stop(): void {
//         this.active = false;
//         this.done = false;
//     }
// }


// /** Instantiation of the WoT.DataType declaration */
// export enum DataType {
//     boolean = "boolean",
//     number = "number",
//     integer = "integer",
//     string = "string",
//     object = "object",
//     array = "array",
//     null = "null"
// }


// export class TuyaThing extends ExposedThing {
    

//     private baseUrl:string;
//     tuyaSecurity: TuyaCredential;

//     constructor(servient: Servient, tuyaSecurity: TuyaCredential){
//         super(servient);
//         this.tuyaSecurity = tuyaSecurity;
//     }
//     public expose(){
//         console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' exposing all Interactions and TD`);
//         this.baseUrl = `https://openapi.tuya${this.getThingDescription().region}.com/v1.0/devices/${this.getThingDescription().id}`;
//         //this.startSincronizingWithRemoteServer();
//         return new Promise<void>((resolve, reject) => {
//             // let servient forward exposure to the servers
//             this.getServient().expose(this).then(() => {
//                 // inform TD observers
//                 this.getSubjectTD().next(this.getThingDescription());
//                 resolve();
//             })
//                 .catch((err) => reject(err));
//         });
//     }

//     private delay(ms: any) {
//         return new Promise( resolve => setTimeout(resolve, ms) );
//     }
//     public readProperty(propertyName:string){
//         return new Promise<any>((resolve,rejects) =>{
//             let url = `${this.baseUrl}/status`;
//             let request: Request = new Request(
//                 url,
//                 {
//                     headers:new Headers({}),
//                     method:'GET'
//                 }
//             )
//             this.tuyaSecurity.sign(request).then((rq) =>{
//                 fetch(rq).then((data)=>{
//                     data.buffer().then((buffer)=>{
//                         let results = JSON.parse(buffer.toString()).result;
//                         for(let res of results){
//                             if(res.code == propertyName){
//                                 console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' gets internal value '${res.value}' for Property '${propertyName}'`);            
//                                 resolve(res.value);
//                             }
//                         }
//                     });
//                 })
//             });
//         });
//     }
//     public startSincronizingWithRemoteServer(){
//         (async()=>{
//             while(true){
//                 let url = `${this.baseUrl}/status`;
//                 let request: Request = new Request(
//                     url,
//                     {
//                         headers:new Headers({}),
//                         method:'GET'
//                     }
//                 )
//                 let rq = await this.tuyaSecurity.sign(request);
//                 let status = JSON.parse(await (await (await fetch(rq)).buffer()).toString()).result;
//                 for(let i = 0; i < status.length; i++){
//                     try{
//                         let prop = this.properties[status[i].code].getState();
//                         if(prop.value != status[i].value){
//                             prop.value = status[i].value;
//                             console.log(`updating property ${status[i].code} with value ${status[i].value}`)
//                         }
//                     }catch(e){
//                         //console.log("error");
//                     }
//                 }
//                 await this.delay(5000)
//             }
//         })();
//     }

//     public writeProperty(propertyName: string, value: any, options?: any){
//         return new Promise<void>((resolve, reject)=>{
//             if (this.properties[propertyName]) {
//                 // readOnly check skipped so far, see https://github.com/eclipse/thingweb.node-wot/issues/333#issuecomment-724583234
//                 /* if (this.properties[propertyName].readOnly && this.properties[propertyName].readOnly === true) {
//                     reject(new Error(`ExposedThing '${this.title}', property '${propertyName}' is readOnly`));
//                 } */

//                 let ps: PropertyState = this.properties[propertyName].getState();

//                 // call write handler (if any)
//                 if (ps.writeHandler != null) {
//                     // be generous when no promise is returned
//                     let promiseOrValueOrNil = ps.writeHandler(value, options);

//                     if (promiseOrValueOrNil !== undefined) {
//                         if (typeof promiseOrValueOrNil.then === "function") {
//                             promiseOrValueOrNil.then((customValue) => {
//                                 console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' sets custom value '${customValue}'`);
//                                 this.writeAsyncProperty(propertyName, value).then((response) =>{
//                                     if(response.success){
//                                         console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
//                                         resolve();
//                                     }else{
//                                         reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
//                                     }
//                                 }).catch((customError) => {
//                                     console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
//                                     reject(customError);
//                                 });
//                             })
//                                 .catch((customError) => {
//                                     console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
//                                     reject(customError);
//                                 });
//                         } else {
//                             console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' does not return promise`);
//                             if (ps.value !== promiseOrValueOrNil) {
//                                 ps.value = <any>promiseOrValueOrNil;
//                                 ps.subject.next(<any>promiseOrValueOrNil);
//                             }
//                             resolve();
//                         }
//                     } else {
//                         console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' does not return custom value, using direct value '${value}'`);
//                         this.writeAsyncProperty(propertyName, value).then((response) =>{
//                             if(response.success){
//                                 console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
//                                 resolve();
//                             }else{
//                                 reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
//                             }
//                         }).catch((customError) => {
//                             console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
//                             reject(customError);
//                         });
//                     }
//                 } else {
//                     console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
//                     // write and notify state change
//                     this.writeAsyncProperty(propertyName, value).then((response) =>{
//                         if(response.success){
//                             console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
//                             resolve();
//                         }else{
//                             reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
//                         }
//                     }).catch((customError) => {
//                         console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
//                         reject(customError);
//                     });
//                 }
//             } else {
//                 reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
//             }
//         });
//     }

//     private async writeAsyncProperty(propertyName: string, value : any){
//         let url = `${this.baseUrl}/commands`;

//         let body = {
//             "commands": [
//                 {
//                 "code":propertyName,
//                 "value":value
//                 }
//             ]
//         }

//         let request: Request = new Request(
//             url,
//             {
//                 headers:new Headers({}),
//                 method:'POST',
//                 body:Buffer.from(JSON.stringify(body))
//             }
//         )
//         let rq = await this.tuyaSecurity.sign(request);
//         let status = JSON.parse(await (await (await fetch(rq)).buffer()).toString());
//         return status;
//     }
// }

import {TuyaServient} from '../../../../packages/binding-tuya/src/tuya-servient';

let tuya = new TuyaServient(false, null);

(async()=>{
    await tuya.start();
})();