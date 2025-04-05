import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Phaser.Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    gameText!: Phaser.GameObjects.Text;
    player!: Phaser.Physics.Arcade.Sprite;
    physics!: Phaser.Physics.Arcade.ArcadePhysics;


    constructor() {
        super('Game');
    }

    preload() {
        this.load.spritesheet('player', './assets/PersonaggioFoglioSprite.png', {
            frameWidth: 80,
            frameHeight: 150
        });
        this.load.image('background', './assets/sfondo.png');

    }

    create() {
        console.log(this.physics);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        this.player = this.physics.add.sprite(500, 750, 'player');

        this.camera = this.cameras.main;

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 2
            }),
            frameRate: 10,
            repeat: -1
        });



        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        this.scene.start('GameOver');
    }




}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
    scene: [Game]
};
new Phaser.Game(config);
