/********************************************************************************
 * Copyright (c) 2018 - 2020 Contributors to the Eclipse Foundation
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

import { APIKeySecurityScheme, TuyaCredentialSecurityScheme } from "../../td-tools/src/td-tools";
import { Token } from "client-oauth2";
import fetch, {Request} from 'node-fetch';
import * as crypto from 'crypto';
import * as queryString from 'query-string';

export abstract class Credential{
    abstract async sign(request:Request):Promise<Request>
}

export class BasicCredential extends Credential{
    private readonly username: string;
    private readonly password: string;
    /**
     *
     */
    constructor({ username, password }: { username: string; password: string; }) {
        super();
        if (username === undefined || password === undefined || 
                username === null || password === null) {
            throw new Error(`No Basic credentials for Thing`);
        }

        this.username = username;
        this.password = password;
    }
    async sign(request:Request){
        let result = request.clone()
        result.headers.set("authorization","Basic "+Buffer.from(this.username + ":" + this.password).toString('base64'))
        return result
    }
}

export class BearerCredential extends Credential{
    private readonly token: string;
    constructor(token:string){
        super();
        if (token === undefined || token === null) {
            throw new Error(`No Bearer credentionals for Thing`);
        }

        this.token = token;
    }
    async sign(request: Request) {
        let result = request.clone()
        result.headers.set("authorization", "Bearer " + this.token)
        return result
    }
}

export class BasicKeyCredential extends Credential{
    private readonly apiKey: string;
    private readonly options: APIKeySecurityScheme;
    
    constructor(apiKey:string,options:APIKeySecurityScheme){
        super();
        if (apiKey === undefined || apiKey === null) {
            throw new Error(`No API key credentials for Thing`);
        }

        this.apiKey= apiKey;
        this.options = options;
    }
    async sign(request: Request) {
        const result = request.clone()
        
        let headerName = "authorization"
        if (this.options.in === "header" && this.options.name !== undefined) {
            headerName = this.options.name;
        }
        result.headers.append(headerName, this.apiKey)
        
        return result
    }
}



export class OAuthCredential extends Credential {
    private token: Token | Promise<Token> ;
    private readonly refresh: () => Promise<Token> ;
   
    /**
     * 
     * @param tokenRequest oAuth2 token instance
     * @param refresh use a custom refresh function
     */
    constructor(token: Token | Promise<Token>,refresh?:() => Promise<Token>) {
        super();
        this.token = token;
        this.refresh = refresh;
        this.token = token
    }
    async sign(request: Request) {
        if (this.token instanceof Promise){
            const tokenRequest = this.token as Promise<Token>
            this.token = await tokenRequest
        }
       
        let tempRequest = {url:request.url,headers:{}}
        
        tempRequest = this.token.sign(tempRequest)
        
        const mergeHeaders = new Request(request,tempRequest)
        
        return mergeHeaders;
    }

    async refreshToken() {
        if(this.token instanceof Promise){
            throw new Error("Uninitialized token. You have to call sing before refresh");
        }

        let newToken 
        if (this.refresh){
            newToken = await this.refresh()
        }else{
            newToken = await this.token.refresh()
        }
        return new OAuthCredential(newToken,this.refresh)
    }
}


export class TuyaCredential extends Credential {

    private key:string;
    private secret:string;
    private baseUri:string;
    private token:string;
    private refresh_Token:string;
    private expireTime:Date;



    constructor(scheme: TuyaCredentialSecurityScheme){
        super();
        this.key = scheme.key;
        this.secret = scheme.secret;
        this.baseUri = scheme.baseUri;
    }
    async sign(request: Request): Promise<any> {

        const isTokenExpired:boolean = this.isTokenExpired();
        if(this.token == undefined || this.token == '' || isTokenExpired){
            await this.requestAndRefreshToken(isTokenExpired);
        }
        let url = (request as any)[Object.getOwnPropertySymbols(request)[1]].parsedURL.href;
        let body = request.body != null ? request.body.toString() : null;
        let headers = this.getHeaders(true,request.headers.raw(),body,url,request.method);
        Object.assign(headers, request.headers.raw());
        return new Request(url,{method:request.method,body:body, headers:headers});
    }

    private async requestAndRefreshToken(refresh:boolean){
        let headers = this.getHeaders(false, {},null,null,null);
        const request = {
            headers:headers,
            method:'GET'
        };
        let url = `${this.baseUri}/token?grant_type=1`;
        if(refresh){
            url = `${this.baseUri}/token/${this.refresh_Token}`;
        }
        let data = await (await fetch(url, request)).json();
        if(data.success){
            this.token = data.result.access_token;
            this.refresh_Token = data.result.refresh_token;
            this.expireTime = new Date(Date.now() + (data.result.expire_time * 1000));
        }else{
            throw new Error("token fetch failed");
            
        }
    }


    private getHeaders(NormalRequest:boolean, headers:any, body:any, url:string, method:string){
        let requestTime = Date.now().toString();
        let replaceUri = this.baseUri.replace("/v1.0","");
        const _url = url != null ? url.replace(`${replaceUri}`,'') : null;
        const sign = this.requestSign(NormalRequest, requestTime, body, headers, _url, method);
        return {
            t:requestTime,
            'client_id': this.key,
            sign_method:"HMAC-SHA256",
            sign,
            access_token: this.token || ''
        }
    }
    
    private requestSign(NormalRequest:boolean, requestTime:string, body:any, headers: any, path:string, method:string){
        const bodyHash = crypto.createHash('sha256').update(body != null ? body : '').digest('hex');
        let signUrl:string = "/v1.0/token?grant_type=1";;
        const headersKeys = Object.keys(headers);
        let headerString = '';
        const useToken = NormalRequest ? this.token : '';
        const _method = method != null ? method : 'GET';
        if(NormalRequest){
            const pathQuery = queryString.parse(path.split('?')[1]);
            let query:any = {}
            query = Object.assign(query, pathQuery);
            let sortedQuery:{[k:string] : string} = {};
            Object.keys(query).sort().forEach(i => sortedQuery[i] = query[i]);
            const qs = queryString.stringify(sortedQuery)
            signUrl = decodeURIComponent(qs?`${path.split('?')[0]}?${qs}`:path);
        }
        const endStr = [this.key, useToken, requestTime, [_method, bodyHash, headerString, signUrl].join('\n')].join('');
        let sign = crypto
            .createHmac('sha256', this.secret)
            .update(endStr)
            .digest('hex')
            .toUpperCase();
        return sign;
    }
    private isTokenExpired(): boolean {
        if(this.expireTime != null){
            return Date.now() > this.expireTime.getTime();
        }
        return false;
    }
}
