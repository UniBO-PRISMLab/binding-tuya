1. Run `npm install` && `npm build` in the main folder to compile everything
2. Run `npm install` inside this folder
3. Run `npm run build` inside this folder
4. Remove the following 3/4 lines in JS file "tuya-client" of folder `dist/examples/servients/tuya-cli/src/` 
```
Object.defineProperty(exports, "__esModule", { value: true });
require("wot-typescript-definitions");
let WoT;
let WoTHelpers;
```

I've modified the following files in binding-http:
-http-client.ts
-http-server.ts
-http.ts

I've modified the following files in td-tools:
-thing-description.ts

a brief comment has been added before any modification I've made 