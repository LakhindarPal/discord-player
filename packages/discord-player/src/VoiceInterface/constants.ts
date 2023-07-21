export enum WorkerOp {
    Ready,
    Stats,
    HeartBeatAck,
    Payload,
    Connected
}

export enum ParentOp {
    HeartBeat,
    Payload,
    JoinVoiceChannel,
    Destroy,
    SetVolume,
    SetPaused,
    SetBitrate,
    SkipTrack,
    Stop,
    Play,
    Seek,
    SetFilters,
    SetEqualizer,
    SetBiquad,
    SetDsp
}

export interface WorkerPayload<D = unknown> {
    op: WorkerOp;
    d: D;
}

export interface ParentPayload<D = unknown> {
    op: ParentOp;
    queue?: string;
    d: D;
}
