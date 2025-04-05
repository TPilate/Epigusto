import Phaser from "phaser";
export interface CoinsConfig {
    currentSpeed: number;
    updateScore: number;
}

export class Coins {
    private currentSpeed: number;
    private updateScore: number;

    constructor(config: CoinsConfig) {
        this.currentSpeed = config.currentSpeed;
        this.updateScore = config.updateScore;
    }

    start() {
        this.updateScore += 100 * this.currentSpeed;
        return this.updateScore;
    }
}