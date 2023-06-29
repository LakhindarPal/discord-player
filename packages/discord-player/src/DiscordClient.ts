/* eslint-disable */
// @ts-nocheck

import type { Client } from 'discord.js';
import { defaultVoiceStateHandler } from './DefaultVoiceStateHandler';
import { GuildQueue } from './manager';
import type { Player } from './Player';
import { Util } from './utils/Util';

export abstract class DiscordClient {
    public abstract native: unknown;
    public abstract resolveGuild(id: string): string | null;
    public abstract resolveChannel(id: string): string | null;
    public abstract isVoiceChannel(id: string): boolean;
    public abstract resolveUser(id: string): string | null;
    public abstract handleVoiceState(player: Player, queue: GuildQueue<unknown>, oldState: unknown, newState: unknown): Awaited<void>;
}

export class DiscordJsClient extends DiscordClient {
    public constructor(public native: Client) {
        super();
    }

    public resolveGuild(id: string): string | null {
        return this.native.guilds.resolveId(id);
    }

    public resolveChannel(id: string): string | null {
        return this.native.channels.resolveId(id);
    }

    public isVoiceChannel(id: string): boolean {
        return !!this.native.channels.resolve(id)?.isVoiceBased();
    }

    public resolveUser(id: string): string | null {
        return this.native.users.resolveId(id);
    }

    public handleVoiceState(player: Player, queue: GuildQueue<unknown>, oldState: unknown, newState: unknown) {
        return defaultVoiceStateHandler(player, queue, oldState as any, newState as any);
    }
}

export function isDJSClient(client: unknown): client is Client {
    try {
        const { Client } = (Util.require('discord.js').module || {}) as typeof import('discord.js');
        return client instanceof Client;
    } catch {
        return false;
    }
}
