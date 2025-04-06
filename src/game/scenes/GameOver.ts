import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
    telecamera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.Image;
    testoFinale: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.image('reload', './assets/pulsante_riprova.png');
        this.load.image('pezzo', './assets/pezzo.png');
        this.load.image('lodobolo', './assets/lodobolo.png');
    }

    create() {
        this.telecamera = this.cameras.main
        this.telecamera.setBackgroundColor(0xff0000);

        this.sfondo = this.add.image(512, 384, 'background');
        this.sfondo.setAlpha(0.5);

        this.testoFinale = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const scalaPulsante = 0.7;
        const scalaHover = 0.8;
        const centroY = 520;
        
        const pulsanteRiprova = this.add.image(412, centroY, 'reload')
            .setOrigin(0.5)
            .setScale(scalaPulsante)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.cambiaSfondo())
            .on('pointerover', () => pulsanteRiprova.setScale(scalaHover))
            .on('pointerout', () => pulsanteRiprova.setScale(scalaPulsante));
        
        const pulsanteClassifica = this.add.image(612, centroY, 'lodobolo')
            .setOrigin(0.5)
            .setScale(scalaPulsante)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('LeaderBoard'))
            .on('pointerover', () => pulsanteClassifica.setScale(scalaHover))
            .on('pointerout', () => pulsanteClassifica.setScale(scalaPulsante));

        EventBus.emit('current-scene-ready', this);
    }

    cambiaSfondo() {
        this.scene.start('MainMenu');
    }
}
