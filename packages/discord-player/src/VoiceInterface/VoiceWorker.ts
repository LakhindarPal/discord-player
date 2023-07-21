import { parentPort } from 'worker_threads';
import { ParentOp, ParentPayload, WorkerOp } from './constants';

if (parentPort) {
    // custom global to let subpackages know that this is inside discord-player worker
    Object.defineProperty(globalThis, '__discordPlayer', {
        value: 0x1337cafe,
        writable: false,
        enumerable: false,
        configurable: false
    });

    parentPort.on('message', handleMessage);

    parentPort.postMessage({
        op: WorkerOp.Ready
    });
}

function handleMessage(payload: ParentPayload) {
    switch (payload.op) {
        case ParentOp.HeartBeat:
            parentPort!.postMessage({
                op: WorkerOp.HeartBeatAck
            });
            break;
        default:
            break;
    }
}

export {};
