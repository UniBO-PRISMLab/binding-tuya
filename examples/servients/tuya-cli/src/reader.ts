// client.js

import { HttpClientFactory } from "@node-wot/binding-http";
import TuyaClientFactory from "../../../../packages/binding-tuya/src/tuya-client-factory";

// Required steps to create a servient for a client
import { Servient, Helpers } from "../../../../packages/core/src/core";

const servient = new Servient();
const WoTHelpers = new Helpers(servient);
servient.addClientFactory( new TuyaClientFactory());
servient.addClientFactory( new HttpClientFactory());
servient.addCredentials({
    "bff89e2b5a8e1516d6l89a":{
        "scheme":"TuyaCredential",
        "key":"key",
        "secret":"secret",
        "region":"eu"
    }
})
WoTHelpers.fetch("http://127.0.0.1:8080/bff89e2b5a8e1516d6l89a").then(async (td:any) => {
    try {
        servient.start().then(async (WoT:any) => {
            // Then from here on you can consume the thing
            let thing = await WoT.consume(td);
            let color = await thing.readProperty("work_mode");
            console.log(color);
            let newCOlor = {
                "h":240,
                "s":100,
                "v":100
            }
            await thing.writeProperty("work_mode", 'colour');
            color = await thing.readProperty("work_mode");
            console.log(color);
        });
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err:any) => { console.error("Fetch error:", err); });