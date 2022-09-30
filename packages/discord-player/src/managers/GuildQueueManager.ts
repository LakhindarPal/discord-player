import { WorkerOp } from '@discord-player/core';
import { Collection } from '@discord-player/utils';
import { Player } from '../Player';
import { GuildQueue, GuildQueueInit } from '../structures/GuildQueue';

export type GuildQueueResolvable = string | GuildQueue;

export class GuildQueueManager {
    public cache = new Collection<string, GuildQueue>();
    public constructor(public player: Player) {}

    public async create(options: Omit<GuildQueueInit, 'node'>) {
        if (this.cache.has(options.guildId)) return this.cache.get(options.guildId);
        this.player.debug(`Creating GuildQueue for guild ${options.guildId}\n\n${JSON.stringify(options)}`, this.constructor.name);
        const queue = new GuildQueue(this.player, {
            ...options,
            node: await this.player.nodes.spawn()
        });
        queue.node.send({
            op: WorkerOp.CREATE_SUBSCRIPTION,
            d: {
                client_id: options.clientId,
                guild_id: options.guildId
            }
        });
        this.cache.set(options.guildId, queue);
        return queue;
    }

    public resolve(queue: GuildQueueResolvable) {
        // always resolve from cache
        if (typeof queue === 'string') return this.cache.get(queue);
        if (queue instanceof GuildQueue) return this.cache.get(queue.options.guildId);
    }

    public resolveId(queue: GuildQueueResolvable) {
        // always resolve from cache
        if (typeof queue === 'string') return this.cache.get(queue)?.options.guildId;
        if (queue instanceof GuildQueue) return this.cache.get(queue.options.guildId)?.options.guildId;
    }
}
