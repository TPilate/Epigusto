import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite;
    velocitaCorrente: number;
    cursori: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    Giocatore: Phaser.Physics.Arcade.Sprite;
    kya: any;
    punteggio: number;
    testoPunteggio: Phaser.GameObjects.Text;
    vita: number;
    testoVita: Phaser.GameObjects.Text;
    private velocitaMassima: number;
    private intervalloIncremento: number;
    private punteggioTarget: number;
    private incrementoPunteggio: number;
    private timerIncrementoPunteggio: Phaser.Time.TimerEvent;
    ostacolo: Phaser.Physics.Arcade.Group;
    tempoDiRigenerazione: number;

    constructor() {
        super('Game');
        this.velocitaCorrente = 0.5;
        this.punteggio = 0;
        this.punteggioTarget = 0;
        this.incrementoPunteggio = 2;
        this.velocitaMassima = 5.0;
        this.intervalloIncremento = 5000;
        this.vita = 0;
        this.tempoDiRigenerazione = 0
    }

    preload() {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('pezzo', 'assets/pezzo.png');
        this.load.image('cuore', 'assets/cuore.png');
        this.load.atlas('character', './assets/PersonaggioFoglioSprite.png', './assets/PersonaggioFoglio.json');

        this.load.atlas('character', './assets/PersonaggioFoglioSprite.png','./assets/PersonaggioFoglio.json');
        this.load.spritesheet('trappola', 'assets/trappola_per_orsi.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.ostacolo = this.physics.add.group();

        this.physics.world.createDebugGraphic();
        
        // background
        this.sfondo = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'sfondo');
        this.sfondo.setOrigin(0, 0);
        this.sfondo.setAlpha(0.5);

        this.anims.create({
            key: "trapclose",
            frames: this.anims.generateFrameNumbers('trappola', {frames:[0, 1, 2, 3]}),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('character', { prefix: 'death', end: 4, zeroPad: 2 }),
            frameRate: 8,
        });

        // ground
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
        this.physics.add.existing(this.suolo, true); 

        this.physics.world.createDebugGraphic();


        this.physics.world.debugGraphic.visible = true;
        this.physics.world.debugGraphic.lineStyle(1, 0x00ff00); // Green outlines for hitboxes


        this.Giocatore = this.physics.add.sprite(80, 200, 'character');


        this.physics.add.collider(this.Giocatore, this.suolo);
        this.Giocatore.setSize(62, 120);
        this.Giocatore.setOffset(16, 16);
        this.Giocatore.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
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

        // Vie UI
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
        this.cursori = this?.input?.keyboard?.createCursorKeys();

        this.initCollider()
        EventBus.emit('current-scene-ready', this);
    }

    luogoOstacolo() {
        const ostacoloNum = Math.floor(Math.random() * 7) + 1;
        
        if (ostacoloNum > 6) {
            const trappola = this.physics.add.sprite(
                this.cameras.main.width, 
                this.cameras.main.height - 60, 
                'trappola'
            );
            
            trappola.setFrame(0);
            this.ostacolo.add(trappola);
            trappola.setScale(4);
            trappola.setImmovable(true);
            trappola.body.setAllowGravity(false);
            trappola.setData('hasCollided', false);
        } else {
            return
        }
    }

    trappolaCollisione(ostacolo: Phaser.Physics.Arcade.Sprite) {
        if (ostacolo.getData('hasCollided')) {
            return;
        }
        
        ostacolo.setData('hasCollided', true);
        
        ostacolo.play("trapclose", true);
        
        ostacolo.once('animationcomplete', () => {
            ostacolo.destroy();
        });
        
        this.vita -= 1;
        this.testoVita.setText('' + this.vita);
        
        if (this.vita <= 0) {
            this.time.delayedCall(500, () => {
                this.cambiaScena();
            });
        }
    }
    initCollider() {
        this.physics.add.overlap(
            this.ostacolo, 
            this.Giocatore, 
            (player, ostacolo) => {
                this.trappolaCollisione(ostacolo as Phaser.Physics.Arcade.Sprite);
            }
        );
    }
    update(delta: number) {
        if (this.cursori?.left?.isDown) {
            this.velocitaCorrente += 0.01;
            console.log('Current speed: ' + this.velocitaCorrente);
        }

        Phaser.Actions.IncX(this.ostacolo.getChildren(), -this.velocitaCorrente * 3)

        this.tempoDiRigenerazione += delta * this.velocitaCorrente * 0.08 / 10;
        if (this.tempoDiRigenerazione >= 1500) {
          this.luogoOstacolo();
          this.tempoDiRigenerazione = 0;
        }

        this.sfondo.tilePositionX += this.velocitaCorrente;
        this.suolo.tilePositionX += this.velocitaCorrente;


        const ilGiocatoreSulTerreno = this.Giocatore.body ? (this.Giocatore.body.touching.down || this.Giocatore.body.blocked.down) : false;
        if ((this.kya?.spaceBar?.isDown || this.cursori?.space?.isDown) && ilGiocatoreSulTerreno) {
            this.Giocatore.setVelocityY(-600);
            this.Giocatore.play('jump', true);
            // Add a 1-second delay before playing run animation
            this.time.delayedCall(500, () => {
                this.Giocatore.play('run', true);
            });
            this.Giocatore.setBounce(0);
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

    aumentaVita() {
        if (this.vita >= 10) {
            this.testoVita.setText('∞');
            this.testoVita.setPosition(this.cameras.main.width - 80, 8);
            return;
        }

        this.vita += 1;
        this.testoVita.setText('' + this.vita);
    }

    cambiaScena() {

        this.Giocatore.play('death', true);

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver');
        });
    }

    private aumentareVelocita(): void {
        const valoreIncremento = 0.2;
        this.velocitaCorrente += valoreIncremento;

        if (this.velocitaCorrente > this.velocitaMassima) {
            this.velocitaCorrente = this.velocitaMassima;
        }
    }
}