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

5. place the necessary key and secret in the "config.js" file
6. Run with node dist/examples/servients/tuya-cli/src/tuya-cli.js -f config.json dist/examples/servients/tuya-cli/src/reader.js

I've modified the following files in binding-http:
-http-client.ts
-http-server.ts
-http.ts

I've modified the following files in td-tools:
-thing-description.ts

a brief comment has been added before any modification I've made 