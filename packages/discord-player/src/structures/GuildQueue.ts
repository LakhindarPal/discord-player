import { Queue, QueueStrategy } from "@discord-player/utils";
import { Player } from "../Player";
import { AudioTrack } from "./AudioTrack";
import { Worker } from "node:worker_threads";
import { GuildQueueNodeWrapper } from "./GuildQueueNodeWrapper";
import { WorkerOp } from "@discord-player/core";

export interface GuildQueueInit {
    strategy?: QueueStrategy;
    guildId: string;
    clientId: string;
    node: Worker;
}

export class GuildQueue {
    public tracks: Queue<AudioTrack>;
    public node: GuildQueueNodeWrapper;
    public createdAt = new Date();
    public constructor(public player: Player, public options: GuildQueueInit) {
        this.tracks = new Queue<AudioTrack>(this.options.strategy ?? "FIFO");
        this.node = new GuildQueueNodeWrapper(this, this.options.node);
        this.player.debug(`GuildQueue initialized for ${this.id} using ${this.tracks.strategy} strategy`, this.constructor.name);
    }

    public connect(channel: string, deaf = true) {
        return this.join(channel, deaf);
    }

    public join(channel: string, deaf = true) {
        this.node.send({
            op: WorkerOp.JOIN_VOICE_CHANNEL,
            d: {
                client_id: this.options.clientId,
                guild_id: this.options.guildId,
                channel_id: channel,
                self_deaf: deaf
            }
        });
    }

    public play(query: string) {
        this.node.send({
            op: WorkerOp.PLAY,
            d: {
                client_id: this.options.clientId,
                guild_id: this.options.guildId,
                query
            }
        });
    }

    public get createdTimestamp() {
        return this.createdAt.getTime();
    }

    public get id() {
        return this.options.guildId;
    }
}
