import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite;
    velocitaCorrente: number;
    cursori: Phaser.Types.Input.Keyboard.CursorKeys;
    Giocatore: Phaser.Physics.Arcade.Sprite;
    kya: any;
    vita: number;
    testoVita: Phaser.GameObjects.Text;
    private velocitaMassima: number;
    private intervalloIncremento: number;


    constructor() {
        super('Game');
        this.velocitaCorrente = 0.5;
        this.velocitaMassima = 5.0;
        this.intervalloIncremento = 5000;
        this.vita = 10;
    }

    preload() {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('cuore', 'assets/cuore.png');
        this.load.atlas('character', './assets/PersonaggioFoglioSprite.png','./assets/PersonaggioFoglio.json');
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
        
        // life visual
        this.add.image(this.cameras.main.width - 175, 5, 'cuore').setOrigin(0, 0).setScale(0.2);
        this.testoVita = this.add.text(
            this.cameras.main.width - 75,
            10,
            '0', {
                fontFamily: 'minecraft',
                fontSize: '52px',
                color: '#fff'
            });
        this.testoVita.setScrollFactor(0);
        
        this.time.addEvent({
            delay: 1000,
            callback: this.aumentaVita,
            callbackScope: this,
            loop: true
        });
        
        this.Giocatore = this.physics.add.sprite(80, 200, 'character');
        this.Giocatore.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height - 155);
        this.Giocatore.setBounce(0.3);
        this.Giocatore.setGravityY(800);

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('character', { prefix: 'run', end: 4, zeroPad: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('character', { prefix: 'jump', end: 3, zeroPad: 2 }),
            frameRate: 20,
            repeat: 0
        });


        this.cursori = this.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;

        this.kya = this.input.keyboard?.addKeys({
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            spaceBar: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
        
        this.Giocatore.play('run');   
        this.time.addEvent({
            delay: this.intervalloIncremento,
            callback: this.aumentareVelocita,
            callbackScope: this,
            loop: true
        });

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        if (this.cursori.left?.isDown) {
            this.velocitaCorrente += 0.01;
            console.log('Current speed: ' + this.velocitaCorrente);
        }
        
        this.sfondo.tilePositionX += this.velocitaCorrente;
        this.suolo.tilePositionX += this.velocitaCorrente;
        
        if (this.kya?.spaceBar?.isDown) {
            this.Giocatore.setVelocityY(-600);
            this.Giocatore.play('jump', true);
        }
        
        if (!this.cursori.space.isDown) {
            this.Giocatore.play('run', true);
        }
    }

    aumentaVita() {
        this.vita += 1;
        this.testoVita.setText('' + this.vita);
        if (this.vita > 10) {
            this.testoVita.setText('∞');
            this.testoVita.setPosition(this.cameras.main.width - 80, 8);
        }
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