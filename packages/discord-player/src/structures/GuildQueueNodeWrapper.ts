import { Worker } from "node:worker_threads";
import { GuildQueue } from "./GuildQueue";

export class GuildQueueNodeWrapper {
    public constructor(public queue: GuildQueue, public internalNode: Worker) {}

    public send(payload: unknown) {
        this.internalNode.postMessage(payload);
    }

    public get id() {
        return this.internalNode.threadId;
    }
}
