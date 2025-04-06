export interface PhoenixConfig {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
}

export class Phoenix {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private invincibilityDuration: number = 5000;
  private invincibilityText: Phaser.GameObjects.Text | null = null;
  private phoenixSprite: Phaser.GameObjects.Sprite | null = null;

  constructor(config: PhoenixConfig) {
    this.scene = config.scene;
    this.player = config.player;
  }

  activateInvincibility(): void {
    this.player.setData('invincible', true);
    
    this.scene.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 500,
        onComplete: () => {
            this.player.setVisible(false);
            this.player.setAlpha(1);
            
            this.phoenixSprite = this.scene.add.sprite(
                this.player.x,
                this.player.y,
                'phoenix'
            );
            
            this.phoenixSprite.play('phoenix_fly');
            this.phoenixSprite.setScale(3);

            const floatTween = this.scene.tweens.add({
                targets: this.phoenixSprite,
                y: '-=10',
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            
            this.phoenixSprite.setData('floatTween', floatTween);
        }
    });
    
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
    
    const updatePhoenixPosition = () => {
        if (this.phoenixSprite && this.player) {
            this.phoenixSprite.x = this.player.x;
        }
    };
    
    const updateEvent = this.scene.events.on('update', updatePhoenixPosition);
    
    this.scene.time.delayedCall(
        this.invincibilityDuration - 500,
        () => {
            if (this.phoenixSprite) {
                const floatTween = this.phoenixSprite.getData('floatTween');
                if (floatTween) {
                    floatTween.stop();
                }
                
                this.phoenixSprite.y = this.player.y;
                
                this.scene.tweens.add({
                    targets: this.phoenixSprite,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.phoenixSprite) {
                            this.phoenixSprite.destroy();
                            this.phoenixSprite = null;
                        }
                        
                        this.player.setVisible(true);
                        this.player.setAlpha(0);
                        this.scene.tweens.add({
                            targets: this.player,
                            alpha: 1,
                            duration: 500
                        });
                        
                        this.player.setData('invincible', false);
                    }
                });
            }
            
            if (this.invincibilityText) {
                this.invincibilityText.destroy();
                this.invincibilityText = null;
            }
            
            this.scene.events.off('update', updatePhoenixPosition);
        },
        [],
        this
    );
    
    return;
  }
}