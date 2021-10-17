// // node-wot implementation of W3C WoT Servient 
// import { Servient, Helpers, ScriptOptions } from "@node-wot/core";

// import { TuyaCredential } from "../../binding-http/src/credential";
// import { TuyaThing } from "./tuya-thing";
// import { TuyaWotImplements } from "./tuya-WotImplementation"

// export class TuyaServient extends Servient {

//     private things: Map<string, TuyaThing> = new Map<string, TuyaThing>();
//     private tuyaSecurity:TuyaCredential;

//     //identica alla addThing normale, cambia soltanto il tipo di thing che si prende in input
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
//      * start identico al normale, cambia solo il WoTImplements che è stato necessario riscrivere
//      */
//     public start(): Promise<TuyaWotImplements> {

//     let serverStatus: Array<Promise<void>> = [];
//     (this as Servient).servers.forEach((server: any) => serverStatus.push(server.start(this)));
//     (this as Servient).clientFactories.forEach((clientFactory: any) => clientFactory.init());

//         return new Promise<TuyaWotImplements>((resolve, reject) => {
//             Promise.all(serverStatus)
//                 .then(() => {
//                     resolve(new TuyaWotImplements(this, this.tuyaSecurity));
//                 })
//                 .catch(err => {
//                     reject(err);
//                 });
//         });
//     }

//     public setSecurity(sec:TuyaCredential){
//         this.tuyaSecurity = sec;
//     }


// }