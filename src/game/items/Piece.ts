export interface PieceConfiguration {
    currentSpeed: number;
    updateScore: number;
}

export class Piece {
    private currentSpeed: number;
    private updateScore: number;

    constructor(config: PieceConfiguration) {
        this.currentSpeed = config.currentSpeed;
        this.updateScore = config.updateScore;
    }

    start() {
        this.updateScore += 100 * this.currentSpeed;
        return this.updateScore;
    }
}