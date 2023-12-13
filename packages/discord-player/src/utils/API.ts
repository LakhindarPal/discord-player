import { Player } from '../Player';
import { Exceptions } from '../errors';
import { AnalyzeResult, ApiRouter, initialize } from './__internal__/apiRouter';

export interface SimilarityPayloadBody {
    id: string;
    value: string;
}

export interface SimilarityPayload {
    source: SimilarityPayloadBody;
    target: SimilarityPayloadBody[];
}

export class DiscordPlayerAPI {
    // TODO: remove this once stable
    public static BASE_URL = 'http://localhost:8080';
    public API_KEY: string;
    public client: ApiRouter;

    public constructor(public player: Player) {
        const key = player.options.apiKey;
        if (!key) throw Exceptions.ERR_INVALID_API_KEY();
        this.API_KEY = key;
        this.client = initialize(this);
    }

    public setBaseURL(url: string) {
        DiscordPlayerAPI.BASE_URL = url;
        return this;
    }

    /**
     * Find similarity between source and target list.
     * @param payload The payload to send to the API.
     * @returns The result of the analysis.
     */
    public async findSimilarity(payload: SimilarityPayload) {
        const res = await this.client.api.analyze.post<AnalyzeResult>({
            body: payload
        });

        return res;
    }
}
