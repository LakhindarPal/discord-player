# `@discord-player/biquad`

Discord Player @discord-player/biquad library

## Installation

```sh
$ npm install @discord-player/biquad
```

## Example

```js
import { BiquadFilter, Coefficients, FilterType, Frequency, Q_BUTTERWORTH } from "@discord-player/biquad";

const f0 = new Frequency(10).hz();
const fs = new Frequency(1).khz();

const coeffs = Coefficients.from(FilterType.LowPass, fs, f0, Q_BUTTERWORTH);
const biquad = new BiquadFilter(coeffs);

const input = [0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

const out1 = input.map(i => biquad.run(i));
const out2 = input.map(i => biquad.runTransposed(i));
```