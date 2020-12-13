import {
    Channel,
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

type Flags = { force: boolean; stop: boolean; emptyQueue: boolean; skip: boolean; showQueue: boolean };
type VideoData = { videoId: string; title: string; image: string };

export default class {
    private queue: any[];
    private isPlaying: boolean;
    private flagList: { [key: string]: string };
    private client: Client;
    private soloFlagList: string[];
    constructor(client: Client) {
        this.queue = [];
        this.isPlaying = false;
        this.flagList = {
            force: "-force",
            stop: "-stop",
            emptyQueue: "-empty-queue",
            skip: "-skip",
            showQueue: "-show-queue",
        };
        this.soloFlagList = ["stop", "emptyQueue", "skip", "showQueue"];
        this.client = client;
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
                    const noPrefix = c !== "!music";
                    if (filterFlags) {
                        return !Object.values(this.flagList).includes(c) && noPrefix;
                    }
                    return noPrefix;
                })
                .join(" ") || null
        );
    }

    private __playerHandler(
        textChannel: TextChannel | DMChannel | NewsChannel,
        voiceChannel: VoiceChannel,
        data: VideoData,
        flags: Flags
    ) {
        const { force, stop, emptyQueue, skip, showQueue } = flags;
        const { videoId, title, image } = data;

        if (stop) {
            voiceChannel.leave();
            console.log("bye bye");
            return;
        }

        if (emptyQueue) {
            this.queue.splice(0, this.queue.length);
            textChannel.send("La queue est vide 😥");
            return;
        }

        if (showQueue) {
            if (this.queue.length > 0) {
                textChannel.send(this.queue.map((q, i) => `${i + 1}. ${q.title}`).join(", "));
            } else {
                textChannel.send("Aucune musique dans la queue");
            }
            return;
        }

        if (!force && videoId) {
            this.queue.push({ videoId, title, image });
            if (this.isPlaying) {
                textChannel.send(`${title} ajouté à la queue`);
            }
        }

        if (!force && this.queue.length === 0) {
            textChannel.send("Aucune musique dans la queue");
            return;
        }

        const play = (isForced: boolean) => {
            voiceChannel
                .join()
                .then((connection: any) => {
                    const queuedData = this.queue.shift();
                    const corData = isForced ? data : queuedData;
                    connection
                        .play(ytdl(corData.videoId))
                        .on("start", () => {
                            this.isPlaying = true;
                            const msg = `🎵 ${corData.title} 🎵`;
                            textChannel.send(msg, { files: [corData.image] });
                        })
                        .on("finish", () => {
                            if (this.queue.length > 0) {
                                play(false);
                            } else {
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

        if (force || !this.isPlaying || (this.isPlaying && skip)) {
            play(force);
        }
    }

    private queryChecks(msg: Message, searchQuery: string | null) {
        // if (!searchQuery) {
        //     msg.channel.send("Bro je recherche quoi là ?");
        //     return false;
        // } else
        if (!msg.member?.voice.channel) {
            msg.channel.send("Tu doit être dans un channel pour mettre de la musique");
            setTimeout(() => {
                msg.channel.send("batard");
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
        };
        if (this.queryChecks(msg, searchQuery) && voiceChannel) {
            if (searchQuery) {
                ytSearch(searchQuery).then((res) => {
                    const result: any = res.all.filter((r) => r.type === "video")?.[0];
                    if (result) {
                        videoData.videoId = result.videoId;
                        videoData.title = result.title;
                        videoData.image = result.thumbnail;
                        this.__playerHandler(msg.channel, voiceChannel, videoData, flags);
                    }
                });
            } else if (this.__checkSoloFlags(flags)) {
                this.__playerHandler(msg.channel, voiceChannel, videoData, flags);
            }
        }
    }
}
