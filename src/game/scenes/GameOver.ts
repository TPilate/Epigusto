import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    finalText: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.image('reload', './assets/retry_button.png');
        this.load.image('piece', './assets/piece.png');
        this.load.image('leaderboard', './assets/leaderboard.png');
    }

    create() {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.finalText = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'minecraft', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const buttonScale = 0.7;
        const hoverScale = 0.8;
        const centerY = 520;
        
        const retryButton = this.add.image(412, centerY, 'reload')
            .setOrigin(0.5)
            .setScale(buttonScale)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.changeScene())
            .on('pointerover', () => retryButton.setScale(hoverScale))
            .on('pointerout', () => retryButton.setScale(buttonScale));
        
        const leaderboardButton = this.add.image(612, centerY, 'leaderboard')
            .setOrigin(0.5)
            .setScale(buttonScale)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('LeaderBoard'))
            .on('pointerover', () => leaderboardButton.setScale(hoverScale))
            .on('pointerout', () => leaderboardButton.setScale(buttonScale));

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene() {
        this.scene.start('MainMenu');
    }
}
