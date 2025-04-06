export interface ConfigurazioneFenice {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
}

export class Fenice {
  private scene: Phaser.Scene;
  private player: Phaser.Physics.Arcade.Sprite;
  private durataInvincibilita: number = 5000;
  private testoInvincibilita: Phaser.GameObjects.Text | null = null;
  private spriteFenice: Phaser.GameObjects.Sprite | null = null;

  constructor(config: ConfigurazioneFenice) {
    this.scene = config.scene;
    this.player = config.player;
  }

  attivaInvincibilita(): void {
    this.player.setData('invincible', true);
    
    this.scene.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 500,
        onComplete: () => {
            this.player.setVisible(false);
            this.player.setAlpha(1);
            
            this.spriteFenice = this.scene.add.sprite(
                this.player.x,
                this.player.y,
                'fenice'
            );
            
            this.spriteFenice.play('phoenix_fly');
            this.spriteFenice.setScale(3);

            const tweenFluttuante = this.scene.tweens.add({
                targets: this.spriteFenice,
                y: '-=10',
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            
            this.spriteFenice.setData('floatTween', tweenFluttuante);
        }
    });
    
    this.testoInvincibilita = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        100,
        'INVINCIBILE!',
        {
            fontFamily: 'minecraft',
            fontSize: '32px',
            color: '#ff0000'
        }
    );
    this.testoInvincibilita.setOrigin(0.5);
    
    const aggiornaPosizioneFenice = () => {
        if (this.spriteFenice && this.player) {
            this.spriteFenice.x = this.player.x;
        }
    };
    
    const eventoAggiornamento = this.scene.events.on('update', aggiornaPosizioneFenice);
    
    this.scene.time.delayedCall(
        this.durataInvincibilita - 500,
        () => {
            if (this.spriteFenice) {
                const tweenFluttuante = this.spriteFenice.getData('floatTween');
                if (tweenFluttuante) {
                    tweenFluttuante.stop();
                }
                
                this.spriteFenice.y = this.player.y;
                
                this.scene.tweens.add({
                    targets: this.spriteFenice,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.spriteFenice) {
                            this.spriteFenice.destroy();
                            this.spriteFenice = null;
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
            
            if (this.testoInvincibilita) {
                this.testoInvincibilita.destroy();
                this.testoInvincibilita = null;
            }
            
            this.scene.events.off('update', aggiornaPosizioneFenice);
        },
        [],
        this
    );
    
    return;
  }
}