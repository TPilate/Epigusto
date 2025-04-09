import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class LeaderBoard extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;

    constructor ()
    {
        super('LeaderBoard');
    }


    preload(){
        this.load.image('reload', './assets/retry_button.png');
        this.load.image('pezzo', './assets/piece.png');
        this.load.image('leaderBoard', './assets/scoreboard.png');
        this.load.image('board','./assets/entry_of_name.png')
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        const scoreBoard = this.add.image(512, 384, 'leaderBoard');
        const playerScores = [];
        let index = 1;
        while (localStorage.getItem(`playerInfo${index}`)) {
            try {
            const playerData = localStorage.getItem(`playerInfo${index}`);
            if (playerData) {
                const playerInfo = JSON.parse(playerData);
                playerScores.push({
                    name: playerInfo.name,
                    score: playerInfo.score,
                    index: index
                });
            }
            } catch (e) {
            console.error("Error parsing player data:", e);
            }
            index++;
        }
        playerScores.sort((b, a) => a.score - b.score);
        const topPlayers = playerScores.slice(0, 5);
        topPlayers.forEach((player, i) => {
            const posY = 250 + (i * 50);
            // Add board image as background for each entry
            const board = this.add.image(512, posY, 'board').setDisplaySize(400, 80);
            this.add.text(350, posY, player.name, { fontFamily:'minecraft', fontSize: '24px', color: '#000' }).setOrigin(0, 0.5);
            this.add.text(600, posY, player.score.toString(), { fontFamily:'minecraft', fontSize: '24px', color: '#000' }).setOrigin(0, 0.5);
        });
        const retryButton = this.add.image(512, 600, 'reload').setInteractive();
        retryButton.on('pointerdown', () => this.changeScene());
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
