import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { TodoItem } from '@/lib/cosmosClient';

export class LeaderBoard extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;
    loadingText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('LeaderBoard');
    }

    async getScore(): Promise<TodoItem[]> {
        try {
            const response = await fetch('/api/scores');
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des scores:', error);
            return [
                { id: '1', pseudo: 'Error', score: 0, createdAt: new Date().toISOString() }
            ];
        }
    }

    preload(){
        this.load.image('reload', './assets/retry_button.png');
        this.load.image('pezzo', './assets/piece.png');
        this.load.image('leaderBoard', './assets/scoreboard.png');
        this.load.image('board', './assets/entry_of_name.png');
    }

    async create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        const scoreBoard = this.add.image(512, 384, 'leaderBoard');
        
        this.loadingText = this.add.text(512, 384, 'Loading scores...', 
            { fontFamily: 'minecraft', fontSize: '24px', color: '#fff' })
            .setOrigin(0.5);
        
        try {
            const playerScores = await this.getScore();
            console.log(playerScores);
            
            playerScores.sort((a, b) => b.score - a.score);
            
            const topPlayers = playerScores.slice(0, 5);
            
            topPlayers.forEach((player, i) => {
                const posY = 250 + (i * 50);
                const board = this.add.image(512, posY, 'board').setDisplaySize(400, 80);
                this.add.text(350, posY, player.pseudo, 
                    { fontFamily: 'minecraft', fontSize: '24px', color: '#000' })
                    .setOrigin(0, 0.5);
                this.add.text(600, posY, player.score.toString(), 
                    { fontFamily: 'minecraft', fontSize: '24px', color: '#000' })
                    .setOrigin(0, 0.5);
            });
            
            this.loadingText.destroy();
            
        } catch (error) {
            console.error('Error fetching scores:', error);
            this.loadingText.setText('Failed to load scores');
        }
        
        const retryButton = this.add.image(512, 600, 'reload').setInteractive();
        retryButton.on('pointerdown', () => this.changeScene());
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
