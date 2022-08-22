import { parentPort } from "node:worker_threads";

export function notify(data: unknown) {
    parentPort?.postMessage(data);
}
