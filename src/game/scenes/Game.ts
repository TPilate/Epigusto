import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite;
    velocitaCorrente: number;
    cursori: Phaser.Types.Input.Keyboard.CursorKeys;
    score: number;
    scoreText: Phaser.GameObjects.Text;

    private velocitaMassima: number;
    private intervalloIncremento: number;



    constructor() {
        super('Game');
        this.velocitaCorrente = 0.5;
        this.score = 0;
        this.velocitaMassima = 5.0;
        this.intervalloIncremento = 5000;
    }

    preload() {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('pezzo', 'assets/pezzo.png')
    }

    create() {
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


        this.add.image(15, 5, 'pezzo').setOrigin(0, 0).setScale(0.1);
        this.scoreText = this.add.text(
            65,
            18,
            '0', {
            fontSize: '24px',
            color: '#fff'
        });
        this.scoreText.setScrollFactor(0);

        // Set up a timer to increase score every second
        this.time.addEvent({
            delay: 1000,
            callback: () => {
            this.increaseScore();
            },
            callbackScope: this,
            loop: true
        });

        this.cursori = this.input.keyboard.createCursorKeys();
        
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

    increaseScore() {
        this.score += 100;
        this.scoreText.setText('' + this.score);
    }

    cambiaScena() {
        this.scene.start('GameOver');
    }

    private aumentareVelocita(): void {
        const valoreIncremento = 0.2;
        
        this.velocitaCorrente += valoreIncremento;
        
        if (this.velocitaCorrente > this.velocitaMassima) {
            this.velocitaCorrente = this.velocitaMassima;
        }
    }
}