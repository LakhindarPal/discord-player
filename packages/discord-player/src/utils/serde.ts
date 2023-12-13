/* eslint-disable @typescript-eslint/no-explicit-any */

import { Exceptions } from '../errors';
import { Playlist, type SerializedTrack, Track, SerializedPlaylist } from '../fabric';
import { TypeUtil } from './TypeUtil';
import { Buffer } from 'buffer';
import { Player } from '../Player';

export enum SerializedType {
    Track = 'track',
    Playlist = 'playlist'
}

export type Encodable = SerializedTrack | SerializedPlaylist;
export type SerializedOutput<T extends Track | Playlist> = T extends Track ? SerializedTrack : SerializedPlaylist;
export type DeserializedOutput<T extends Encodable> = T extends SerializedTrack ? Track : Playlist;

export const isSerializedTrack = (data: any): data is SerializedTrack => data.$type === SerializedType.Track;
export const isSerializedPlaylist = (data: any): data is SerializedPlaylist => data.$type === SerializedType.Playlist;

export type SerializableInput = Track | Playlist;

export function serialize<T extends SerializableInput>(data: T): SerializedOutput<T> {
    if (data instanceof Track) return data.serialize() as any;
    if (data instanceof Playlist) return data.serialize() as any;

    throw Exceptions.ERR_SERIALIZATION_FAILED();
}

export function deserialize<T extends Encodable>(player: Player, data: T): DeserializedOutput<T> {
    if (isSerializedTrack(data)) return Track.fromSerialized(player, data) as any;
    if (isSerializedPlaylist(data)) return Playlist.fromSerialized(player, data) as any;

    throw Exceptions.ERR_DESERIALIZATION_FAILED();
}

export function encode(data: Encodable) {
    const str = JSON.stringify(data);

    return Buffer.from(str).toString('base64');
}

export function decode(data: string) {
    const str = Buffer.from(data, 'base64').toString();

    return JSON.parse(str);
}

export function tryIntoThumbnailString(data: any) {
    if (!data) return null;
    try {
        if (TypeUtil.isString(data)) return data;
        return data?.url ?? data?.thumbnail?.url ?? null;
    } catch {
        return null;
    }
}
