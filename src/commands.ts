import { Client } from "discord.js";
import MusicPlayer from "./plugins/MusicPlayer";

const p = "!";

const plugins = (client: Client) => ({
   [`${p}music`]: new MusicPlayer(client)
})

export default plugins;