export interface ConiglioConfigurazione {
    giocoVelocita: number;
}

export class Coniglio {
    private giocoVelocita: number;

    constructor(config: ConiglioConfigurazione) {
        this.giocoVelocita = config.giocoVelocita;
    }

    inizia() {
        this.giocoVelocita = this.giocoVelocita * 2;
        return this.giocoVelocita;
    }
}