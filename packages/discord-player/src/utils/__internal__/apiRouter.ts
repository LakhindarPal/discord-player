import { NxRouter, MethodImplementor } from 'nxrouter';
import { DiscordPlayerAPI, SimilarityPayload, SimilarityPayloadBody } from '../API';

interface ApiRoutes {
    analyze: MethodImplementor<{
        (body: SimilarityPayload): MethodImplementor;
    }>;
}

export interface AnalyzeResult {
    result: {
        source: SimilarityPayloadBody;
        score: number;
    }[];
}

export const initialize = (api: DiscordPlayerAPI) => {
    const router = new NxRouter<ApiRoutes>({
        onRequest: async (options) => {
            const res = await fetch(`${DiscordPlayerAPI.BASE_URL}${options.path}`, {
                method: options.method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: api.API_KEY
                }
            });

            if (!res.ok) throw new Error(`Request failed with status code ${res.status}`);

            return res.json();
        }
    });

    return router;
};

export type ApiRouter = ReturnType<typeof initialize>;
