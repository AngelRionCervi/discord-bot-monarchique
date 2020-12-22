"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yt_search_1 = __importDefault(require("yt-search"));
var default_1 = /** @class */ (function () {
    function default_1(client) {
        this.client = client;
    }
    default_1.prototype.newQuery = function (msg, args) {
        var searchQuery = args.join(" ");
        if (searchQuery) {
            yt_search_1.default(searchQuery)
                .then(function (res) {
                var _a;
                var result = (_a = res.all.filter(function (r) { return r.type === "video"; })) === null || _a === void 0 ? void 0 : _a[0];
                if (result) {
                    msg.channel.send(result.url);
                }
            })
                .catch(function (err) {
                console.log(err);
                msg.channel.send("Impossible de trouver une vidéo 🤔");
            });
        }
        else {
            msg.channel.send("Impossible de trouver une vidéo 🤔");
        }
    };
    return default_1;
}());
exports.default = default_1;
