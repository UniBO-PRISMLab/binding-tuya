import * as WoT from "wot-typescript-definitions";

import * as TD from "@node-wot/td-tools";
// node-wot implementation of W3C WoT Servient 
import { Helpers, ConsumedThing } from "@node-wot/core";
import { TuyaThing } from "./tuya-thing";
import { TuyaServient } from "./tuya-servient";
import { TuyaCredential } from "../../binding-http/src/credential";


//resta tutto identico tranne la produce che usa le tuyaThing al posto di thing core
export class TuyaWotImplements implements WoT.WoT{
    private srv: TuyaServient;
    private secutity:TuyaCredential;

    constructor(srv: TuyaServient, security:TuyaCredential) {
        this.srv = srv;
        this.secutity = security;
    }

    /** @inheritDoc */
    discover(filter?: WoT.ThingFilter): WoT.ThingDiscovery {
        return new ThingDiscoveryImpl(filter);
    }

    /** @inheritDoc */
    consume(td: WoT.ThingDescription): Promise<WoT.ConsumedThing> {
        return new Promise<WoT.ConsumedThing>((resolve, reject) => {
            try {
                let thing: TD.Thing;
                thing = TD.parseTD(JSON.stringify(td), true);
                let newThing: ConsumedThing = Helpers.extend(thing, new ConsumedThing(this.srv));

                newThing.extendInteractions();

                console.debug("[core/wot-impl]",`WoTImpl consuming TD ${newThing.id ? "'" + newThing.id + "'" : "without id"} to instantiate ConsumedThing '${newThing.title}'`);
                resolve(newThing);
            } catch (err) {
                reject(new Error("Cannot consume TD because " + err.message));
            }
        });
    }

    // Note: copy from td-parser.ts 
    addDefaultLanguage(thing: any) {
        // add @language : "en" if no @language set
        if (Array.isArray(thing["@context"])) {
            let arrayContext: Array<any> = thing["@context"];
            let languageSet = false;
            for (let arrayEntry of arrayContext) {
                if (typeof arrayEntry == "object") {
                    if (arrayEntry["@language"] !== undefined) {
                        languageSet = true;
                    }
                }
            }
            if (!languageSet) {
                arrayContext.push({
                    "@language": TD.DEFAULT_CONTEXT_LANGUAGE
                });
            }
        }
    }

    /**
     * create a new Thing
     *
     * @param title title/identifier of the thing to be created
     */
    produce(td: WoT.ThingDescription): Promise<TuyaThing> {
        return new Promise<TuyaThing>((resolve, reject) => {
            try {
                let newThing: TuyaThing;

                // FIXME should be constrained version that omits instance-specific parts (but keeps "id")
                let template = td;
                this.addDefaultLanguage(template);
                newThing = Helpers.extend(template, new TuyaThing(this.srv, this.secutity));

                // augment Interaction descriptions with interactable functions
                newThing.extendInteractions();

                console.debug("[core/servient]",`WoTImpl producing new ExposedThing '${newThing.title}'`);

                if (this.srv.addThing(newThing)) {
                    resolve(newThing);
                } else {
                    throw new Error("Thing already exists: " + newThing.title);
                }
            } catch (err) {
                reject(new Error("Cannot produce ExposedThing because " + err.message));
            }
        });
    }
}

enum DiscoveryMethod {
    /** does not provide any restriction */
    "any",
    /** for discovering Things defined in the same device */
    "local",
    /** for discovery based on a service provided by a directory or repository of Things  */
    "directory",
    /** for discovering Things in the device's network by using a supported multicast protocol  */
    "multicast"
}

class ThingDiscoveryImpl implements WoT.ThingDiscovery {
    filter?: WoT.ThingFilter;
    active: boolean;
    done: boolean;
    error?: Error;
    constructor(filter?: WoT.ThingFilter) {
        this.filter = filter ? filter : null;
        this.active = false;
        this.done = false;
        this.error = new Error("not implemented");
    }

    start(): void {
        this.active = true;
    }
    next(): Promise<WoT.ThingDescription> {
        return new Promise<WoT.ThingDescription>((resolve, reject) => {
            reject(this.error); // not implemented
        });
    }
    stop(): void {
        this.active = false;
        this.done = false;
    }
}
