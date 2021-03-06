"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MusicPlayer_1 = __importDefault(require("./plugins/MusicPlayer"));
var YoutubeFetcher_1 = __importDefault(require("./plugins/YoutubeFetcher"));
var p = "!";
var plugins = function (client) {
    var _a;
    return (_a = {},
        _a[p + "play"] = new MusicPlayer_1.default(client),
        _a[p + "pff"] = new YoutubeFetcher_1.default(client),
        _a);
};
exports.default = plugins;
