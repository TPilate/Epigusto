export interface RabbitConfiguration {
    gameSpeed: number;
}

export class Rabbit {
    private gameSpeed: number;

    constructor(config: RabbitConfiguration) {
        this.gameSpeed = config.gameSpeed;
    }

    start() {
        this.gameSpeed = this.gameSpeed + 0.3;
        return this.gameSpeed;
    }
}