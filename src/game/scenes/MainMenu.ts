import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    contenitoreFormNome: HTMLFormElement;
    inputNome: HTMLInputElement;
    contenitoreInputNome: HTMLDivElement;
    pulsanteInvio: HTMLButtonElement;
    nomeGiocatore: string = '';
    gestisciTastoPremi: (e: KeyboardEvent) => void;

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
        this.creaInputNome();
        this.caricaNomeGiocatore();

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.events.on('shutdown', this.handleShutdown, this);
        EventBus.emit('current-scene-ready', this);
    }

    creaInputNome() {
        this.contenitoreFormNome = document.createElement("form")
        this.contenitoreInputNome = document.createElement('div');
        this.contenitoreInputNome.classList.add("name-input-container")
        
        this.inputNome = document.createElement('input');
        this.inputNome.autocomplete = "off"
        this.inputNome.required = true
        this.inputNome.type = 'text';
        this.inputNome.placeholder = 'Enter your name';
        this.inputNome.id = 'player-name-input';
        
        this.pulsanteInvio = document.createElement('button');
        this.pulsanteInvio.textContent = 'Start Game';
        this.pulsanteInvio.classList.add("submit-button")
        
        const texturaInput = this.textures.get('input-bg');
        const texturaPulsante = this.textures.get('button-bg');

        const rapportoProporzioniInput = texturaInput.source[0].height / texturaInput.source[0].width;
        this.inputNome.style.width = `300px`;
        this.inputNome.style.height = `${Math.round(300 * rapportoProporzioniInput)}px`;

        const rapportoProporzioniPulsante = texturaPulsante.source[0].height / texturaPulsante.source[0].width;
        this.pulsanteInvio.style.width = `300px`;
        this.pulsanteInvio.style.height = `${Math.round(300 * rapportoProporzioniPulsante)}px`;

        this.pulsanteInvio.addEventListener('click', (e) => {
            if (!this.inputNome.value.trim()) {
                return;
            }
            e.preventDefault();
            this.salvaNomeGiocatore();
            this.rimuoviElementiInput();
            this.changeScene();
        this.gestisciTastoPremi = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.salvaNomeGiocatore();
                this.rimuoviElementiInput();
                this.changeScene();
            }
        };
        this.inputNome.addEventListener('keypress', this.gestisciTastoPremi);
        });
        
        this.contenitoreInputNome.appendChild(this.inputNome);
        this.contenitoreInputNome.appendChild(this.pulsanteInvio);
        this.contenitoreFormNome.appendChild(this.contenitoreInputNome)
        document.body.appendChild(this.contenitoreFormNome);
        
        if (this.nomeGiocatore) {
            this.inputNome.value = this.nomeGiocatore;
        }
    }
    
    salvaNomeGiocatore() {
        const nome = this.inputNome.value.trim();
        if (nome) {
            this.nomeGiocatore = nome;
            localStorage.setItem('playerName', nome);
            
            this.scene.restart();
        }
    }
    
    caricaNomeGiocatore() {
        const nomeSalvato = localStorage.getItem('playerName');
        if (nomeSalvato) {
            this.nomeGiocatore = nomeSalvato;
        }
    }

    handleShutdown() {
        if (this.contenitoreFormNome && this.contenitoreFormNome.parentNode) {
            this.contenitoreFormNome.parentNode.removeChild(this.contenitoreFormNome);
        }
    }

    rimuoviElementiInput() {
        if (this.contenitoreFormNome && this.contenitoreFormNome.parentNode) {
            this.pulsanteInvio.removeEventListener('click', this.salvaNomeGiocatore);
            this.inputNome.removeEventListener('keypress', this.gestisciTastoPremi);
            
            this.contenitoreFormNome.parentNode.removeChild(this.contenitoreFormNome);
        }
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }
        
        this.rimuoviElementiInput();
        
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
