import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite;
    velocitaCorrente: number;
    cursori: Phaser.Types.Input.Keyboard.CursorKeys;
    player: Phaser.Physics.Arcade.Sprite;
    keys: any;

    constructor() {
        super('Game');
        this.velocitaCorrente = 0.5;
    }

    preload() {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
        });

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
        this.player = this.physics.add.sprite(80, 200, 'character');
        this.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height - 155);
        this.player.setBounce(0.3);
        this.player.setGravityY(800);

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

        this.keys = this.input.keyboard?.addKeys({
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            spaceBar: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
        
        this.player.play('run');   

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        // Update background and ground positions
        this.sfondo.tilePositionX += this.velocitaCorrente;
        this.suolo.tilePositionX += this.velocitaCorrente;
        
      
        
        // Handle jump with space key
        if (this.keys?.spaceBar?.isDown) {
            this.player.setVelocityY(-600);
            this.player.play('jump', true);
        }
        
        // Return to running animation when back on ground
        if (!this.cursori.space.isDown) {
            this.player.play('run', true);
        }
    }

    cambiaScena() {
        this.scene.start('GameOver');
    }
}