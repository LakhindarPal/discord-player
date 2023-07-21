import { VoiceChannel, StageChannel, Snowflake } from 'discord.js';
import { StreamDispatcher } from './StreamDispatcher';
import { Collection } from '@discord-player/utils';
import { GuildQueue } from '../manager';
import type { Player } from '../Player';
import { Exceptions } from '../errors';
import { VoiceWorkerManager } from './VoiceManager';
import { ParentOp } from './constants';

class VoiceUtils {
    /**
     * Voice connection cache to store voice connections of the Player components.
     * This property is deprecated and will be removed in the future.
     * It only exists for compatibility reasons.
     * @deprecated
     */
    public cache: Collection<Snowflake, StreamDispatcher> = new Collection<Snowflake, StreamDispatcher>();

    /**
     * The voice worker manager
     */
    public manager = new VoiceWorkerManager(this.player, this.player.options.voiceWorkerOptions);

    /**
     * The voice utils constructor
     */
    constructor(public player: Player) {}

    /**
     * Joins a voice channel, creating basic stream dispatch manager
     * @param {StageChannel|VoiceChannel} channel The voice channel
     * @param {object} [options] Join options
     */
    public async connect(
        channel: VoiceChannel | StageChannel,
        options?: {
            deaf?: boolean;
            maxTime?: number;
            queue: GuildQueue;
            group?: string;
        }
    ) {
        if (!options?.queue) throw Exceptions.ERR_NO_GUILD_QUEUE();

        const worker = this.manager.spawn();
        if (!worker) throw Exceptions.ERR_NOT_EXISTING('Appropriate worker');

        return this.manager.send({
            id: worker.threadId,
            op: ParentOp.JoinVoiceChannel,
            d: {
                guildId: channel.guild.id,
                channelId: channel.id,
                selfDeaf: Boolean(options?.deaf),
                debug: this.player.events.listenerCount('debug') > 0,
                group: options?.group,
                id: options.queue.id
            }
        });
    }
}

export { VoiceUtils };
