"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SSESubscription = exports.LongPollingSubscription = void 0;
var EventSource = require("eventsource");
var LongPollingSubscription = /** @class */ (function () {
    /**
     *
     */
    function LongPollingSubscription(form, client) {
        this.form = form;
        this.client = client;
        this.closed = false;
    }
    LongPollingSubscription.prototype.open = function (next, error, complete) {
        var _this = this;
        var polling = function () { return __awaiter(_this, void 0, void 0, function () {
            var request, result, buffer, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.client["generateFetchRequest"](this.form, "GET", { timeout: 60 * 60 * 1000 })];
                    case 1:
                        request = _a.sent();
                        console.debug("[binding-http]", "HttpClient (subscribeResource) sending " + request.method + " to " + request.url);
                        return [4 /*yield*/, this.client["fetch"](request)];
                    case 2:
                        result = _a.sent();
                        this.client["checkFetchResponse"](result);
                        return [4 /*yield*/, result.buffer()];
                    case 3:
                        buffer = _a.sent();
                        console.debug("[binding-http]", "HttpClient received " + result.status + " from " + request.url);
                        console.debug("[binding-http]", "HttpClient received headers: " + JSON.stringify(result.headers.raw()));
                        console.debug("[binding-http]", "HttpClient received Content-Type: " + result.headers.get("content-type"));
                        if (!this.closed) {
                            next({ type: result.headers.get("content-type"), body: buffer });
                            polling();
                        }
                        {
                            complete && complete();
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        error && error(e_1);
                        complete && complete();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        polling();
    };
    LongPollingSubscription.prototype.close = function () {
        this.closed = true;
    };
    return LongPollingSubscription;
}());
exports.LongPollingSubscription = LongPollingSubscription;
var SSESubscription = /** @class */ (function () {
    /**
     *
     */
    function SSESubscription(form) {
        this.form = form;
        this.closed = false;
    }
    SSESubscription.prototype.open = function (next, error, complete) {
        var _this = this;
        this.eventSource = new EventSource(this.form.href);
        this.eventSource.onopen = function (event) {
            console.debug("[binding-http]", "HttpClient (subscribeResource) Server-Sent Event connection is opened to " + _this.form.href);
        };
        this.eventSource.onmessage = function (event) {
            console.debug("[binding-http]", "HttpClient received " + JSON.stringify(event) + " from " + _this.form.href);
            var output = { type: _this.form.contentType, body: JSON.stringify(event) };
            next(output);
        };
        this.eventSource.onerror = function (event) {
            error(event.toString());
            complete && complete();
        };
    };
    SSESubscription.prototype.close = function () {
        this.eventSource.close();
    };
    return SSESubscription;
}());
exports.SSESubscription = SSESubscription;
