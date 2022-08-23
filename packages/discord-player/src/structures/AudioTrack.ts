export interface RawAudioTrack<T = unknown> {
    url: string;
    title: string;
    thumbnail: string;
    source: string;
    author: string;
    author_url: string;
    metadata: T;
}

export class AudioTrack<T = unknown> {
    public constructor(public data: RawAudioTrack<T>) {
        Object.defineProperty(this, "data", {
            enumerable: false,
            writable: true,
            configurable: true
        });
    }

    public get source() {
        return this.data.source;
    }

    public get thumbnail() {
        return this.data.thumbnail;
    }

    public get author() {
        return {
            author: this.data.author,
            url: this.data.author_url
        };
    }

    public get url() {
        return this.data.url;
    }

    public get title() {
        return this.data.title;
    }

    public get metadata() {
        return this.data.metadata;
    }

    public toString() {
        return this.title;
    }

    public toJSON() {
        return this.data;
    }

    public static from<K>(data: RawAudioTrack<K>) {
        return new AudioTrack(data);
    }
}
