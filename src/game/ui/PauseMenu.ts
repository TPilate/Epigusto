import * as Phaser from 'phaser';

export interface PauseMenuConfig {
    scene: Phaser.Scene;
    onResume: () => void;
    onQuit: () => void;
    sounds?: {
        forestSound?: Phaser.Sound.BaseSound;
        mainTheme?: Phaser.Sound.BaseSound;
    };
}

export class PauseMenu {
    private scene: Phaser.Scene;
    private menuContainer: Phaser.GameObjects.Container;
    private onResume: () => void;
    private onQuit: () => void;
    private sounds: {
        forestSound?: Phaser.Sound.BaseSound;
        mainTheme?: Phaser.Sound.BaseSound;
    };

    constructor(config: PauseMenuConfig) {
        this.scene = config.scene;
        this.onResume = config.onResume;
        this.onQuit = config.onQuit;
        this.sounds = config.sounds || {};
        
        this.createMenu();
    }

    private createMenu(): void {
        const { width, height } = this.scene.cameras.main;
        
        this.menuContainer = this.scene.add.container(width / 2, height / 2);
        this.menuContainer.setDepth(1000);
        this.menuContainer.setVisible(false);

        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);

        const pauseText = this.scene.add.text(0, -100, 'PAUSE', {
            fontFamily: 'minecraft',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const resumeButton = this.scene.add.text(0, 0, 'Reprendre', {
            fontFamily: 'minecraft',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const quitButton = this.scene.add.text(0, 80, 'Quitter', {
            fontFamily: 'minecraft',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        resumeButton.on('pointerdown', () => {
            this.onResume();
        });

        quitButton.on('pointerdown', () => {
            this.onQuit();
        });

        [resumeButton, quitButton].forEach(button => {
            button.on('pointerover', () => {
                button.setStyle({ color: '#ffff00' });
            });

            button.on('pointerout', () => {
                button.setStyle({ color: '#ffffff' });
            });
        });

        this.menuContainer.add([background, pauseText, resumeButton, quitButton]);
    }

    show(): void {
        this.menuContainer.setVisible(true);
        
        // Réduire le volume des sons
        if (this.sounds.forestSound?.isPlaying) {
            this.sounds.forestSound.setVolume(0.05);
        }
        if (this.sounds.mainTheme?.isPlaying) {
            this.sounds.mainTheme.setVolume(0.05);
        }
    }

    hide(): void {
        this.menuContainer.setVisible(false);
        
        // Restaurer le volume des sons
        if (this.sounds.forestSound?.isPlaying) {
            this.sounds.forestSound.setVolume(0.2);
        }
        if (this.sounds.mainTheme?.isPlaying) {
            this.sounds.mainTheme.setVolume(0.3);
        }
    }

    isVisible(): boolean {
        return this.menuContainer.visible;
    }

    destroy(): void {
        this.menuContainer.destroy();
    }
}