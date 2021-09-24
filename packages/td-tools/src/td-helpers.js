"use strict";
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
exports.__esModule = true;
exports.findPort = exports.findProtocol = void 0;
/**
 * Find interaction by name
 * @param td ThingDescription instance that keeps the interactions
 * @param name of the interaction which is searched for
 */
/*
export function findInteractionByName(td: ThingDescription, name: string) {
  let res = td.interaction.filter((ia) => ia.name === name)
  return (res.length > 0) ? res[0] : null;
}
*/
/**
 * Find interaction by name AND interaction type
 * @param td ThingDescription instance that keeps the interactions
 * @param name of the interaction which is searched for
 */
/*
export function findInteractionByNameType(td: ThingDescription, name: string, pattern: TD.InteractionPattern) {
  let res = td.interaction.filter((ia) => ia.pattern === pattern && ia.name === name)
  return (res.length > 0) ? res[0] : null;
}
*/
/**
 * Find interaction by semantic characteristics / vocabularies
 * @param td ThingDescription instance that keeps the interactions
 * @param vocabularies list of vocabularies which has to be annotated the resource interacion
 */
/*
export function findInteractionBySemantics(td: ThingDescription, vocabularies: Array<string>) {
  // let res = td.interactions.filter((ia) => ia.rdfType.filter((v)=> v.match(vocabularies)))
  // TODO
  return '';
}
*/
//need two tests
function findProtocol(td) {
    var base = td.base;
    var columnLoc = base.indexOf(":");
    return base.substring(0, columnLoc);
}
exports.findProtocol = findProtocol;
function findPort(td) {
    var base = td.base;
    var columnLoc = base.indexOf(':', 6);
    var divLoc = base.indexOf('/', columnLoc);
    var returnString = base.substring(columnLoc + 1, divLoc);
    return parseInt(returnString);
}
exports.findPort = findPort;
