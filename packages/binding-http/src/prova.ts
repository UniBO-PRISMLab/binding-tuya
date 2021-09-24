import { HttpClient, HttpHeader } from "./http";
import { TuyaCredentialSecurityScheme } from "../../td-tools/src/td-tools";
import { Credential } from "./credential";

(async() =>{


    let client: HttpClient = new HttpClient({ allowSelfSigned: true},true);
    let schema: TuyaCredentialSecurityScheme = {
        scheme :"TuyaCredential", 
        key :"geuntsnaarzshct0hsuh", 
        secret : "b25914ccbaa34f1fa18351112b20a00c", 
        region :'eu'
    };
    client.setSecurity([schema]);
    let body = {
        "commands": [
            {
            "code":"switch_led",
            "value":true
            }
        ]
    }
    let write = client.invokeResource(
        {
            href:'https://openapi.tuyaeu.com/v1.0/devices/bff89e2b5a8e1516d6l89a/commands',
        },
        {
            type:'object',
            body:Buffer.from(JSON.stringify(body))
        }
        
    );
    console.log(await (await (await write).body).toString())
})();