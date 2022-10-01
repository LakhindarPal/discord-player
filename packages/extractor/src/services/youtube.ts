import { Playlist, Video, YouTube } from 'youtube-sr';
import { Extractor, ExtractorQuery, IExtractorSearchResult, IPlaylist, ITrack } from 'discord-player';
import { videoFormat, getInfo, validateID, validateURL } from 'ytdl-core';

export class YouTubeExtractor extends Extractor {
    public async validate(query: ExtractorQuery) {
        return true;
    }

    public isPlaylist(query: ExtractorQuery) {
        return YouTube.isPlaylist(query);
    }

    public isVideo(query: ExtractorQuery) {
        return validateURL(query) || validateID(query);
    }

    private formatVideoResult(result: Video): ITrack<Video> {
        return {
            title: result.title!,
            author: {
                name: result.channel?.name || 'Unknown Author',
                url: result.channel?.url || 'unknown'
            },
            duration: result.duration,
            url: result.url,
            metadata: result
        };
    }

    private formatPlaylistResult(result: Playlist): IPlaylist<Playlist> {
        return {
            title: result.title!,
            author: {
                name: result.channel?.name || 'Unknown Author',
                url: result.channel?.url || 'unknown'
            },
            tracks: result.videos.map(this.formatVideoResult),
            metadata: result
        };
    }

    public async search(query: ExtractorQuery): Promise<IExtractorSearchResult> {
        if (this.isVideo(query)) {
            const result = await YouTube.getVideo(!query.includes('youtube.com') ? `https://www.youtube.com/watch?v=${query}` : query).catch(() => {});
            if (!result) return { tracks: [], playlist: null };

            return { tracks: [this.formatVideoResult(result)], playlist: null };
        } else if (this.isPlaylist(query)) {
            const playlist = await YouTube.getPlaylist(query, { fetchAll: true }).catch(() => {});
            if (!playlist) return { tracks: [], playlist: null };
            const tracks = playlist.videos.map(this.formatVideoResult);
            return { tracks, playlist: this.formatPlaylistResult(playlist) };
        }

        const results = await YouTube.search(query, { type: 'video' }).catch(() => {});

        return { tracks: results?.length ? results.map(this.formatVideoResult) : [], playlist: null };
    }

    public async stream(track: ITrack<Video>): Promise<string> {
        const info = await getInfo(track.url);
        let formats = info.formats;
        let filter = (format: videoFormat) => !!format.audioBitrate;
        if (info.videoDetails.isLiveContent) filter = (format: videoFormat) => !!format.audioBitrate && format.isHLS;
        formats = formats.filter(filter).sort((a, b) => b.audioBitrate! - a.audioBitrate!);
        return (formats.find((format) => !format.bitrate) || formats[0]).url;
    }
}
