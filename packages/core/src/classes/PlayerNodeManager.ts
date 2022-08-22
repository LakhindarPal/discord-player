import { cpus } from "node:os";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { Collection } from "@discord-player/utils";

interface PlayerNodeConfig {
    max?: number | "auto";
    respawn?: boolean;
}

export class PlayerNodeManager {
    public workers = new Collection<number, Worker>();
    public constructor(public config: PlayerNodeConfig) {}

    public get maxThreads() {
        const conf = this.config.max;
        if (conf === "auto") return cpus().length;
        if (typeof conf !== "number" || Number.isNaN(conf) || conf < 1 || !Number.isFinite(conf)) return 1;
        return conf;
    }

    public get spawnable() {
        return this.workers.size < this.maxThreads;
    }

    public getLeastBusy() {}

    public spawn() {
        if (!this.spawnable) return;

        const worker = new Worker(join(__dirname, "..", "worker", "worker"));
        this.workers.set(worker.threadId, worker);

        return worker;
    }

    public terminate() {}
}
