export function keyMirror<K extends string>(data: K[]) {
    const obj = {} as Record<K, K>;

    for (const item of data) obj[item] = item;

    return obj;
}

export const WorkerOp = keyMirror(["JOIN_VOICE_CHANNEL", "CREATE_SUBSCRIPTION", "DELETE_SUBSCRIPTION", "GATEWAY_PAYLOAD"]);

export const WorkerEvents = keyMirror(["SUBSCRIPTION_CREATE", "SUBSCRIPTION_DELETE", "VOICE_STATE_UPDATE", "ERROR", "CONNECTION_DESTROY"]);
