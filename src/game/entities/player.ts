import Phaser from 'phaser';

export class Giocatore extends Phaser.Physics.Arcade.Sprite {
    private forzaSalto: number;
    private salute: number;
    private staSaltando: boolean;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'idle'); 

        scene.add.existing(this);
        // scene.physics.add.existing(this);

        const corpoArcade = this.body as Phaser.Physics.Arcade.Body;
        // corpoArcade.collideWorldBounds = true;  

        this.forzaSalto = -400;
        this.salute = 1;
        this.staSaltando = false;

        this.creaAnimazioni();

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        }
    }

    private creaAnimazioni(): void {

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 20
        });
    }

    update(): void {

        if (!this.body) return;

        const corpo = this.body as Phaser.Physics.Arcade.Body;

        if (this.cursors.up.isDown && corpo.onFloor()) {
            this.setVelocityY(this.forzaSalto);
            this.play('jump', true);
            this.staSaltando = true;
        }

        if (corpo.onFloor()) {
            this.staSaltando = false;
        }
    }

    prendiDanno(quantita: number): void {
        this.salute -= quantita;
        if (this.salute <= 0) {
            this.muori();
        }
    }

    muori(): void {
        if (this.body) {
            this.disableBody(true, true);
            this.scene.events.emit('playerDied');
        }
    }

    get corpoArcade(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }
}