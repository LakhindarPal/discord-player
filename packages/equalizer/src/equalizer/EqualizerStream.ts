import { Transform, TransformCallback, TransformOptions } from 'stream';
import { Equalizer } from './Equalizer';

interface EqualizerStreamOptions extends TransformOptions {
    bandMultiplier: EqualizerBand[];
}

interface EqualizerBand {
    band: number;
    gain: number;
}

export class EqualizerStream extends Transform {
    #disabled = false;
    public bandMultipliers: number[] = new Array(Equalizer.BAND_COUNT).fill(0);
    public equalizer = new Equalizer(1, this.bandMultipliers);
    public constructor(options?: EqualizerStreamOptions) {
        super(options);

        if (options) this._processBands(options.bandMultiplier);
    }

    private _processBands(multiplier: EqualizerBand[]) {
        for (const mul of multiplier) {
            if (mul.band > Equalizer.BAND_COUNT - 1 || mul.band < 0) throw new RangeError(`Band value out of range. Expected >0 & <${Equalizer.BAND_COUNT - 1}, received "${mul.band}"`);
            this.equalizer.setGain(mul.band, mul.gain);
        }
    }

    public get disabled() {
        return this.#disabled;
    }

    public disable() {
        this.#disabled = true;
    }

    public enable() {
        this.#disabled = false;
    }

    public toggle() {
        this.#disabled = !this.#disabled;
    }

    public _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        if (this.#disabled) {
            this.push(chunk);
            return callback();
        }

        this.equalizer.process([chunk]);
        this.push(chunk);

        return callback();
    }

    public getEQ() {
        return this.bandMultipliers.map((m, i) => ({
            band: i,
            gain: m
        })) as EqualizerBand[];
    }

    public setEQ(bands: EqualizerBand[]) {
        this._processBands(bands);
    }

    public resetEQ() {
        this._processBands(
            Array.from(
                {
                    length: Equalizer.BAND_COUNT
                },
                (_, i) => ({
                    band: i,
                    gain: 0
                })
            )
        );
    }
}
