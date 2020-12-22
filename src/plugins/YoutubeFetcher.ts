import { Client, Message } from "discord.js";
import ytSearch from "yt-search";

export default class {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    newQuery(msg: Message, args: string[]) {
        const searchQuery = args.join(" ");
        if (searchQuery) {
            ytSearch(searchQuery)
                .then((res) => {
                    const result: any = res.all.filter((r) => r.type === "video")?.[0];
                    if (result) {
                        msg.channel.send(result.url);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    msg.channel.send("Impossible de trouver une vidéo 🤔");
                });
        } else {
            msg.channel.send("Impossible de trouver une vidéo 🤔");
        }
    }
}
