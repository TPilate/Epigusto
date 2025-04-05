import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    nameFormContainer: HTMLFormElement;
    nameInput: HTMLInputElement;
    nameInputContainer: HTMLDivElement;
    submitButton: HTMLButtonElement;
    playerName: string = '';

    constructor ()
    {
        super('MainMenu');
    }

    preload() {
        this.load.image('input-bg', './assets/immissione_del_nome.png');
        this.load.image('button-bg', './assets/pulsante_di_avvio.png');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');
        this.createNameInput();
        this.loadPlayerName();

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.events.on('shutdown', this.handleShutdown, this);
        EventBus.emit('current-scene-ready', this);
    }

    createNameInput() {
        this.nameFormContainer = document.createElement("form")
        this.nameInputContainer = document.createElement('div');
        this.nameInputContainer.style.position = 'absolute';
        this.nameInputContainer.style.top = '450px';
        this.nameInputContainer.style.left = '47%';
        this.nameInputContainer.style.right = '50%';
        this.nameInputContainer.style.transform = 'translateX(-50%)';
        this.nameInputContainer.style.zIndex = '1000';
        this.nameInputContainer.style.display = 'flex';
        this.nameInputContainer.style.flexDirection = 'column';
        this.nameInputContainer.style.gap = '10px';
        this.nameInputContainer.style.alignItems = 'center';
        
        this.nameInput = document.createElement('input');
        this.nameInput.required = true
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Enter your name';
        this.nameInput.style.padding = '36px';
        this.nameInput.style.borderRadius = '4px';
        this.nameInput.style.border = '2px solid transparent';
        this.nameInput.style.backgroundImage = "url('./assets/immissione_del_nome.png')";
        this.nameInput.style.backgroundSize = '100% 100%';
        this.nameInput.style.backgroundRepeat = 'no-repeat';
        this.nameInput.style.backgroundColor = 'transparent';
        this.nameInput.style.color = 'white';
        this.nameInput.style.fontWeight = 'bold';
        this.nameInput.style.fontSize = '32px';
        this.nameInput.style.paddingBottom = "50px"
        this.nameInput.style.textAlign = 'center';
        this.nameInput.id = 'player-name-input';
        const styleId = 'player-name-placeholder-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #player-name-input::placeholder {
                    color: white;
                    opacity: 1;
                }
                #player-name-input::-webkit-input-placeholder {
                    color: white;
                }
                #player-name-input:-ms-input-placeholder {
                    color: white;
                }
                #player-name-input::-moz-placeholder {
                    color: white;
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        this.submitButton = document.createElement('button');
        this.submitButton.textContent = 'Start Game';
        this.submitButton.style.padding = '8px 16px';
        this.submitButton.style.border = 'none';
        this.submitButton.style.borderRadius = '4px';
        this.submitButton.style.cursor = 'pointer';
        this.submitButton.style.backgroundImage = "url('./assets/pulsante_di_avvio.png')";
        this.submitButton.style.backgroundSize = '100% 100%';
        this.submitButton.style.backgroundRepeat = 'no-repeat';
        this.submitButton.style.backgroundColor = 'transparent';
        this.submitButton.style.color = 'white';
        this.submitButton.style.fontWeight = 'bold';
        this.submitButton.style.textShadow = '1px 1px 2px black';
        this.submitButton.style.fontSize = "32px"
        
        const inputTexture = this.textures.get('input-bg');
        const buttonTexture = this.textures.get('button-bg');

        const inputAspectRatio = inputTexture.source[0].height / inputTexture.source[0].width;
        this.nameInput.style.width = `300px`;
        this.nameInput.style.height = `${Math.round(300 * inputAspectRatio)}px`;

        const buttonAspectRatio = buttonTexture.source[0].height / buttonTexture.source[0].width;
        this.submitButton.style.width = `300px`;
        this.submitButton.style.height = `${Math.round(300 * buttonAspectRatio)}px`;

        this.submitButton.addEventListener('click', () => this.savePlayerName());
        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.savePlayerName();
                this.changeScene()
            }
        });
        
        this.nameInputContainer.appendChild(this.nameInput);
        this.nameInputContainer.appendChild(this.submitButton);
        this.nameFormContainer.appendChild(this.nameInputContainer)
        document.body.appendChild(this.nameFormContainer);
        
        if (this.playerName) {
            this.nameInput.value = this.playerName;
        }
    }
    
    savePlayerName() {
        const name = this.nameInput.value.trim();
        if (name) {
            this.playerName = name;
            localStorage.setItem('playerName', name);
            
            this.scene.restart();
        }
    }
    
    loadPlayerName() {
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            this.playerName = savedName;
        }
    }

    handleShutdown() {
        if (this.nameInputContainer && this.nameInputContainer.parentNode) {
            this.nameInputContainer.parentNode.removeChild(this.nameInputContainer);
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
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
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
