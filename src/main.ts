import Discord from "discord.js";
import dotenv from "dotenv";
import { parseCmd } from "./tools";
import Plugins from "./commands";

dotenv.config();
const client = new Discord.Client();
const plugins = Plugins(client);

client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
    console.log("bot logged in 👍");
});

client.on("message", (msg) => {
    if (msg.author.bot) return;
    const { prefix, args } = parseCmd(msg.content);

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
