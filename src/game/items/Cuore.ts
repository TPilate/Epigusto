export interface CuoreConfigurazione {
  cuore: number;
}

export class Cuore {
  private cuoreAttuale: number;

  constructor(config: CuoreConfigurazione) {
      this.cuoreAttuale = config.cuore;
  }

  inizia() {
    this.cuoreAttuale += 1;
    return this.cuoreAttuale;
  }
}