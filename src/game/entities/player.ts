import Phaser from 'phaser';

export class player extends Phaser.Physics.Arcade.Sprite {
    private jumpForce: number;
    private health: number;
    private isJumping: boolean;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'idle'); 

        // Ajout du sprite à la scène et activation de la physique
        scene.add.existing(this);
        // scene.physics.add.existing(this);

        const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        // arcadeBody.collideWorldBounds = true;  

        this.jumpForce = -400;
        this.health = 1;
        this.isJumping = false;

        this.createAnimations();

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        }
    }

    private createAnimations(): void {

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

        const body = this.body as Phaser.Physics.Arcade.Body;

        if (this.cursors.up.isDown && body.onFloor()) {
            this.setVelocityY(this.jumpForce);
            this.play('jump', true);
            this.isJumping = true;
        }

        if (body.onFloor()) {
            this.isJumping = false;
        }
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die(): void {
        if (this.body) {
            this.disableBody(true, true);
            this.scene.events.emit('playerDied');
        }
    }

    get arcadeBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }
}