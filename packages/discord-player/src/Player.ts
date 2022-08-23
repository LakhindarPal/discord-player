import { EventEmitter } from "@discord-player/utils";
import { GatewayVoiceStateUpdate } from "discord-api-types/v10";
import { GuildQueueManager } from "./managers/GuildQueueManager";
import { PlayerNodeManager } from "@discord-player/core";

export interface PlayerEvents {
    error: (queue: any, error: Error) => Awaited<void>;
    payload: (guild: string, payload: GatewayVoiceStateUpdate) => Awaited<void>;
}

export type PlayerPayloadSender = (guildId: string, payload: GatewayVoiceStateUpdate) => Awaited<void>;

export interface PlayerInit {
    maxThreads?: number | "auto";
}

export class Player extends EventEmitter<PlayerEvents> {
    public requiredEvents: Array<keyof PlayerEvents> = ["error"];
    public queues = new GuildQueueManager(this);
    public nodes = new PlayerNodeManager({
        max: this.options?.maxThreads
    });
    public constructor(public options?: PlayerInit) {
        super();
        this.nodes.on("voiceStateUpdate", (_, payload: GatewayVoiceStateUpdate) => {
            this.emit("payload", payload.d.guild_id, payload);
        });
    }

    public emit<K extends keyof PlayerEvents>(event: K, ...args: Parameters<PlayerEvents[K]>): boolean {
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
}
