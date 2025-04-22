export interface HeartConfiguration {
  currentHealth: number;
}

export class Heart {
  private currentHealth: number;

  constructor(config: HeartConfiguration) {
      this.currentHealth = config.currentHealth;
  }

  start() {
    this.currentHealth += 1;
    return this.currentHealth;
  }
}