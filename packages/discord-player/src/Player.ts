import { Collection, EventEmitter } from '@discord-player/utils';
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdate, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/v10';
import { GuildQueueManager } from './managers/GuildQueueManager';
import { PlayerNodeManager, WorkerOp } from '@discord-player/core';
import { GuildQueue } from './structures/GuildQueue';
import { Extractor } from './structures/Extractor';

export interface PlayerEvents {
    error: (error: Error) => Awaited<void>;
    payload: (guild: string, payload: GatewayVoiceStateUpdate) => Awaited<void>;
    debug: (message: string) => Awaited<void>;
    subscriptionCreate: (queue: GuildQueue) => Awaited<void>;
    subscriptionDelete: (queue: GuildQueue) => Awaited<void>;
}

export type PlayerPayloadSender = (guildId: string, payload: GatewayVoiceStateUpdate) => Awaited<void>;

export interface PlayerInit {
    maxThreads?: number | 'auto';
    extractors?: Extractor[];
}

export interface PlayerSearchOptions {}

export class Player extends EventEmitter<PlayerEvents> {
    public requiredEvents: Array<keyof PlayerEvents> = ['error'];
    public queues = new GuildQueueManager(this);
    public nodes: PlayerNodeManager;
    public extractors = new Collection<string, Extractor>();
    public constructor(public options?: PlayerInit) {
        super();
        this.nodes = new PlayerNodeManager({
            max: this.options?.maxThreads
        });
        if (this.options?.extractors?.length) this.registerExtractors(this.options.extractors);
        this.#eventDispatcherInit();
        this.debug(
            `Initialized Player instance:\n\nPlayerConfig ${JSON.stringify(
                {
                    RequiredEvents: this.requiredEvents,
                    NodeMaxThreads: this.options?.maxThreads ?? 1
                },
                null,
                '  '
            )}`
        );
    }

    public registerExtractors(extractors: Extractor[]) {
        for (const extractor of extractors) {
            if (this.extractors.has(extractor.name)) continue;
            this.extractors.set(extractor.name, extractor);
            this.debug(`Registered extractor ${extractor.name}`);
        }
    }

    #eventDispatcherInit() {
        this.debug('Registering event dispatcher');
        this.nodes.on('voiceStateUpdate', (_, payload: GatewayVoiceStateUpdate) => {
            this.emit('payload', payload.d.guild_id, payload);
        });
        this.nodes.on('debug', (message) => {
            this.emit('debug', message);
        });
        this.nodes.on('error', (worker, error) => {
            this.emit('error', error);
        });
        this.nodes.on('subscriptionCreate', (worker, payload) => {
            const queue = this.queues.cache.get(payload.guild_id);
            if (queue) {
                this.emit('subscriptionCreate', queue);
            }
        });
        this.nodes.on('subscriptionDelete', (worker, payload) => {
            const queue = this.queues.cache.get(payload.guild_id);
            if (queue) {
                this.emit('subscriptionDelete', queue);
            }
        });
    }

    public onServerUpdate(data: GatewayVoiceServerUpdateDispatch | GatewayVoiceStateUpdateDispatch) {
        const queue = this.queues.cache.get(data.d?.guild_id!);
        if (!queue) return;
        queue.node.send({
            op: WorkerOp.GATEWAY_PAYLOAD,
            d: {
                client_id: queue.options.clientId,
                payload: data as any
            } as any
        });
    }

    public debug(message: string, className = this.constructor.name) {
        this.emit('debug', `[${className} | ${new Date().toLocaleString()}] ${message}`);
    }

    public emit<K extends keyof PlayerEvents>(event: K, ...args: Parameters<PlayerEvents[K]>): boolean {
        if (this.isImportantEvent(event) && !this.hasEventListener(event)) {
            process.emitWarning(`[${this.constructor.name}Warning] No event listeners found for ${event}. ${this.requiredEvents.join(', ')} must have event listeners!\n${args.join('\n')}`);
            return false;
        }
        return super.emit(event, ...args);
    }

    public isImportantEvent<K extends keyof PlayerEvents>(event: K) {
        return this.requiredEvents.some((ev) => ev === event);
    }

    public hasEventListener<K extends keyof PlayerEvents>(event: K) {
        return this.eventNames().some((ev) => ev === event);
    }

    public async search(query: string, options?: PlayerSearchOptions) {
        for (const extractor of this.extractors.values()) {
            if (!(await extractor.validate(query))) continue;

            const result = await extractor.search(query);
            if (result.tracks.length) {
                return {
                    tracks: result.tracks,
                    extractor
                };
            }
        }

        return { tracks: [], extractor: null };
    }
}
