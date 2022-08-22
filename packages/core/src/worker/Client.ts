import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { WorkerOp } from "../utils/enums";
import { notify } from "./notifier";

export interface SubscriptionPayload {
    clientId: string;
    guildId: string;
    deafen?: boolean;
}

export class SubscriptionClient {
    public voiceConnection!: VoiceConnection;
    public constructor(public id: string) {}

    public connect(config: SubscriptionPayload) {
        this.voiceConnection = joinVoiceChannel({
            channelId: config.clientId,
            guildId: config.guildId,
            selfDeaf: Boolean(config.deafen),
            adapterCreator: () => {
                return {
                    sendPayload(payload) {
                        notify({
                            op: WorkerOp.VOICE_STATE_UPDATE,
                            d: payload
                        });
                        return true;
                    },
                    destroy() {}
                };
            }
        });
    }
}
