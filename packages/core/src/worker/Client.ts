import { joinVoiceChannel } from "@discordjs/voice";
import { notify } from "./notifier";

export interface SubscriptionPayload {
    clientId: string;
    guildId: string;
    deafen?: boolean;
}

export class SubscriptionClient {
    public connect(config: SubscriptionPayload) {
        joinVoiceChannel({
            channelId: config.clientId,
            guildId: config.guildId,
            selfDeaf: Boolean(config.deafen),
            adapterCreator: (options) => {
                return {
                    sendPayload(payload) {
                        notify({
                            op: 'VOICE_STATE_UPDATE',
                            d: payload
                        });
                        return true;
                    },
                    destroy() {
                        
                    },
                };
            }
        });
    }
}