import type { Player } from '../Player';

export interface IExtractorSearchResult<P = unknown, T = unknown> {
    playlist?: IPlaylist<P> | null;
    tracks: ITrack<T>[];
}

export interface IPlaylist<T = unknown> {
    title: string;
    tracks: ITrack[];
    author: {
        name: string;
        url: string;
    };
    metadata: T;
}

export interface ITrack<T = unknown> {
    title: string;
    duration: number;
    url: string;
    author: {
        name: string;
        url: string;
    };
    metadata: T;
}

export type ExtractorQuery = string;

export abstract class Extractor {
    public constructor(public readonly player: Player) {}

    public async validate(query: ExtractorQuery): Promise<boolean> {
        throw new Error('Not Implemented');
    }

    public async search(query: ExtractorQuery): Promise<IExtractorSearchResult> {
        throw new Error('Not Implemented');
    }

    public async stream(track: ITrack): Promise<string> {
        throw new Error('Not Implemented');
    }

    public get name() {
        return this.constructor.name;
    }
}
