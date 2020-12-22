"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yt_search_1 = __importDefault(require("yt-search"));
var ytdl_core_1 = __importDefault(require("ytdl-core"));
var default_1 = /** @class */ (function () {
    function default_1(client) {
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
    }
    default_1.prototype.__getFlags = function (content) {
        var _this = this;
        return Object.keys(this.flagList).reduce(function (acc, key) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[key] = content.includes(_this.flagList[key]), _a));
        }, {});
    };
    default_1.prototype.__getQuery = function (content) {
        var _this = this;
        return (content
            .split(" ")
            .filter(function (c) { return !Object.values(_this.flagList).includes(c); })
            .join(" ") || null);
    };
    default_1.prototype.__handleFlags = function (textChannel, voiceChannel, flags, data) {
        var force = flags.force, stop = flags.stop, emptyQueue = flags.emptyQueue, skip = flags.skip, showQueue = flags.showQueue, deleteLast = flags.deleteLast, last = flags.last;
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
            var last_1 = this.queue.pop();
            textChannel.send(last_1.title + "\nenlev\u00E9 de la queue \uD83D\uDC4D");
            return false;
        }
        if (last && this.isPlaying) {
            textChannel.send("" + this.lastPlayed.title);
            return false;
        }
        if (showQueue) {
            if (this.queue.length > 0) {
                textChannel.send(this.queue.map(function (q, i) { return i + 1 + ". " + q.title; }).join(", "));
            }
            else {
                textChannel.send("Aucune musique dans la queue 🤔");
            }
            return false;
        }
        if (!force && data.videoId) {
            this.queue.push(data);
            if (this.isPlaying) {
                textChannel.send(data.title + "\najout\u00E9 \u00E0 la queue \uD83D\uDC4D");
            }
        }
        if (!force && this.queue.length === 0) {
            textChannel.send("Aucune musique dans la queue 🤔");
            return false;
        }
        if (force || !this.isPlaying || (this.isPlaying && skip)) {
            return { force: force };
        }
        return false;
    };
    default_1.prototype.__playerHandler = function (textChannel, voiceChannel, data, flags) {
        var _this = this;
        var willPlay = this.__handleFlags(textChannel, voiceChannel, flags, data);
        if (willPlay === false)
            return;
        var play = function (isForced) {
            voiceChannel
                .join()
                .then(function (connection) {
                var corData = isForced ? data : _this.queue.shift();
                connection
                    .play(ytdl_core_1.default(corData.videoId))
                    .on("start", function () {
                    _this.isPlaying = true;
                    _this.lastPlayed = corData;
                    var msg = "\uD83C\uDFB5 " + corData.title + " \uD83C\uDFB5\n" + corData.url;
                    textChannel.send(msg);
                })
                    .on("finish", function () {
                    if (_this.queue.length > 0) {
                        play(false);
                    }
                    else {
                        textChannel.send("Ma mission est terminée 🤖");
                        voiceChannel.leave();
                    }
                    _this.isPlaying = false;
                })
                    .on("error", function (error) {
                    _this.isPlaying = false;
                    console.error(error);
                });
            })
                .catch(function (err) {
                console.log("unable to join channel", err);
            });
        };
        play(willPlay.force);
    };
    default_1.prototype.__queryChecks = function (msg) {
        var _a;
        if (!((_a = msg.member) === null || _a === void 0 ? void 0 : _a.voice.channel)) {
            msg.channel.send("Tu doit être dans un channel pour mettre de la musique");
            setTimeout(function () {
                msg.channel.send("🤡");
            }, 2000);
            return false;
        }
        return true;
    };
    default_1.prototype.__checkSoloFlags = function (flags) {
        for (var _i = 0, _a = Object.entries(flags); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            if (this.soloFlagList.includes(key) && val === true) {
                return true;
            }
        }
        return false;
    };
    default_1.prototype.newQuery = function (msg, args) {
        var _this = this;
        var _a;
        var query = args.join(" ");
        var flags = this.__getFlags(query);
        var searchQuery = this.__getQuery(query);
        var voiceChannel = (_a = msg.member) === null || _a === void 0 ? void 0 : _a.voice.channel;
        var videoData = {
            videoId: "",
            title: "",
            image: "",
            url: "",
        };
        if (this.__queryChecks(msg) && voiceChannel) {
            if (searchQuery) {
                yt_search_1.default(searchQuery)
                    .then(function (res) {
                    var _a;
                    var result = (_a = res.all.filter(function (r) { return r.type === "video"; })) === null || _a === void 0 ? void 0 : _a[0];
                    if (result) {
                        videoData.videoId = result.videoId;
                        videoData.title = result.title;
                        videoData.image = result.thumbnail;
                        videoData.url = result.url;
                        _this.__playerHandler(msg.channel, voiceChannel, videoData, flags);
                    }
                })
                    .catch(function (err) {
                    console.log(err);
                    msg.channel.send("Impossible de trouver une vidéo 🤔");
                });
            }
            else if (this.__checkSoloFlags(flags)) {
                this.__playerHandler(msg.channel, voiceChannel, videoData, flags);
            }
        }
    };
    return default_1;
}());
exports.default = default_1;
