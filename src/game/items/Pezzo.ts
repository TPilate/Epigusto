import Phaser from "phaser";
export interface PezzoConfigurazione {
    velocitaAttuale: number;
    aggiornaPunteggio: number;
}

export class Pezzo {
    private velocitaAttuale: number;
    private aggiornaPunteggio: number;

    constructor(config: PezzoConfigurazione) {
        this.velocitaAttuale = config.velocitaAttuale;
        this.aggiornaPunteggio = config.aggiornaPunteggio;
    }

    inizia() {
        this.aggiornaPunteggio += 100 * this.velocitaAttuale;
        return this.aggiornaPunteggio;
    }
}