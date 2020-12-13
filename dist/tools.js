"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCmd = exports.getCmdArgs = exports.getCmdPrefix = void 0;
function getCmdPrefix(msg) {
    var _a;
    return (_a = msg.split(" ").shift()) !== null && _a !== void 0 ? _a : "";
}
exports.getCmdPrefix = getCmdPrefix;
function getCmdArgs(msg) {
    var split = msg.split(" ");
    return split.splice(1, split.length);
}
exports.getCmdArgs = getCmdArgs;
function parseCmd(msg) {
    return { prefix: getCmdPrefix(msg), args: getCmdArgs(msg) };
}
exports.parseCmd = parseCmd;
