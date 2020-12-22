import { Client } from "discord.js";
import MusicPlayer from "./plugins/MusicPlayer";
import YoutubeFetcher from "./plugins/YoutubeFetcher";

const p = "!";

const plugins = (client: Client) => ({
   [`${p}play`]: new MusicPlayer(client),
   [`${p}pff`]: new YoutubeFetcher(client)
})

export default plugins;