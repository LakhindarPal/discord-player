export function keyMirror<K extends string | number | symbol>(data: K[]) {
    const obj = {} as Record<K, K>;

    for (const item of data) obj[item] = item;

    return Object.freeze(obj);
}
