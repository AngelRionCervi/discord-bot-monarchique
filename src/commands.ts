import { Client } from "discord.js";
import MusicPlayer from "./plugins/MusicPlayer";

const p = "!";

const plugins = (client: Client) => ({
   [`${p}play`]: new MusicPlayer(client, `${p}play`)
})

export default plugins;