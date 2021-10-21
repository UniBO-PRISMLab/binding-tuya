import "wot-typescript-definitions";
import { Helpers } from "@node-wot/core";

let WoT: WoT.WoT;
let WoTHelpers: Helpers;

WoTHelpers.fetch("http://127.0.0.1:8080/bff89e2b5a8e1516d6l89a").then(async (td:any) => {
    try {
            let thing = await WoT.consume(td);
            let power = await thing.readProperty("switch_led");
            console.log(power);
            await thing.writeProperty("switch_led", !power);
            power = await thing.readProperty("switch_led");
            console.log(power);
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err:any) => { console.error("Fetch error:", err); });