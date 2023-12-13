import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';
import Emojis from './emojis';
import { envParseArray } from '@skyra/env-utilities';
import * as Permissions from './lib/perms';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

export class KarasuClient extends SapphireClient {
	public player: Player;
	public dev: typeof Emojis;
	public perms: typeof Permissions;
	public recordingPath = path.resolve(`${__dirname}/recordings`);
	public constructor() {
		super({
			disableMentionPrefix: true,
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
			defaultCooldown: {
				filteredUsers: envParseArray('OWNERS'),
				scope: BucketScope.User,
				delay: 10_000,
				limit: 2
			},
			logger: {
				level: LogLevel.Debug
			}
		});
		this.dev = Emojis;
		this.perms = Permissions;

		this.player = new Player(this as any, {
			ytdlOptions: {
				requestOptions: {
					headers: {
						cookie: process.env.YOUTUBE_COOKIE
					}
				}
			},
			skipFFmpeg: true,
			apiKey: 'abcd1234'
		});

		// this.player.events.on('willPlayTrack', (_, __, config, done) => {
		// 	config.dispatcherConfig = {
		// 		...config.dispatcherConfig,
		// 		disableBiquad: true,
		// 		disableEqualizer: true,
		// 		disableFilters: true,
		// 		disableResampler: true,
		// 		disableVolume: true
		// 	};

		// 	done();
		// });

		if (!existsSync(this.recordingPath))
			mkdirSync(this.recordingPath, {
				recursive: true
			});
	}
}

declare module 'discord.js' {
	interface Client {
		readonly player: Player;
		readonly perms: typeof Permissions;
		readonly dev: typeof Emojis;
		readonly recordingPath: string;
	}
}
