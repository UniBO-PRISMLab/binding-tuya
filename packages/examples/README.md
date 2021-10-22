# node-wot Examples

## Demo Servients

Demo servients examples are located in `src\demo-servients`.

## Script Examples 

Script examples are located in

* `src\scripts`
* `src\proxy-scripts`
* `src\testthing`

The idea of these folders is to use TypeScript to work on the examples which offers support in being up-to-date with the current API.

see https://github.com/eclipse/thingweb.node-wot/issues/171.

### Workflow

1. Run `npm run build`
2. Remove the following 3/4 lines in JS files of folder `dist/` 
```
Object.defineProperty(exports, "__esModule", { value: true });
require("wot-typescript-definitions");
let WoT;
let WoTHelpers;
```

3. Copy the according JS file(s) to
* `<node-wot>/examples/scripts`
* `<node-wot>/examples/proxy-scripts`
* `<node-wot>/examples/testthing`


## Test Thing 

Test thing and client is located in `src\testthing`.



### Tuya exlusive things
1. To run the example run `npm install` && `npm run build` in the main directory then remove the following 3/4 lines in JS files of folder `dist/` 
```
Object.defineProperty(exports, "__esModule", { value: true });
require("wot-typescript-definitions");
let WoT;
let WoTHelpers;
```
2. This example needs es5 as target to compile with tsconfig instead of ES2018
3. Complete the config.json file with the tuya releted security data
4. Run with `node dist/examples/src/demo-servients/tuya-cli.js -f config.json dist/examples/src/scripts/tuya-client.js`