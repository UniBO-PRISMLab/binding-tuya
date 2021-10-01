import { ExposedThing, Servient } from "@node-wot/core";
import { TuyaCredential } from "../../binding-http/src/credential";
import fetch, {Request ,Headers} from "node-fetch";
import { Subject } from "rxjs/Subject";
import * as WoT from "wot-typescript-definitions";
import { Content } from "../../core/src/protocol-interfaces";
import * as TD from "@node-wot/td-tools";


export class TuyaThing extends ExposedThing {
    

    private baseUrl:string;
    tuyaSecurity: TuyaCredential;

    security: Array<String>;
    securityDefinitions: { [key: string]: TD.SecurityScheme };

    id: string;
    title: string;
    base: string;
    forms: Array<TD.Form>;

    properties: {
        [key: string]: TD.ThingProperty
    };

    //il construttore necessita ora dei dati necessari per poi fare le richieste ai server tuya
    constructor(servient: Servient, tuyaSecurity: TuyaCredential){
        super(servient);
        this.getServient = () => { return servient; };
        this.tuyaSecurity = tuyaSecurity;
    }

    private getServient: () => Servient;
    private getSubjectTD: () => Subject<any>;
    public getThingDescription(): WoT.ThingDescription {
        return JSON.parse(TD.serializeTD(this));
    }

    //aggiungo solo la riga relativa a baseUrl per rendere più comode le creazioni di chiamate successivamente
    public expose(){
        console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' exposing all Interactions and TD`);
        this.baseUrl = `https://openapi.tuya${this.getThingDescription().region}.com/v1.0/devices/${this.getThingDescription().id}`;
        //this.startSincronizingWithRemoteServer();
        return new Promise<void>((resolve, reject) => {
            // let servient forward exposure to the servers
            this.getServient().expose(this).then(() => {
                // inform TD observers
                this.getSubjectTD().next(this.getThingDescription());
                resolve();
            })
                .catch((err: any) => reject(err));
        });
    }

    private delay(ms: any) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    public readProperty(propertyName:string){
        return new Promise<any>((resolve,reject) =>{
            let url = `${this.baseUrl}/status`;
            //creo la request per il server
            let request: Request = new Request(
                url,
                {
                    headers:new Headers({}),
                    method:'GET'
                }
            )
            //c'è bisogno di una serie infinita di chiamate asincrone quindi si entra un po' in un incubo di Promise.then()
            //la sign ottiene una Request formattata correttamente per fare la richiesta ai server tuya
            this.tuyaSecurity.sign(request).then((rq) =>{
                //fetch per ottenere i dati
                fetch(rq).then((data: any)=>{
                    //i dati sono in un buffer quindi ottengo i dati
                    data.buffer().then((buffer: any)=>{
                        //converto in json e prendo le informazioni utili
                        let json = JSON.parse(buffer.toString());
                        if(!json.success){
                            reject(json);
                        }
                        let results = json.result;
                        //i risultati sono formattati come di seguito:
                        /*
                            [
                                {
                                    code:"...",
                                    value:"..."
                                },
                                {
                                    code:"...",
                                    value:"..."
                                },
                                ...
                            ]
                        */
                        for(let res of results){
                            if(res.code == propertyName){
                                console.debug("[core/exposed-thing]",`ExposedThing '${this.title}' gets internal value '${res.value}' for Property '${propertyName}'`);            
                                resolve(res.value);
                            }
                        }
                    });
                })
            });
        });
    }

    //questa funzione è simile a quella che mi aveva proposto, fa una richiesta ogni 5 secondi al server e aggiorna i dati locali nel caso ci fosse la necessità. 
    private startSincronizingWithRemoteServer(){
        (async()=>{
            while(true){
                let url = `${this.baseUrl}/status`;
                let request: Request = new Request(
                    url,
                    {
                        headers:new Headers({}),
                        method:'GET'
                    }
                )
                let rq = await this.tuyaSecurity.sign(request);
                let status = JSON.parse(await (await (await fetch(rq)).buffer()).toString()).result;
                for(let i = 0; i < status.length; i++){
                    try{
                        let prop = this.properties[status[i].code].getState();
                        if(prop.value != status[i].value){
                            prop.value = status[i].value;
                            console.log(`updating property ${status[i].code} with value ${status[i].value}`)
                        }
                    }catch(e){
                        //console.log("error");
                    }
                }
                await this.delay(5000)
            }
        })();
    }

    //la write non differisce molto dalla standard, semplicemente al posto di fare un'assegnamento uso la "writeAsyncProperty" per scrivere sul server e comportarmi poi di conseguenza alla risposta
    public writeProperty(propertyName: string, value: any, options?: any){
        return new Promise<void>((resolve, reject)=>{
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
                            promiseOrValueOrNil.then((customValue: any) => {
                                console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' sets custom value '${customValue}'`);
                                this.writeAsyncProperty(propertyName, value).then((response) =>{
                                    if(response.success){
                                        console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
                                        resolve();
                                    }else{
                                        reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
                                    }
                                }).catch((customError) => {
                                    console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
                                    reject(customError);
                                });
                            })
                                .catch((customError: any) => {
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
                        this.writeAsyncProperty(propertyName, value).then((response) =>{
                            if(response.success){
                                console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
                                resolve();
                            }else{
                                reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
                            }
                        }).catch((customError) => {
                            console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
                            reject(customError);
                        });
                    }
                } else {
                    console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
                    // write and notify state change
                    this.writeAsyncProperty(propertyName, value).then((response) =>{
                        if(response.success){
                            console.debug("[core/exposed-thing]", `ExposedThing '${this.title}' directly sets Property '${propertyName}' to value '${value}'`);
                            resolve();
                        }else{
                            reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
                        }
                    }).catch((customError) => {
                        console.warn("[core/exposed-thing]", `ExposedThing '${this.title}' write handler for Property '${propertyName}' rejected the write with error '${customError}'`);
                        reject(customError);
                    });
                }
            } else {
                reject(new Error(`ExposedThing '${this.title}', no property found for '${propertyName}'`));
            }
        });
    }

    //le write usano richieste POST formattate come nella variabile "body" e ritornano un oggetto con semplicemente se la richiesta ha avuto successo o meno e il tempo della richiesta
    private async writeAsyncProperty(propertyName: string, value : any){
        let url = `${this.baseUrl}/commands`;

        let body = {
            "commands": [
                {
                "code":propertyName,
                "value":value
                }
            ]
        }

        let request: Request = new Request(
            url,
            {
                headers:new Headers({}),
                method:'POST',
                body:Buffer.from(JSON.stringify(body))
            }
        )
        let rq = await this.tuyaSecurity.sign(request);
        let status = JSON.parse(await (await (await fetch(rq)).buffer()).toString());
        return status;
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