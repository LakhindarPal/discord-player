import { Collection } from "@discord-player/utils";
import { DiscordGatewayAdapterLibraryMethods, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { WorkerEvents } from "../utils/enums";
import { notify } from "./notifier";

export interface SubscriptionPayload {
    channelId: string;
    guildId: string;
    deafen?: boolean;
}

export class SubscriptionClient {
    public connections = new Collection<string, VoiceConnection>();
    public adapters = new Collection<string, DiscordGatewayAdapterLibraryMethods>();
    public constructor(public clientId: string) {}

    public connect(config: SubscriptionPayload) {
        const voiceConnection = joinVoiceChannel({
            channelId: config.channelId,
            guildId: config.guildId,
            selfDeaf: Boolean(config.deafen),
            adapterCreator: (adapter) => {
                this.adapters.set(config.guildId, adapter);
                return {
                    sendPayload: (payload) => {
                        notify({
                            t: WorkerEvents.VOICE_STATE_UPDATE,
                            d: payload
                        });
                        return true;
                    },
                    destroy: () => {
                        this.adapters.delete(config.guildId);
                        this.connections.delete(config.guildId);
                        notify({
                            t: WorkerEvents.CONNECTION_DESTROY,
                            d: {
                                client_id: this.clientId,
                                guild_id: config.guildId,
                                channel_id: config.channelId
                            }
                        });
                    }
                };
            }
        });

        this.connections.set(voiceConnection.joinConfig.guildId, voiceConnection);
    }

    public disconnect(config: Pick<SubscriptionPayload, "guildId">) {
        const connection = this.connections.get(config.guildId);
        if (connection) {
            connection.destroy();
            this.connections.delete(config.guildId);
        }
    }

    public disconnectAll() {
        for (const [id, connection] of this.connections) {
            connection.destroy();
            this.connections.delete(id);
        }
    }
}
