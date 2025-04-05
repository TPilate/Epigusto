import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite; 
    velocitaCorrente: number;

    private velocitaMas: number;
    private intervalloIncremento: number;


    constructor ()
    {
        super('Game');
        this.velocitaCorrente = 0.5;
        this.velocitaMas = 5.0;
        this.intervalloIncremento = 5000;
    }

    preload () 
    {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
          });
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

        this.time.addEvent({
            delay: this.intervalloIncremento,
            callback: this.aumentareVelocita,
            callbackScope: this,
            loop: true
        });

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        this.sfondo.tilePositionX += this.velocitaCorrente;
        this.suolo.tilePositionX += this.velocitaCorrente;
    }

    cambiaScena ()
    {
        this.scene.start('GameOver');
    }

    private aumentareVelocita(): void {
        const valoreIncremento = 0.2;
        
        this.velocitaCorrente += valoreIncremento;
        
        if (this.velocitaCorrente > this.velocitaMas) {
            this.velocitaCorrente = this.velocitaMas;
        }
    }
}