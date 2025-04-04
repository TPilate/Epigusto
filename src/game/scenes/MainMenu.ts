import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    keys: any;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);

        this.cursors = this.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;
    
        this.keys = this.input.keyboard?.addKeys({
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            spaceBar: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
    }

    update ()
    {
        const jump = 10;

        if (this.logoTween && 
            (this.cursors.up.isDown || this.cursors.down.isDown ||
            this.keys.z.isDown || 
            this.keys.spaceBar.isDown)) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        if (this.keys?.z?.isDown || this.cursors.up.isDown || this.keys?.spaceBar?.isDown) {
            this.logo.y -= jump;
            setTimeout(() => {      
                this.logo.y += jump;          
            }, 200);
        }
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (reactCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 100, duration: 2000, ease: 'Back.easeInOut' },
                // y: { value: 10, duration: 10  },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback) {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
