import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite; 
    velocitaCorrente: number;
    cursori: Phaser.Types.Input.Keyboard.CursorKeys;
    life: number;
    lifeText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
        this.velocitaCorrente = 0.5;
        this.life = 0;
    }

    preload () 
    {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
          });
        this.load.image('cuore', 'assets/cuore.png');
    }

    create ()
    {
        this.camera = this.cameras.main;

        this.sfondo = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'sfondo');
        this.sfondo.setOrigin(0, 0);
        this.sfondo.setAlpha(0.5);
        
        this.suolo = this.add.tileSprite(
            0,
            this.cameras.main.height - 40,
            this.cameras.main.width,
            16,
            'suelo'
        );
        this.suolo.setOrigin(0, 0);
        this.suolo.setScale(3);


        // life visual
        this.add.image(this.cameras.main.width - 175, 5, 'cuore').setOrigin(0, 0).setScale(0.2);
        this.lifeText = this.add.text(
            this.cameras.main.width - 85,
            4,
            '0', {
                fontSize: '68px',
                color: '#fff'
            });
        this.lifeText.setScrollFactor(0);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
            this.increaseLife();
            },
            callbackScope: this,
            loop: true
        });


        this.cursori = this.input.keyboard.createCursorKeys();

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.cursori.left.isDown) {
            this.velocitaCorrente += 0.01;
            console.log('Current speed: ' + this.velocitaCorrente);
        }

        this.sfondo.tilePositionX += this.velocitaCorrente;
        this.suolo.tilePositionX += this.velocitaCorrente;
    }

    increaseLife() {
        this.life += 1;
        this.lifeText.setText('' + this.life);
        if (this.life > 10) {
            this.lifeText.setText('∞');
        }
    }

    cambiaScena ()
    {
        this.scene.start('GameOver');
    }
}