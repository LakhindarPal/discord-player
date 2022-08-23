import { Collection } from "@discord-player/utils";
import { Player } from "../Player";
import { GuildQueue, GuildQueueInit } from "../structures/GuildQueue";

export type GuildQueueResolvable = string | GuildQueue;

export class GuildQueueManager {
    public cache = new Collection<string, GuildQueue>();
    public constructor(public player: Player) {}

    public async create(options: Omit<GuildQueueInit, "node">) {
        if (this.cache.has(options.guildId)) return this.cache.get(options.guildId);
        const queue = new GuildQueue(this.player, {
            ...options,
            node: await this.player.nodes.spawn()
        });
        this.cache.set(options.guildId, queue);
        return queue;
    }

    public resolve(queue: GuildQueueResolvable) {
        // always resolve from cache
        if (typeof queue === "string") return this.cache.get(queue);
        if (queue instanceof GuildQueue) return this.cache.get(queue.options.guildId);
    }

    public resolveId(queue: GuildQueueResolvable) {
        // always resolve from cache
        if (typeof queue === "string") return this.cache.get(queue)?.options.guildId;
        if (queue instanceof GuildQueue) return this.cache.get(queue.options.guildId)?.options.guildId;
    }
}
