export interface PhoenixConfig {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
}

export class Phoenix {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private invincibilityDuration: number = 5000;
  private invincibilityText: Phaser.GameObjects.Text | null = null;

  constructor(config: PhoenixConfig) {
    this.scene = config.scene;
    this.player = config.player;
  }

  activateInvincibility(): void {
    const originalAlpha = this.player.alpha;
    
    this.player.setData('invincible', true);
    
    this.invincibilityText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      100,
      'INVINCIBLE!',
      {
        fontFamily: 'minecraft',
        fontSize: '32px',
        color: '#ff0000'
      }
    );
    this.invincibilityText.setOrigin(0.5);
    
    this.scene.time.delayedCall(
      this.invincibilityDuration,
      () => {
        this.player.setData('invincible', false);
        
        this.player.setAlpha(originalAlpha);
        
        if (this.invincibilityText) {
          this.invincibilityText.destroy();
          this.invincibilityText = null;
        }
      },
      [],
      this
    );
    
    this.scene.time.delayedCall(
      this.invincibilityDuration,
      () => {
        if (this.invincibilityText) {
          this.invincibilityText.destroy();
          this.invincibilityText = null;
        }
      },
      [],
      this
    );
    
    return;
  }
}