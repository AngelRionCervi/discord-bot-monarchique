"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = __importDefault(require("discord.js"));
var dotenv_1 = __importDefault(require("dotenv"));
var tools_1 = require("./tools");
var commands_1 = __importDefault(require("./commands"));
dotenv_1.default.config();
var client = new discord_js_1.default.Client();
var plugins = commands_1.default(client);
client.login(process.env.BOT_TOKEN);
client.on("ready", function () {
    console.log("bot logged in 👍");
});
client.on("message", function (msg) {
    if (msg.author.bot)
        return;
    var _a = tools_1.parseCmd(msg.content), prefix = _a.prefix, args = _a.args;
    if (Object.keys(plugins).includes(prefix)) {
        plugins[prefix].newQuery(msg, args);
    }
    if (msg.content === "yo") {
        msg.reply("yo");
    }
    if (msg.content === "pff") {
        msg.reply("hihi");
    }
});
