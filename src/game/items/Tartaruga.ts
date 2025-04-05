export interface TartarugaConfigurazione {
  velocitaAttuale: number;
}

export class Tartaruga {
  private velocitaAttuale: number;

  constructor(config: TartarugaConfigurazione) {
      this.velocitaAttuale = config.velocitaAttuale;
  }

  inizia() {
    this.velocitaAttuale -= 0.5;
    return this.velocitaAttuale;
  }
}