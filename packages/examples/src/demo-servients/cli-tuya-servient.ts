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

import * as WoT from "wot-typescript-definitions";
import { Servient, Helpers } from "../../../core/src/core";
import { HttpsClientFactory, HttpClientFactory, HttpServer } from "../../../binding-http/src/http";

//estendo il servient per configurarlo come necessario
export default class tuyaServient extends Servient{
    private static readonly defaultConfig = {
        servient: {
            clientOnly: false,
            scriptAction: false
        },
        http: {
            port: 8080,
            selfSigned: false
        }
    }

    public readonly config: any;

    //nel costruttore non faccio nulla di particolare se non caricare le informazioni dal config e inizializzare la credential di tuya che verrà poi usata dalle thing
    public constructor(clientOnly: boolean, config?: any) {
        super();

        // init config
        this.config = (typeof config === "object") ? config : tuyaServient.defaultConfig;
        if (!this.config.servient) this.config.servient = tuyaServient.defaultConfig.servient;

        // apply flags
        if (clientOnly) {
            if (!this.config.servient) { this.config.servient = {}; }
            this.config.servient.clientOnly = true;
        }

        // load credentials from config
        this.addCredentials(this.config.credentials);
        // remove secrets from original for displaying config (already added)
        if(this.config.credentials) delete this.config.credentials;

        // display
        console.info("TuyaServient configured with");
        console.dir(this.config);

        // apply config
        if (typeof this.config.servient.staticAddress === "string") {
            Helpers.setStaticAddress(this.config.servient.staticAddress);
        }
        if (!this.config.servient.clientOnly) {

            if (this.config.http !== undefined) {
                let tuyaServer = new HttpServer(this.config.http);
                this.addServer(tuyaServer as any);
            }
        }
        this.addClientFactory(new HttpsClientFactory());
        this.addClientFactory(new HttpClientFactory());
    }

    //sovrascritta la start per esporre la thing direttamente senza doverlo fare da un altro script
    public start(): Promise<WoT.WoT> {
        return new Promise<WoT.WoT>((resolve, reject) => {
            super.start().then((myWoT: WoT.WoT) => {
                console.info("DefaultServient started");
                let TD = {
                    "title":"bff89e2b5a8e1516d6l89a",
                    "description":"an exemple TD of a real tuya smart rgb bulb. The id and region field are needed for connections porpouses",
                    "@context":["https://www.w3.org/2019/wot/td/v1"],
                    "securityDefinitions": {
                        "TuyaCredential": {
                            "scheme": "TuyaCredential"
                        }
                    },
                    "security": [
                        "TuyaCredential"
                    ],
                    "properties":{
                        "switch_led":{
                            "type":"boolean",
                            "description":"True if the bulb is on, false otherways"
                        },
                        "work_mode":{
                            "type":"string",
                            "enum":["white","colour","scene","music"],
                            "description":"The type of the bulb current working state:\nwhite for only white color,\ncolour for hsv custom value,\nscene for custom scene value,\nmusic for color changing on music value"
                        },
                        "bright_value_v2":{
                          "type":"integer",
                          "minimum":0,
                          "maximum":1000,
                          "description":"The brightness of the bulb"
                        },
                        "temp_value_v2":{
                            "type":"integer",
                            "minimum":0,
                            "maximum":1000,
                            "description":"The color temperature of the bulb"
                        },
                        "colour_data_v2":{
                          "type":"object",
                            "properties":{
                                "h":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":360,
                                    "description":"h value of hsv color"
                                },
                                "s":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":1000,
                                    "description":"s value of hsv color"
                                },
                                "v":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":1000,
                                    "description":"v value of hsv color"
                                }
                            },
                            "description":"The color of the bulb, visible only in colour mode. The value is expressed in hsv values"
                        },
                        "scene_data_v2":{
                            "type":"object",
                            "properties":{
                                "scene_num":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":8,
                                    "description":"The unit value of the scene"
                                },
                                "scene_units":{
                                    "type":"object",
                                    "properties":{
                                        "unit_change_mode":{
                                            "type":"string",
                                            "enum":["static","jump","gradient"],
                                            "description":"The type of transition between scenes"
                                        },
                                        "unit_switch_duration":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":100,
                                            "description":"The duration of the transition between scenes"
                                        },
                                        "unit_gradient_duration":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":100,
                                            "description":"The duration of the gradient"
                                        },
                                        "bright":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":1000,
                                            "description":"The brightness of the bulb"
                                        },
                                        "temperature":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":1000,
                                            "description":"The temperature of the bulb"
                                        },
                                        "h":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":360,
                                            "description":"h value of hsv color"
                                        },
                                        "s":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":1000,
                                            "description":"s value of hsv color"
                                        },
                                        "v":{
                                            "type":"integer",
                                            "minimum":0,
                                            "maximum":1000,
                                            "description":"v value of hsv color"
                                        }
                                    },
                                    "description":"the values of the scenes of the bulb"
                                }
                            },
                            "description":"the scene value of the bulb"
                        },
                        "countdown_1":{
                            "type":"integer",
                            "minimum":0,
                            "maximum":86400,
                            "description":"Countdown duration before switch off of the bulb"
                        },
                        "music_data":{
                            "type":"object",
                            "properties":{
                                "change_mode":{
                                    "type":"string",
                                    "enum":["direct","gradient"],
                                    "description":"Type of transition of the mode"
                                },
                                "bright":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":1000,
                                    "description":"The brightness of the bulb"
                                },
                                "temperature":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":1000,
                                    "description":"The temperature of the bulb"
                                },
                                "h":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":360,
                                    "description":"h value of hsv color"
                                },
                                "s":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":255,
                                    "description":"s value of hsv color"
                                },
                                "v":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":255,
                                    "description":"v value of hsv color"
                                }
                            },
                            "description":"The values used by the bulb for the music mode"
                        },
                        "control_data":{
                            "type":"object",
                            "properties":{
                                "change_mode":{
                                    "type":"string",
                                    "enum":["direct","gradient"],
                                    "description":"Type of transition of the mode"
                                },
                                "bright":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":1000,
                                    "description":"The brightness of the bulb"
                                },
                                "temperature":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":1000,
                                    "description":"The temperature of the bulb"
                                },
                                "h":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":360,
                                    "description":"h value of hsv color"
                                },
                                "s":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":255,
                                    "description":"s value of hsv color"
                                },
                                "v":{
                                    "type":"integer",
                                    "minimum":0,
                                    "maximum":255,
                                    "description":"v value of hsv color"
                                }
                            },
                            "description":"control values of the bulb"
                        }
                    },
                    "actions":{
                
                    }
                }
                myWoT.produce(TD)
                    .then((thing) => {
                        thing.expose().then(() => {
                            // pass on WoTFactory
                            resolve(myWoT);
                        }).catch((err) => {console.log("err thing " + err); reject(err)});
                    });
                }).catch((err:any) => {console.log("err wot " + err); reject(err)});
        });
    }    
}