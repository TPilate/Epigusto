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
        this.load.image('reload', './assets/pulsante_riprova.png');
        this.load.image('pezzo', './assets/pezzo.png');
        this.load.image('leaderBoard', './assets/tabellone_segnapunti.png');
        this.load.image('board','./assets/immissione_del_nome.png')
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        const tabellonePunteggi = this.add.image(512, 384, 'leaderBoard');
        const punteggiGiocatori = [];
        let indice = 1;
        while (localStorage.getItem(`playerInfo${indice}`)) {
            try {
            const datiGiocatore = JSON.parse(localStorage.getItem(`playerInfo${indice}`));
            punteggiGiocatori.push({
                nome: datiGiocatore.name,
                punteggio: datiGiocatore.score,
                indice: indice
            });
            } catch (e) {
            console.error("Errore nell'analisi dei dati del giocatore:", e);
            }
            indice++;
        }
        punteggiGiocatori.sort((b, a) => a.punteggio - b.punteggio);
        const miglioriGiocatori = punteggiGiocatori.slice(0, 5);
        miglioriGiocatori.forEach((giocatore, i) => {
            const posY = 250 + (i * 50);
            // Add board image as background for each entry
            const board = this.add.image(512, posY, 'board').setDisplaySize(400, 80);
            this.add.text(350, posY, giocatore.nome, { fontSize: '24px', color: '#000' }).setOrigin(0, 0.5);
            this.add.text(600, posY, giocatore.punteggio.toString(), { fontSize: '24px', color: '#000' }).setOrigin(0, 0.5);
        });
        const pulsanteRiprova = this.add.image(512, 600, 'reload').setInteractive();
        pulsanteRiprova.on('pointerdown', () => this.changeScene());
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
