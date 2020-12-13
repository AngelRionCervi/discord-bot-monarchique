import {
    Client,
    DiscordAPIError,
    DMChannel,
    Message,
    NewsChannel,
    TextChannel,
    VoiceChannel,
} from "discord.js";
import ytSearch from "yt-search";
import ytdl from "ytdl-core";

type Flags = {
    force: boolean;
    stop: boolean;
    emptyQueue: boolean;
    skip: boolean;
    showQueue: boolean;
    deleteLast: boolean;
    last: boolean;
};
type VideoData = { videoId: string; title: string; image: string, url: string };

export default class {
    private queue: any[];
    private isPlaying: boolean;
    private flagList: { [key: string]: string };
    private client: Client;
    private soloFlagList: string[];
    private lastPlayed: any;
    private prefix: string;
    constructor(client: Client, prefix: string) {
        this.queue = [];
        this.isPlaying = false;
        this.lastPlayed = null;
        this.flagList = {
            force: "-force",
            stop: "-stop",
            emptyQueue: "-empty-queue",
            skip: "-skip",
            showQueue: "-show-queue",
            deleteLast: "-delete-last",
            last: "-last",
        };
        this.soloFlagList = ["stop", "emptyQueue", "skip", "showQueue", "deleteLast", "last"];
        this.client = client;
        this.prefix = prefix;
    }

    private __getFlags(content: string): Flags {
        return Object.keys(this.flagList).reduce((acc, key) => {
            return { ...acc, [key]: content.includes(this.flagList[key]) };
        }, {} as Flags);
    }

    private __getQuery(content: string, filterFlags: boolean = false): string | null {
        return (
            content
                .split(" ")
                .filter((c) => {
                    const noPrefix = c !== this.prefix;
                    if (filterFlags) {
                        return !Object.values(this.flagList).includes(c) && noPrefix;
                    }
                    return noPrefix;
                })
                .join(" ") || null
        );
    }

    private __handleFlags(
        textChannel: TextChannel | DMChannel | NewsChannel,
        voiceChannel: VoiceChannel,
        flags: Flags,
        data: VideoData
    ) {
        const { force, stop, emptyQueue, skip, showQueue, deleteLast, last } = flags;

        if (stop) {
            voiceChannel.leave();
            this.isPlaying = false;
            return false;
        }

        if (emptyQueue) {
            this.queue.splice(0, this.queue.length);
            textChannel.send("La queue est vide 😥");
            return false;
        }

        if (deleteLast) {
            const last = this.queue.pop();
            textChannel.send(`${last.title}\nenlevé de la queue 👍`);
            return false;
        }

        if (last && this.isPlaying) {
            textChannel.send(`${this.lastPlayed.title}`);
            return false;
        }

        if (showQueue) {
            if (this.queue.length > 0) {
                textChannel.send(this.queue.map((q, i) => `${i + 1}. ${q.title}`).join(", "));
            } else {
                textChannel.send("Aucune musique dans la queue 🤔");
            }
            return false;
        }

        if (!force && data.videoId) {
            this.queue.push(data);
            if (this.isPlaying) {
                textChannel.send(`${data.title}\najouté à la queue 👍`);
            }
        }

        if (!force && this.queue.length === 0) {
            textChannel.send("Aucune musique dans la queue 🤔");
            return false;
        }

        if (force || !this.isPlaying || (this.isPlaying && skip)) {
            return { force };
        }

        return false;
    }

    private __playerHandler(
        textChannel: TextChannel | DMChannel | NewsChannel,
        voiceChannel: VoiceChannel,
        data: VideoData,
        flags: Flags
    ) {
        const willPlay = this.__handleFlags(textChannel, voiceChannel, flags, data);

        if (willPlay === false) return;

        const play = (isForced: boolean) => {
            voiceChannel
                .join()
                .then((connection: any) => {
                    const corData = isForced ? data : this.queue.shift();
                    connection
                        .play(ytdl(corData.videoId))
                        .on("start", () => {
                            this.isPlaying = true;
                            this.lastPlayed = corData;
                            const msg = `🎵 ${corData.title} 🎵\n${corData.url}`;
                            textChannel.send(msg);
                        })
                        .on("finish", () => {
                            if (this.queue.length > 0) {
                                play(false);
                            } else {
                                textChannel.send("Ma mission est terminée 🤖");
                                voiceChannel.leave();
                            }
                            this.isPlaying = false;
                        })
                        .on("error", (error: DiscordAPIError) => {
                            this.isPlaying = false;
                            console.error(error);
                        });
                })
                .catch((err) => {
                    console.log("unable to join channel", err);
                });
        };

        play(willPlay.force);
    }

    private __queryChecks(msg: Message) {
        if (!msg.member?.voice.channel) {
            msg.channel.send("Tu doit être dans un channel pour mettre de la musique");
            setTimeout(() => {
                msg.channel.send("🤡");
            }, 2000);
            return false;
        }
        return true;
    }

    private __checkSoloFlags(flags: Flags): boolean {
        for (const [key, val] of Object.entries(flags)) {
            if (this.soloFlagList.includes(key) && val === true) {
                return true;
            }
        }
        return false;
    }

    newQuery(msg: Message) {
        const flags = this.__getFlags(msg.content);
        const searchQuery = this.__getQuery(msg.content, true);
        const voiceChannel: VoiceChannel | undefined | null = msg.member?.voice.channel;
        const videoData: VideoData = {
            videoId: "",
            title: "",
            image: "",
            url: "",
        };
        if (this.__queryChecks(msg) && voiceChannel) {
            if (searchQuery) {
                ytSearch(searchQuery).then((res) => {
                    const result: any = res.all.filter((r) => r.type === "video")?.[0];
                    if (result) {
                        videoData.videoId = result.videoId;
                        videoData.title = result.title;
                        videoData.image = result.thumbnail;
                        videoData.url = result.url;
                        this.__playerHandler(msg.channel, voiceChannel, videoData, flags);
                    }
                });
            } else if (this.__checkSoloFlags(flags)) {
                this.__playerHandler(msg.channel, voiceChannel, videoData, flags);
            }
        }
    }
}
