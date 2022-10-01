import { WorkerOp } from '@discord-player/core';
import { GuildQueue } from './GuildQueue';

export class Dispatcher {
    public constructor(public readonly queue: GuildQueue) {}

    public get node() {
        return this.queue.node;
    }

    public play(query: string) {
        this.node.send({
            op: WorkerOp.PLAY,
            d: {
                client_id: this.queue.options.clientId,
                guild_id: this.queue.options.guildId,
                query
            }
        });
    }
}
