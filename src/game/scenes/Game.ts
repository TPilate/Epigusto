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
    punteggio: number;
    testoPunteggio: Phaser.GameObjects.Text;
    private velocitaMassima: number;
    private intervalloIncremento: number;
    private punteggioTarget: number; 
    private incrementoPunteggio: number;
    private timerIncrementoPunteggio: Phaser.Time.TimerEvent;

    constructor() {
        super('Game');
        this.velocitaCorrente = 0.5;
        this.punteggio = 0;
        this.punteggioTarget = 0;
        this.incrementoPunteggio = 2;
        this.velocitaMassima = 5.0;
        this.intervalloIncremento = 5000;
    }

    preload() {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('pezzo', 'assets/pezzo.png');
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
            frameRate: 10,
        });

        // Score UI
        this.add.image(15, 5, 'pezzo').setOrigin(0, 0).setScale(0.1);
        this.testoPunteggio = this.add.text(
            65,
            18,
            '0', {
            fontFamily: 'minecraft',
            fontSize: '24px',
            color: '#fff'
        });
        this.testoPunteggio.setScrollFactor(0);

        this.cursori = this.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;

        this.kya = this.input.keyboard?.addKeys({
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            spaceBar: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
        
        this.Giocatore.play('run');
        
        // Score timer
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.calcolaNuovoPunteggioTarget();
            },
            callbackScope: this,
            loop: true
        });

        this.timerIncrementoPunteggio = this.time.addEvent({
            delay: 100,
            callback: this.aggiornaDisplayPunteggio,
            callbackScope: this,
            loop: true
        });
        
        // Speed increase timer
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
        

        const ilGiocatoreSulTerreno = this.Giocatore.body ? (this.Giocatore.body.touching.down || this.Giocatore.body.blocked.down) : false;
        if ((this.kya?.spaceBar?.isDown || this.cursori.space?.isDown) && ilGiocatoreSulTerreno) {
            this.Giocatore.setVelocityY(-800);
            this.Giocatore.play('jump', true);
            // Add a 1-second delay before playing run animation
            this.time.delayedCall(500, () => {
                this.Giocatore.play('run', true);
            });

        }
        
        if (ilGiocatoreSulTerreno && this.Giocatore.body && this.Giocatore.body.velocity.y === 0) {
            if (this.Giocatore.anims.currentAnim?.key !== 'run') {
                this.Giocatore.play('run', true);
            }
        }
        
    }

    calcolaNuovoPunteggioTarget() {
        const bonusVelocita = Math.floor(this.velocitaCorrente * 100);
        this.punteggioTarget += 1 + bonusVelocita;
    }

    aggiornaDisplayPunteggio() {
        if (this.punteggio < this.punteggioTarget) {
            this.punteggio += this.incrementoPunteggio;
            
            if (this.punteggio > this.punteggioTarget) {
                this.punteggio = this.punteggioTarget;
            }
            
            this.testoPunteggio.setText('' + this.punteggio);
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