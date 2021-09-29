// client.js
// Required steps to create a servient for a client
const { Servient, Helpers } = require("@node-wot/core");
const { HttpClientFactory } = require('@node-wot/binding-http');

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory());
const WoTHelpers = new Helpers(servient);

WoTHelpers.fetch("http://192.168.1.250:8080/tuya-smart-bulb").then(async (td) => {
    try {
        servient.start().then(async (WoT) => {
            // Then from here on you can consume the thing
            let thing = await WoT.consume(td);
            let led = await thing.readProperty("switch_led");
            console.log(led);
            await thing.writeProperty("switch_led", !led);
            led = await thing.readProperty("switch_led");
            console.log(led);
        });
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err) => { console.error("Fetch error:", err); });