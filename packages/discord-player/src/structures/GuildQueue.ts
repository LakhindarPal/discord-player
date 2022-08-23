import { Queue, QueueStrategy } from "@discord-player/utils";
import { Player } from "../Player";
import { AudioTrack } from "./AudioTrack";
import { Worker } from "node:worker_threads";
import { GuildQueueNodeWrapper } from "./GuildQueueNodeWrapper";

export interface GuildQueueInit {
    strategy?: QueueStrategy;
    guildId: string;
    node: Worker;
}

export class GuildQueue {
    public tracks = new Queue<AudioTrack>(this.options.strategy ?? "FIFO");
    public node = new GuildQueueNodeWrapper(this, this.options.node);
    public createdAt = new Date();
    public constructor(public player: Player, public options: GuildQueueInit) {}

    public get createdTimestamp() {
        return this.createdAt.getTime();
    }

    public get id() {
        return this.options.guildId;
    }
}
