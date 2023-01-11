export class Coefficients {
    public constructor(public beta: number, public alpha: number, public gamma: number) {}

    public toJSON() {
        const { alpha, beta, gamma } = this;

        return { alpha, beta, gamma };
    }
}
