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

import { TuyaServient } from '../../../../packages/binding-tuya/src/tuya-servient';
import { TuyaCredentialSecurityScheme } from "../../../../packages/td-tools/src/thing-description";
import { TuyaCredential } from '../../../../packages/binding-http/src/credential';
import { HttpServer } from '@node-wot/binding-http';
import { HttpClientFactory } from '@node-wot/binding-http';
import * as fs from 'fs';


//estendo il servient per configurarlo come necessario
export default class tuyaServient extends TuyaServient{
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
        if(!this.config.tuya) throw("add tuya credentials");
        let secret = this.config.tuya.secret;
        let key = this.config.tuya.key;
        let region = this.config.tuya.region;
        let scheme: TuyaCredentialSecurityScheme = {
            scheme:'TuyaCredential',
            key: key,
            secret: secret,
            region: region
        };

        super.setSecurity(new TuyaCredential(scheme));

        // display
        console.info("TuyaServient configured with");
        console.dir(this.config);

        // apply config
        if (typeof this.config.servient.staticAddress === "string") {
            Helpers.setStaticAddress(this.config.servient.staticAddress);
        }
        if (!this.config.servient.clientOnly) {

            if (this.config.http !== undefined) {
                let httpServer = new HttpServer(this.config.http);
                this.addServer(httpServer);
            }
        }
        this.addClientFactory(new HttpClientFactory());
    }

    //sovrascritta la start per esporre la thing direttamente senza doverlo fare da un altro script
    start(){
        let server = super.start();
        server.then(( WoT )=>{
            let TD = JSON.parse(fs.readFileSync(__dirname + '/TD.json').toString());
            WoT.produce(TD).then((thing) => {
                thing.expose().then(()=>{
                    console.log("thing exposed!");
                })
            });
        })
        return server;
    }
}