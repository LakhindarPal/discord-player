import { Collection } from '@discord-player/utils';
import { Worker } from 'worker_threads';
import { Player } from '../Player';
import { ParentOp, ParentPayload, WorkerOp, WorkerPayload } from './constants';

export interface VoiceWorkerManagerInit {
    /**
     * The max number of workers allowed to spawn at a time
     */
    max?: number;
    /**
     * The time in milliseconds to wait before considering a worker dead
     */
    heartBeatTimeout?: number;
    /**
     * The time in milliseconds to wait between each worker heartbeat
     */
    heartBeatInterval?: number;
}

export interface WorkerStore {
    worker: Worker;
    resourceUsage: NodeJS.MemoryUsage;
    lastHeartBeat: number;
}

type MaybeId<T> = T & Partial<{ id: number }>;

export class VoiceWorkerManager {
    public workers: Collection<number, WorkerStore> = new Collection();
    public workerLoop: NodeJS.Timer | null = null;

    public constructor(public player: Player, public options: VoiceWorkerManagerInit = {}) {
        options.max ??= 1;
        options.heartBeatInterval ??= 10000;
        options.heartBeatTimeout ??= 12000;

        if (options.max < 1) throw new RangeError('VoiceManager#max must be greater than 0');
        if (options.heartBeatInterval < 1000) throw new RangeError('VoiceManager#heartBeatInterval must be greater than 1000');
        if (options.heartBeatTimeout < 1000) throw new RangeError('VoiceManager#heartBeatTimeout must be greater than 1000');
    }

    public get max() {
        return this.options.max ?? 1;
    }

    public getLeastBusy() {
        return this.workers.sort((a, b) => a.resourceUsage.heapUsed - b.resourceUsage.heapUsed).first()?.worker;
    }

    public get spawnable() {
        return this.workers.size < this.max;
    }

    public spawn() {
        if (!this.spawnable) return this.getLeastBusy()!;

        const worker = new Worker(require.resolve('./VoiceWorker.js'));

        worker.on('message', this.handlePayload.bind(this, worker));

        worker.on('error', () => {
            worker.terminate();
        });

        worker.on('exit', () => {
            this.workers.delete(worker.threadId);
        });

        return worker;
    }

    public initializeWorkerLoop() {
        if (this.workerLoop) clearInterval(this.workerLoop);

        this.workerLoop = setInterval(() => {
            for (const [id, worker] of this.workers) {
                if (Date.now() - worker.lastHeartBeat > this.options.heartBeatTimeout!) {
                    worker.worker.terminate();
                    this.workers.delete(id);
                } else {
                    worker.worker.postMessage({
                        op: ParentOp.HeartBeat
                    });
                }
            }
        }, this.options.heartBeatInterval!).unref();
    }

    public handlePayload(worker: Worker, payload: WorkerPayload) {
        switch (payload.op) {
            case WorkerOp.Ready:
                this.workers.set(worker.threadId, {
                    worker,
                    resourceUsage: {
                        heapUsed: 0,
                        external: 0,
                        arrayBuffers: 0,
                        heapTotal: 0,
                        rss: 0
                    },
                    lastHeartBeat: Date.now()
                });

                if (!this.workerLoop) this.initializeWorkerLoop();
                break;
            case WorkerOp.Stats:
                {
                    const resourceUsage = payload.d as NodeJS.MemoryUsage;
                    const previous = this.workers.get(worker.threadId);
                    if (!previous) return;

                    this.workers.set(worker.threadId, {
                        worker,
                        resourceUsage,
                        lastHeartBeat: previous.lastHeartBeat
                    });
                }
                break;
            case WorkerOp.HeartBeatAck:
                {
                    const previous = this.workers.get(worker.threadId);
                    if (!previous) return worker.terminate();

                    this.workers.set(worker.threadId, {
                        worker,
                        resourceUsage: previous.resourceUsage,
                        lastHeartBeat: Date.now()
                    });
                }
                break;
            default:
                break;
        }
    }

    public send<T>(payload: MaybeId<ParentPayload<T>>) {
        const worker = this.workers.get(payload.id!)?.worker || this.getLeastBusy();
        if (!worker) return false;

        delete payload.id;

        worker.postMessage(payload);
        return true;
    }

    public broadcast<T>(payload: ParentPayload<T>) {
        for (const worker of this.workers.values()) {
            worker.worker.postMessage(payload);
        }
    }

    public terminate() {
        if (this.workerLoop) clearInterval(this.workerLoop);

        for (const worker of this.workers.values()) {
            worker.worker.terminate();
        }

        this.workers.clear();
    }
}
