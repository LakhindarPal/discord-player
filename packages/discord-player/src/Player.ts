import { EventEmitter } from "node:events";
import { GatewayVoiceStateUpdate } from "discord-api-types/v10";

export interface PlayerEvents {
    error: (queue: any, error: Error) => Awaited<void>;
}

export type PlayerPayloadSender = (guildId: string, payload: GatewayVoiceStateUpdate) => Awaited<void>;

export class Player extends EventEmitter {
    public requiredEvents: Array<keyof PlayerEvents> = ["error"];
    #sendHandlerFN!: PlayerPayloadSender;
    public constructor() {
        super();
    }

    public setVoiceStateUpdater(handler: PlayerPayloadSender) {
        this.#sendHandlerFN = handler;
    }

    // #region Events
    public on<K extends keyof PlayerEvents>(event: K, listener: PlayerEvents[K]): this {
        super.on(event, listener);
        return this;
    }

    public once<K extends keyof PlayerEvents>(event: K, listener: PlayerEvents[K]): this {
        super.once(event, listener);
        return this;
    }

    public prependListener<K extends keyof PlayerEvents>(event: K, listener: PlayerEvents[K]): this {
        super.prependListener(event, listener);
        return this;
    }

    public prependOnceListener<K extends keyof PlayerEvents>(event: K, listener: PlayerEvents[K]): this {
        super.prependOnceListener(event, listener);
        return this;
    }

    public eventNames() {
        return super.eventNames() as Array<keyof PlayerEvents>;
    }

    public off<K extends keyof PlayerEvents>(event: K, listener: PlayerEvents[K]): this {
        super.off(event, listener);
        return this;
    }

    public removeListener<K extends keyof PlayerEvents>(event: K, listener: PlayerEvents[K]): this {
        super.removeListener(event, listener);
        return this;
    }

    public removeAllListeners<K extends keyof PlayerEvents>(event: K): this {
        super.removeAllListeners(event);
        return this;
    }

    public listeners<K extends keyof PlayerEvents>(event: K) {
        return super.listeners(event) as PlayerEvents[K][];
    }

    public listenerCount<K extends keyof PlayerEvents>(event: K) {
        return super.listenerCount(event);
    }

    public emit<K extends keyof PlayerEvents>(event: K, ...args: Array<Parameters<PlayerEvents[K]>>): boolean {
        if (this.isImportantEvent(event) && !this.hasEventListener(event)) {
            process.emitWarning(`[${this.constructor.name}Warning] No event listeners found for ${event}. ${this.requiredEvents.join(", ")} must have event listeners!\n${args.join("\n")}`);
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
    // #endregion Events
}
