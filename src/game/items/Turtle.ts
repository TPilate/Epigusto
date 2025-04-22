export interface TurtleConfiguration {
  currentSpeed: number;
}

export class Turtle {
  private currentSpeed: number;

  constructor(config: TurtleConfiguration) {
      this.currentSpeed = config.currentSpeed;
  }

  start() {
    this.currentSpeed -= 0.5;
    return this.currentSpeed;
  }
}