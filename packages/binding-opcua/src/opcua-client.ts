/*******************************************************************************
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

/**
 * Opcua protocol binding
 */
import { ProtocolClient, Content } from "@node-wot/core"
import * as TD from "@node-wot/td-tools";

import * as Url from 'url-parse';

import { OpcuaForm, OpcuaConfig } from "./opcua"
import {
	OPCUAClient,
	MessageSecurityMode, SecurityPolicy,
	AttributeIds,
	ClientSubscription,
	TimestampsToReturn,
	MonitoringParametersOptions,
	ReadValueIdLike,
	ClientMonitoredItem,
	DataType,
	DataValue,
	UserTokenType
} from "node-opcua-client";
import { StatusCodes } from "node-opcua-status-code"
import * as crypto_utils from "node-opcua-crypto";
import { Subscription } from "rxjs/Subscription";

export default class OpcuaClient implements ProtocolClient {
	private client: OPCUAClient;
	private credentials: any;
	private session: any;
	private clientOptions: any;
	private config: OpcuaConfig;
	constructor(_config: OpcuaConfig = null) {

		this.credentials = null;
		this.session = null;
		this.clientOptions = {
			applicationName: "Client",
			keepSessionAlive: true,
			securityMode: MessageSecurityMode.None,
			securityPolicy: SecurityPolicy.None,
			connectionStrategy: {
				initialDelay: 0,
				maxRetry: 1
			},
			requestedSessionTimeout: 10000,
			endpoint_must_exist: false
		}
		if (_config) {
			this.config = _config;
		}

	}

	public toString() {
		return "[OpcuaClient]";
	}

	public dataTypetoString() {
		return "opc:dataType";
	}

	private async connect(endpointUrl: string, next?: () => void) {
		let userIdentity: any;

		if (this.credentials) {
			if (this.credentials.password) {
				userIdentity = {
					userName: this.credentials.username,
					password: this.credentials.password,
					type: UserTokenType.UserName,
				};
			} else if (this.credentials.clientCertificate) {

				const clientCertificate: crypto_utils.Certificate = crypto_utils.readCertificate(this.credentials.clientCertificate);
				const privateKey: crypto_utils.PrivateKeyPEM = crypto_utils.readPrivateKeyPEM(this.credentials.clientPrivateKey);
				this.clientOptions.securityMode = MessageSecurityMode.SignAndEncrypt;
				this.clientOptions.securityPolicy = SecurityPolicy.Basic256Sha256,
					this.clientOptions.certificateFile = this.credentials.clientCertificate,
					this.clientOptions.privateKeyFile = this.credentials.clientPrivateKey,
					this.clientOptions.serverCertificate = crypto_utils.readCertificate(this.credentials.serverCertificate)
				userIdentity = {
					certificateData: clientCertificate,
					privateKey,
					type: UserTokenType.Certificate,
				};
			}
		} else {
			userIdentity = null
		}
		this.client = OPCUAClient.create(this.clientOptions);
		await this.client.connect(endpointUrl);
		this.session = await this.client.createSession(userIdentity);

		/*this.client.on('connection_lost', () => { //FIXME, NOT WORKING because of framework?
		});
		this.session.on('closed', () => {
			console.log('Client connection has been reestablished')
			//this.session.close();
			this.client.disconnect();
			this.session = null;
		});*/
		if (next) { //callback version
			next();
		}

	}

	public async readResource(form: OpcuaForm, schema?: TD.BaseSchema): Promise<Content> {
		let url = new Url(form.href);
		let endpointUrl = url.origin;
		let method = form["opc:method"] ? form["opc:method"] : "READ";

		let contentType = "application/json";

		if (this.session === null) {
			try {
				await this.connect(endpointUrl);
			} catch (err) {
				console.log(err);
				throw err;
			}
		}

		let result: any;

		try {
			let params: {
				ns: string;
				idtype: string;
				mns: string;
				midtype: string;
			} = this.extract_params(url.pathname.toString().substr(1));

			let nodeId = params.ns + ';' + params.idtype;
			const nodeToRead = {
				nodeId: nodeId
			};

			result = await this.session.read(nodeToRead);
			result = JSON.stringify(result);
		} catch (err) {
			console.log(err);
			throw err;
		}

		return new Promise<Content>((resolve, reject) => {
			resolve({ type: contentType, body: Buffer.from(result) });
		});
	}

	public async writeResource(form: OpcuaForm, content: Content, schema?: TD.BaseSchema): Promise<any> {

		let payload: any = JSON.parse((content.body).toString());
		let url = new Url(form.href);
		let endpointUrl = url.origin;
		let method = form["opc:method"] ? form["opc:method"] : "WRITE";

		let tmp_schema = <any>schema;
		let dataType_string = this.dataTypetoString();

		if (!tmp_schema) {
			throw new Error("Mandatory \"schema\" field missing in the TD");
		}
		if (!tmp_schema[dataType_string] || ((tmp_schema.properties) && !(dataType_string in tmp_schema.properties))) {
			throw new Error(`opc:dataType field not specified for writeResource`);
		}
		let contentType = "application/json";
		let dataType = tmp_schema[dataType_string] ? tmp_schema[dataType_string] : tmp_schema.properties[dataType_string];
		let res: Boolean = false;
		dataType = this.getOPCUADataType(dataType);

		if (this.session === null) {
			try {
				await this.connect(endpointUrl);
			} catch (err) {
				console.log(err);
				throw err;
			}
		}

		let result: any;
		let params: {
			ns: string;
			idtype: string;
			mns: string;
			midtype: string;
		} = this.extract_params(url.pathname.toString().substr(1));
		let nodeId = params.ns + ';' + params.idtype;

		try {
			let nodeToWrite = {
				nodeId: nodeId,
				attributeId: AttributeIds.Value,
				value: /* DataValue */ {
					sourceTimestamp: new Date(),
					statusCode: StatusCodes.Good,
					value: /* Variant */ {
						dataType: dataType,
						value: payload
					}
				},
			}
			result = await this.session.write(nodeToWrite);
			if (result._name === "Good" && result.value === 0) {
				res = true;
			}
		} catch (err) {
			console.log(err);
			throw err;
		}


		return new Promise<any>((resolve, reject) => {
			if (res) {
				resolve();
			} else {
				reject(new Error("Error while writing property"));
			}
		});

	}

	public async invokeResource(form: OpcuaForm, content: Content, input?: TD.DataSchema, output?: TD.DataSchema): Promise<any> {

		let payload: any = JSON.parse((content.body).toString());
		let url = new Url(form.href);

		let endpointUrl = url.origin;
		let method = form["opc:method"] ? form["opc:method"] : "CALL_METHOD";


		let contentType = "application/json";
		if (this.session === null) {
			try {
				await this.connect(endpointUrl);
			} catch (err) {
				console.log(err);
				throw err;
			}
		}

		let result: any;
		let params: {
			ns: string;
			idtype: string;
			mns: string;
			midtype: string;
		} = this.extract_params(url.pathname.toString().substr(1));
		let objectId = params.ns + ';' + params.idtype;
		let nodeId = params.mns + ';' + params.midtype;
		let methodToCalls: any[] = [];
		let req;
		if (method === "CALL_METHOD") {
			try {
				req = this.makeInvokeRequest(objectId, nodeId, payload, input);
				methodToCalls.push(req);
				result = await this.session.call(methodToCalls);
				var status = result[0].statusCode;
				if (status._value !== 0 || status._name !== 'Good') {
					console.log(status);
					throw new Error(status);
				}
			} catch (err) {
				throw err;
			}
			return new Promise<Object>((resolve, reject) => {
				resolve({ type: contentType, body: result[0].outputArguments[0] });
			});
		}
	}

	public unlinkResource(form: OpcuaForm): Promise<any> {
		return new Promise<Object>((resolve, reject) => {
			reject(new Error(`OpcuaClient does not implement unlink`));
		});
	}

	private async checkConnection(endpointUrl: string) {
		if (this.session === null) {
			try {
				await this.connect(endpointUrl);
			} catch (err) {
				console.log(err);
				throw err;
			}
		}
		return;
	}
	public subscribeResource(form: OpcuaForm, next: ((value: any) => void), error?: (error: any) => void, complete?: () => void): any {

		let url = new Url(form.href);
		let endpointUrl = url.origin;
		let contentType = "application/json";
		let self = this;
		this.checkConnection(endpointUrl).then(function () {
			try {
				let params: {
					ns: string;
					idtype: string;
					mns: string;
					midtype: string;
				} = self.extract_params(url.pathname.toString().substr(1));
				let nodeId = params.ns + ';' + params.idtype;

				let subscription: any;
				const defaultSubscriptionOptions = {
					requestedPublishingInterval: 1000,
					requestedLifetimeCount: 100,
					requestedMaxKeepAliveCount: 10,
					maxNotificationsPerPublish: 100,
					publishingEnabled: true,
					priority: 10
				};
				if (self.config && self.config.subscriptionOptions) {
					subscription = ClientSubscription.create(self.session, self.config.subscriptionOptions);
				} else {
					subscription = ClientSubscription.create(self.session, defaultSubscriptionOptions);
				}

				const itemToMonitor: ReadValueIdLike = {
					nodeId: nodeId,
					attributeId: AttributeIds.Value
				};
				const parameters: MonitoringParametersOptions = {
					samplingInterval: 100,
					discardOldest: true,
					queueSize: 10
				};

				const monitoredItem = ClientMonitoredItem.create(
					subscription,
					itemToMonitor,
					parameters,
					TimestampsToReturn.Both
				);

				monitoredItem.on("changed", (dataValue: DataValue) => {
					next({ type: contentType, body: dataValue.value });
					return new Subscription(() => { });
				});
			} catch (err) {
				error(new Error(`Error while subscribing property`));
			}


		}).catch(err => error(err));
	}

	public start(): boolean {
		return true;
	}

	public stop(): boolean {
		return true;
	}

	public setSecurity(metadata: Array<TD.SecurityScheme>, credentials?: any): boolean {

		if (metadata === undefined || !Array.isArray(metadata) || metadata.length == 0) {
			console.warn(`OpcuaClient without security`);
			return false;
		}
		if (!credentials || (!(credentials.password) && !(credentials.privateKey))) {
			console.warn(`Both password and certificate missing inside credentials`);
		}
		this.credentials = credentials;
	}



	private getOPCUADataType(string_type: string) {
		switch (string_type) {
			default:
				console.warn(`dataType "${string_type}" not found, using "Double" as default`)
				return DataType.Double;
			case "Null": return DataType.Null;
			case "Boolean": return DataType.Boolean;
			case "Sbyte": return DataType.SByte;
			case "Byte": return DataType.Byte;
			case "Int16": return DataType.Int16;
			case "UInt16": return DataType.UInt16;
			case "Int32": return DataType.Int32;
			case "UInt32": return DataType.UInt32;
			case "Int64": return DataType.Int64;
			case "UInt64": return DataType.UInt64;
			case "Float": return DataType.Float;
			case "Double": return DataType.Double;
			case "String": return DataType.String;
			case "DateTime": return DataType.DateTime;
			case "Guid": return DataType.Guid;
			case "ByteString": return DataType.ByteString;
			case "XmlElement": return DataType.XmlElement;
			case "NodeId": return DataType.Guid;
			case "ExpandedNodeId": return DataType.ExpandedNodeId;
			case "StatusCode": return DataType.StatusCode;
			case "QualifiedName": return DataType.QualifiedName;
			case "LocalizedText": return DataType.LocalizedText;
			case "ExtensionObject": return DataType.ExtensionObject;
			case "DataValue": return DataType.DataValue;
			case "Variant": return DataType.Variant;
			case "DiagnosticInfo": return DataType.DiagnosticInfo;
		}
	}

	private makeInvokeRequest(objectId: string, nodeId: string, payload: any, schema?: TD.DataSchema) {
		let obj: any = {
			methodId: nodeId,
			objectId: objectId
		};
		let inputArguments: any[] = [];
		let tmp_schema = <any>schema;
		if (!tmp_schema) {
			throw new Error("Mandatory \"input\" field missing in the TD");
		}
		if (tmp_schema.type === 'object' && !tmp_schema.properties) {
			throw new Error("Mandatory  \"properties\" field missing in the \"input\"");
		}
		let properties = tmp_schema.properties;
		let dataType_string = this.dataTypetoString();
		if (properties) { //multiple inputs
			for (let key in payload) {
				let tmp_obj: any = {};
				if (!(key in properties) || !(dataType_string in properties[key])) {
					throw new Error(`dataType field not specified for parameter "${key}"`);
				}
				let tmp_dataType = properties[key][dataType_string];
				tmp_obj.dataType = this.getOPCUADataType(tmp_dataType);
				tmp_obj.value = payload[key];
				inputArguments.push(tmp_obj);
			}
		} else { //single input
			if (!(dataType_string in tmp_schema)) {
				throw new Error(`dataType field not specified for input "${payload}"`);
			}
			let tmp_obj: any = {};
			let tmp_dataType = tmp_schema[dataType_string];
			tmp_obj.dataType = this.getOPCUADataType(tmp_dataType)
			tmp_obj.value = payload;
			inputArguments.push(tmp_obj);
		}
		obj.inputArguments = inputArguments;
		return obj;
	}

	private extract_params(url: string): { ns: string; idtype: string; mns: string; midtype: string } {
		let res: {
			ns: string;
			idtype: string;
			mns: string;
			midtype: string;
		} = {
			ns: null,
			idtype: null,
			mns: null,
			midtype: null
		}
		for (let i = 0; i < url.split(';').length; i++) {
			let value = url.split(';')[i];
			if (value.includes('mns=')) {
				res.mns = value.replace('mns', 'ns');
			} else if (value.includes('ns=')) {
				res.ns = value;
			} else if (value.includes('mb=') || value.includes('ms=') || value.includes('mg=') || value.includes('mi=')) {
				let midtype = value.split('=')[0];
				midtype = midtype.substr(1);
				res.midtype = midtype + '=' + value.split('=')[1];
			} else if (value.includes('b=') || value.includes('s=') || value.includes('g=') || value.includes('i=')) {
				res.idtype = value;
			}
		}
		return res;
	}
}