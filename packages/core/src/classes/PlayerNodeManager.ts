import { cpus } from "node:os";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { Collection, EventEmitter } from "@discord-player/utils";
import { WorkerOp } from "../utils/enums";

interface PlayerNodeConfig {
    max?: number | "auto";
    respawn?: boolean;
}

type WorkerResolvable = number | Worker;

export interface PlayerNodeEvents {
    error: (worker: Worker, error: Error) => Awaited<void>;
    message: (worker: Worker, message: unknown) => Awaited<void>;
    spawn: (worker: Worker) => Awaited<void>;
    voiceStateUpdate: (worker: Worker, payload: any) => Awaited<void>;
}

export interface ServicePayload {
    op: WorkerOp;
    d: unknown;
}

export class PlayerNodeManager extends EventEmitter<PlayerNodeEvents> {
    public workers = new Collection<number, Worker>();
    public constructor(public config: PlayerNodeConfig) {
        super();
    }

    public get maxThreads() {
        const conf = this.config.max;
        if (conf === "auto") return cpus().length;
        if (typeof conf !== "number" || Number.isNaN(conf) || conf < 1 || !Number.isFinite(conf)) return 1;
        return conf;
    }

    public get spawnable() {
        return this.workers.size < this.maxThreads;
    }

    // TODO
    public getLeastBusy() {}

    public send(workerRes: WorkerResolvable, data: any) {
        const worker = this.resolveWorker(workerRes);
        if (!worker) throw new Error("Worker does not exist");
        worker.postMessage(data);
    }

    public spawn() {
        return new Promise<Worker>((resolve) => {
            if (!this.spawnable) return resolve(this.workers.random()!);

            const worker = new Worker(join(__dirname, "..", "worker", "worker"));

            worker.on("online", () => {
                this.workers.set(worker.threadId, worker);
                this.emit("spawn", worker);
                return resolve(worker);
            });

            worker.on("message", (message: ServicePayload) => {
                if (message.op === WorkerOp.VOICE_STATE_UPDATE) {
                    return this.emit("voiceStateUpdate", worker, message.d);
                }
                this.emit("message", worker, message);
            });

            worker.on("exit", () => {
                this.workers.delete(worker.threadId);
            });

            worker.on("error", (error) => {
                this.emit("error", worker, error);
            });
        });
    }

    public resolveWorker(worker: WorkerResolvable) {
        if (typeof worker === "number") return this.workers.get(worker);
        return this.workers.find((res) => res.threadId === worker.threadId);
    }

    public async terminate(worker?: WorkerResolvable) {
        if (worker) {
            const internalWorker = this.resolveWorker(worker);
            if (internalWorker) {
                await internalWorker.terminate();
                this.workers.delete(internalWorker.threadId);
            }
        } else {
            for (const [id, thread] of this.workers) {
                await thread.terminate();
                this.workers.delete(id);
            }
        }
    }
}
