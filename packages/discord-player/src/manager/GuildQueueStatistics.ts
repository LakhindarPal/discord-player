import { GuildQueue } from './GuildQueue';

export interface GuildQueueStatisticsMetadata extends StatsState {
    listeners: number;
    tracksCount: number;
    historySize: number;
    extractors: number;
    versions: {
        node: string;
        player: string;
    };
}

type StatsState = {
    latency: {
        eventLoop: number;
        voiceConnection: number;
    };
    progress: number;
    volume: number;
    status: {
        buffering: boolean;
        playing: boolean;
        paused: boolean;
        idle: boolean;
    };
    memoryUsage: NodeJS.MemoryUsage;
};

export class GuildQueueStatistics<Meta = unknown> {
    public state: StatsState = {
        latency: {
            eventLoop: this.queue.player.eventLoopLag,
            voiceConnection: this.queue.ping
        },
        progress: 0,
        volume: 100,
        status: {
            buffering: this.queue.node.isBuffering(),
            playing: this.queue.node.isPlaying(),
            paused: this.queue.node.isPaused(),
            idle: this.queue.node.isIdle()
        },
        memoryUsage: {
            arrayBuffers: 0,
            external: 0,
            heapTotal: 0,
            heapUsed: 0,
            rss: 0
        }
    };

    public constructor(public queue: GuildQueue<Meta>) {
        Object.defineProperty(this, 'state', {
            enumerable: false,
            writable: true,
            configurable: true
        });
    }

    /**
     * Generate statistics of this queue
     */
    public generate() {
        return Object.freeze({
            ...this.state,
            listeners: this.queue.guild.members.me?.voice.channel?.members.filter((m) => !m.user.bot).size || 0,
            tracksCount: this.queue.tracks.size,
            historySize: this.queue.history.tracks.size,
            extractors: this.queue.player.extractors.size,
            versions: {
                node: process.version,
                player: '[VI]{{inject}}[/VI]'
            }
        }) as Readonly<GuildQueueStatisticsMetadata>;
    }
}
