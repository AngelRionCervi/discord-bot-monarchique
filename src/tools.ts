export function getCmdPrefix(msg: string): string {
    return msg.split(" ").shift() ?? "";
}

export function getCmdArgs(msg: string): string[] {
    const split = msg.split(" ");
    return split.splice(1, split.length);
}

export function parseCmd(msg: string): { prefix: string; args: string[] } {
    return { prefix: getCmdPrefix(msg), args: getCmdArgs(msg) };
}
