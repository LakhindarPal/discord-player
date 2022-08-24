import { ServicePayload } from "@discord-player/core";
import { Worker } from "node:worker_threads";
import { GuildQueue } from "./GuildQueue";

export class GuildQueueNodeWrapper {
    public constructor(public queue: GuildQueue, public internalNode: Worker) {}

    public send<T = unknown>(payload: ServicePayload<T>) {
        this.queue.player.debug(`Sending message to node ${this.id}:\n${JSON.stringify(payload)}`, this.constructor.name);
        this.internalNode.postMessage(payload);
    }

    public get id() {
        return this.internalNode.threadId;
    }
}
