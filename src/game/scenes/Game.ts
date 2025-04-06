import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { Pezzo } from '../items/Pezzo';
import { Cuore } from '../items/Cuore';
import { Coniglio } from '../items/Coniglio';
import { Tartaruga } from '../items/Tartaruga';
import { Fenice } from '../items/Fenice';

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    sfondo: Phaser.GameObjects.TileSprite;
    sfondono: Phaser.GameObjects.Image;
    testoGioco: Phaser.GameObjects.Text;
    suolo: Phaser.GameObjects.TileSprite;
    velocitaCorrente: number;
    cursori: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    Giocatore: Phaser.Physics.Arcade.Sprite;
    tasti: any;
    punteggio: number;
    testoPunteggio: Phaser.GameObjects.Text;
    vita: number;
    testoVita: Phaser.GameObjects.Text;
    casse: Phaser.Physics.Arcade.Group;
    private velocitaMassima: number;
    private intervalloIncremento: number;
    private punteggioTarget: number;
    private incrementoPunteggio: number;
    timerIncrementoPunteggio: Phaser.Time.TimerEvent;
    ostacolo: Phaser.Physics.Arcade.Group;
    tempoDiRigenerazione: number;
    nomeUtente: string;
    private animazioneCassaAttiva: boolean = false;
    private ultimoOstacoloX: number = 0;
    private distanzaMinima: number = 0;
    private difficoltaCorrente: number = 1;
    forestaSono: any;
    temaPrincipale: any;
    saltareAudio: any;
    danno: any;
    constructor() {
        super('Game');
        this.velocitaCorrente = 1;
        this.punteggio = 0;
        this.punteggioTarget = 0;
        this.incrementoPunteggio = 2;
        this.velocitaMassima = 5.0;
        this.intervalloIncremento = 5000;
        this.vita = 0;
        this.tempoDiRigenerazione = 0
    }

    preload() {
        this.load.image('sfondo', 'assets/sfondo.png');
        this.load.image('sfondono', 'assets/sfondo.png');
        this.load.spritesheet('suelo', 'assets/suolo.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('pezzo', 'assets/pezzo.png');
        this.load.image('cuore', 'assets/cuore.png');
        this.load.atlas('carattere', './assets/PersonaggioFoglioSprite.png', './assets/PersonaggioFoglio.json');
        this.load.spritesheet('trappola', 'assets/trappola_per_orsi.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image('coniglio', 'assets/coniglio.png');
        this.load.image('tartaruga', 'assets/tartaruga.png');

        this.load.image('crate', 'assets/cassa.png')
        this.load.audio('crate-sound', 'assets/audio/apertura_del_caso.m4a');
        this.load.audio('foresta', 'assets/audio/foresta.mp3');
        this.load.audio('temaPrincpale', 'assets/audio/temaPrincipale.mp3');
        this.load.audio('saltare', 'assets/audio/saltare.m4a');
        this.load.audio('danno', 'assets/audio/danno.m4a');

    }

    create() {
        this.casse = this.physics.add.group();
        this.nomeUtente = localStorage.getItem("playerName") || "";
        this.camera = this.cameras.main;
        this.ostacolo = this.physics.add.group();
        this.sfondo = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'sfondo');
        this.sfondo.setOrigin(0, 0);
        this.sfondo.setAlpha(0.5);



        this.forestaSono = this.sound.add('foresta', { loop: true, volume: 0.2 });
        this.forestaSono.play();
        
        this.temaPrincipale = this.sound.add('temaPrincpale', { loop: true, volume: 0.3 });
        this.temaPrincipale.play();

        this.saltareAudio = this.sound.add('saltare', { loop: false, volume: 0.5 });

        this.anims.create({
            key: "caratrappolaChiusa",
            frames: this.anims.generateFrameNumbers('trappola', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('carattere', { prefix: 'death', end: 4, zeroPad: 2 }),
            frameRate: 8,
        });

        this.suolo = this.add.tileSprite(
            0,
            this.cameras.main.height - 40,
            this.cameras.main.width,
            16,
            'suelo'
        );

        this.suolo.setOrigin(0, 0);
        this.suolo.setScale(3);

        this.Giocatore = this.physics.add.sprite(80, 200, 'carattere');
        this.physics.add.existing(this.suolo, true);

        this.Giocatore = this.physics.add.sprite(80, 200, 'carattere');


        this.physics.add.collider(this.Giocatore, this.suolo);
        this.Giocatore.setSize(62, 105);
        this.Giocatore.setOffset(16, 16);
        this.Giocatore.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.Giocatore.setBounce(0.3);
        this.Giocatore.setGravityY(800);

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('carattere', { prefix: 'run', end: 4, zeroPad: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('carattere', { prefix: 'jump', end: 3, zeroPad: 2 }),
            frameRate: 10,
        });

        // UI Punteggio
        this.add.image(15, 5, 'pezzo').setOrigin(0, 0).setScale(0.15);
        this.testoPunteggio = this.add.text(
            90,
            15,
            '0', {
            fontFamily: 'minecraft',
            fontSize: '52px',
            color: '#fff'
        });
        this.testoPunteggio.setScrollFactor(0);

        this.add.image(this.cameras.main.width - 175, 5, 'cuore').setOrigin(0, 0).setScale(0.2);
        this.testoVita = this.add.text(
            this.cameras.main.width - 75,
            10,
            '0', {
            fontFamily: 'minecraft',
            fontSize: '52px',
            color: '#fff'
        });
        this.testoVita.setScrollFactor(0);
        this.vita = 3;
        this.testoVita.setText('3');
        this.cursori = this.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;

        this.tasti = this.input.keyboard?.addKeys({
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            spaceBar: Phaser.Input.Keyboard.KeyCodes.SPACE,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            w: Phaser.Input.Keyboard.KeyCodes.W
        });

        this.Giocatore.play('run');

        // Timer punteggio
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.calcolaNuovoPunteggioTarget();
            },
            callbackScope: this,
            loop: true
        });

        this.timerIncrementoPunteggio = this.time.addEvent({
            delay: 100,
            callback: this.aggiornaDisplayPunteggio,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: this.intervalloIncremento,
            callback: this.aumentaVelocita,
            callbackScope: this,
            loop: true
        });
        this.cursori = this?.input?.keyboard?.createCursorKeys();


        this.time.addEvent({
            delay: 8000,
            callback: () => {
                // Cambia questo valore per spawn più o meno casuali
                if (Math.random() < 0.3) {
                    this.generaCassa();
                }

                const minRitardo = Math.max(4000, 8000 - (this.velocitaCorrente * 400));
                const maxRitardo = Math.max(7000, 12000 - (this.velocitaCorrente * 400));

                this.time.addEvent({
                    delay: Phaser.Math.Between(minRitardo, maxRitardo),
                    callback: this.generaCassa,
                    callbackScope: this,
                    loop: false
                });
            },
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(
            this.Giocatore,
            this.casse,
            this.collisioneGiocatoreCassa,
            undefined,
            this
        );

        this.inizializzaCollisione()
        this.uovoDiPasqua()
        EventBus.emit('current-scene-ready', this);

        this.ultimoOstacoloX = 0;
        this.distanzaMinima = 600;
        this.difficoltaCorrente = 1;
        
        this.time.addEvent({
            delay: 10000, 
            callback: this.aumentareDifficolta,
            callbackScope: this,
            loop: true
        });
    }

    uovoDiPasqua() {
        if (this.nomeUtente.toLocaleLowerCase() == "phoenix") {
            this.camera.setBackgroundColor(0xff0000);

            this.sfondono = this.add.image(512, 384, 'sfondono');
            this.sfondono.setAlpha(0.5);
        }
    }

    luogoOstacolo() {
        const distanzaNecessaria = this.distanzaMinima;
        const ultimaPosizione = this.ultimoOstacoloX;
        const posizioneCorrente = this.cameras.main.width;
        
        if (posizioneCorrente - ultimaPosizione < distanzaNecessaria) {
            return;
        }
        
        const probabilitaBase = 0.15; 
        const probabilitaAttuale = Math.min(probabilitaBase * this.difficoltaCorrente, 0.7);
        
        if (Math.random() > probabilitaAttuale) {
            return; 
        }
        
        const probabilitaDoppio = Math.min(0.1 * this.difficoltaCorrente, 0.5);
        const numeroPiege = Math.random() < probabilitaDoppio ? 2 : 1;
        
        this.creaPiege(this.cameras.main.width);
        
        if (numeroPiege === 2) {
            const distanzaTraPiege = 300 - (this.velocitaCorrente * 10);
            this.creaPiege(this.cameras.main.width + distanzaTraPiege);
        }
        
        this.ultimoOstacoloX = this.cameras.main.width + (numeroPiege === 2 ? 200 - (this.velocitaCorrente * 10) : 0);
        
        this.distanzaMinima = 600 - (this.velocitaCorrente * 50);
        this.distanzaMinima = Math.max(this.distanzaMinima, 300);
    }

    creaPiege(positionX: number) {
        const trappola = this.physics.add.sprite(
            positionX, 
            this.cameras.main.height - 57,
            'trappola'
        );
        
        trappola.setFrame(0);
        this.ostacolo.add(trappola);
        trappola.setScale(4);
        trappola.setSize(15, 5);

        trappola.setImmovable(true);
        trappola.body.setAllowGravity(false);
        trappola.setData('hasCollided', false);
    }

    collisioneTrappola(ostacolo: Phaser.Physics.Arcade.Sprite) {
        if (ostacolo.getData('hasCollided')) {
            return;
        }

        ostacolo.setData('hasCollided', true);

        ostacolo.play("caratrappolaChiusa", true);

        ostacolo.once('animationcomplete', () => {
            ostacolo.destroy();
        });

        if (this.Giocatore.getData('invincible')) {
            return;
        }

        this.danno.play();
        this.vita -= 1;
        this.testoVita.setText('' + this.vita);

        if (this.vita <= 0) {
            this.time.delayedCall(500, () => {
                this.cambiaScena();
            });
        }
    }
    inizializzaCollisione() {
        this.physics.add.overlap(
            this.ostacolo,
            this.Giocatore,
            (giocatore, ostacolo) => {
                this.collisioneTrappola(ostacolo as Phaser.Physics.Arcade.Sprite);
            }
        );
    }
    update(delta: number) {

        if (this.vita <= 0) {
            this.velocitaCorrente = 0;
            this.ostacolo.getChildren().forEach((child) => {
                (child as Phaser.Physics.Arcade.Sprite).setVelocity(0);
            });
            this.casse.getChildren().forEach((child) => {
                (child as Phaser.Physics.Arcade.Sprite).setVelocity(0);
            });
            this.physics.pause();

            this.time.delayedCall(1000, () => {
                this.scene.start('GameOver');
            });
        }

        Phaser.Actions.IncX(this.ostacolo.getChildren(), -this.velocitaCorrente * 3);

        if (this.ostacolo.getLength() > 0) {
            let ostacoloPiuLontano = 0;
            this.ostacolo.getChildren().forEach((child) => {
                const ostacolo = child as Phaser.Physics.Arcade.Sprite;
                if (ostacolo.x > ostacoloPiuLontano) {
                    ostacoloPiuLontano = ostacolo.x;
                }
            });
            
            if (ostacoloPiuLontano > 0) {
                this.ultimoOstacoloX = ostacoloPiuLontano;
            } else {
                this.ultimoOstacoloX = 0;
            }
        }

        this.tempoDiRigenerazione += delta;
        if (this.tempoDiRigenerazione >= 300) {
            this.tempoDiRigenerazione = 0;
        }

        this.sfondo.tilePositionX += this.velocitaCorrente;
        this.suolo.tilePositionX += this.velocitaCorrente;


        const giocatoreSulTerreno = this.Giocatore.body ? (this.Giocatore.body.touching.down || this.Giocatore.body.blocked.down) : false;
        if ((this.tasti?.spaceBar?.isDown || this.cursori?.space?.isDown || this.tasti?.z?.isDown || this.tasti?.w?.isDown || this.cursori?.up.isDown) && giocatoreSulTerreno) {
            this.saltareAudio.play();

            this.Giocatore.setVelocityY(-600);
            this.Giocatore.play('jump', true);
            this.time.delayedCall(500, () => {
                this.Giocatore.play('run', true);
            });
            this.Giocatore.setBounce(0);
        }

        if ((this.tasti?.s?.isDown || this.tasti?.down?.isDown) && !giocatoreSulTerreno) {
            this.Giocatore.setVelocityY(600);
            this.Giocatore.setBounce(0);
        }



        if (giocatoreSulTerreno && this.Giocatore.body && this.Giocatore.body.velocity.y === 0) {
            if (this.Giocatore.anims.currentAnim?.key !== 'run') {
                this.Giocatore.play('run', true);
            }
        }

        this.aggiornaCasse();

    }

    calcolaNuovoPunteggioTarget() {
        const bonusVelocita = Math.floor(this.velocitaCorrente * 100);
        this.punteggioTarget += 1 + bonusVelocita;
    }

    aggiornaDisplayPunteggio() {
        if (this.punteggio < this.punteggioTarget) {
            this.punteggio += this.incrementoPunteggio;

            if (this.punteggio > this.punteggioTarget) {
                this.punteggio = this.punteggioTarget;
            }

            this.testoPunteggio.setText('' + this.punteggio);
        }
    }

    cambiaScena() {
        this.Giocatore.play('death', true);

        this.time.delayedCall(5000, () => {
            this.scene.start('GameOver');
        });



        const infoGiocatore = JSON.stringify({
            name: this.nomeUtente,
            score: this.punteggio
        });

        let prossimoIndice = 1;
        while (localStorage.getItem(`playerInfo${prossimoIndice}`)) {
            prossimoIndice++;
        }

        localStorage.setItem(`playerInfo${prossimoIndice}`, infoGiocatore);


        this.velocitaCorrente = 0.5;
        this.punteggio = 0;
        this.punteggioTarget = 0;
        this.incrementoPunteggio = 2;
        this.vita = 3;
        this.tempoDiRigenerazione = 0;
    }

    private aumentaVelocita(): void {
        const valoreIncremento = 0.2;
        this.velocitaCorrente += valoreIncremento;

        if (this.velocitaCorrente > this.velocitaMassima) {
            this.velocitaCorrente = this.velocitaMassima;
        }
    }

    private generaCassa(): void {
        const y = Phaser.Math.Between(this.cameras.main.height - 325, this.cameras.main.height - 250);
        const cassa = this.casse.create(this.cameras.main.width + 100, y, 'crate');
        cassa.setOrigin(0, 0);
        cassa.setScale(3);

        cassa.setImmovable(true);
        cassa.body.allowGravity = false;
    }

    private aggiornaCasse(): void {
        this.casse.getChildren().forEach((child) => {
            const cassa = child as Phaser.Physics.Arcade.Sprite;

            cassa.x -= this.velocitaCorrente * 3;

            if (cassa.x < -cassa.displayWidth) {
                cassa.destroy();
            }
        });
    }

    private collisioneGiocatoreCassa(giocatore: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody, cassa: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody): void {
        (cassa as Phaser.Physics.Arcade.Sprite).destroy();

        const tipiBonusArr = [
            { name: 'pezzo', chance: 0.35, label: "Punti +", color: 0xFFD700, icon: 'pezzo' },
            { name: 'cuore', chance: 0.25, label: "Vite +", color: 0xFF0000, icon: 'cuore' },
            { name: 'coniglio', chance: 0.20, label: "Velocità +", color: 0x00FF00, icon: 'coniglio' },
            { name: 'tartaruga', chance: 0.15, label: "Velocità -", color: 0x0000FF, icon: 'tartaruga' },
            { name: 'fenice', chance: 0.05, label: "Invincibile!", color: 0xFF00FF, icon: 'fenice' }
        ];

        const probabilitaTotale = tipiBonusArr.reduce((sum, type) => sum + type.chance, 0);
        let tipiBonusNormalizzati = tipiBonusArr.map(type => ({
            ...type,
            chance: type.chance / probabilitaTotale
        }));

        const valoreCasuale = Math.random();
        let probabilitaCumulativa = 0;
        let bonusSelezionato = null;

        for (const tipoBonus of tipiBonusNormalizzati) {
            probabilitaCumulativa += tipoBonus.chance;
            if (valoreCasuale <= probabilitaCumulativa) {
                bonusSelezionato = tipoBonus;
                break;
            }
        }

        if (bonusSelezionato) {
            this.mostraAnimazioneCassa(bonusSelezionato);
        }
    }

    private mostraAnimazioneCassa(bonusSelezionato: any): void {
        if (this.animazioneCassaAttiva) {
            return;
        }

        this.animazioneCassaAttiva = true;

        const centroX = this.cameras.main.width / 2;
        const centroY = this.cameras.main.height / 3;

        const dimensioneCassa = 150;
        const boxOggetto = this.add.rectangle(
            centroX,
            centroY,
            dimensioneCassa,
            dimensioneCassa,
            0xFFFFFF,
            0
        ).setOrigin(0.5);

        const puntoInterrogativo = this.add.text(
            centroX,
            centroY,
            '?',
            {
                fontFamily: 'minecraft',
                fontSize: '80px',
                color: '#000000'
            }
        ).setOrigin(0.5).setDepth(100);

        boxOggetto.setDepth(98);

        const tuttiTipiBonus = [
            { name: 'pezzo', label: "Punti +", color: 0xFFD700 },
            { name: 'cuore', label: "Vite +", color: 0xFF0000 },
            { name: 'coniglio', label: "Velocità +", color: 0x00FF00 },
            { name: 'tartaruga', label: "Velocità -", color: 0x0000FF },
            { name: 'fenice', label: "Invincibile!", color: 0xFF00FF }
        ];

        const dimensioneIcona = 60;
        const iconaBonus = this.add.image(centroX, centroY, 'pezzo')
            .setVisible(false)
            .setOrigin(0.5)
            .setDepth(100)
            .setScale(dimensioneIcona / 150);

        let indiceCorrente = 0;
        const velocitaCiclo = 100;
        const tempoRotazione = 2000; 
        const massimiCicli = Math.floor(tempoRotazione / velocitaCiclo);
        let cicloCorrente = 0;

        this.sound.play('crate-sound', { volume: 0.7 });
        this.time.delayedCall(500, () => {
            puntoInterrogativo.destroy();
            iconaBonus.setVisible(true);

            const intervalloGiratorio = this.time.addEvent({
                delay: velocitaCiclo,
                callback: () => {
                    indiceCorrente = (indiceCorrente + 1) % tuttiTipiBonus.length;
                    cicloCorrente++;

                    iconaBonus.setTexture(tuttiTipiBonus[indiceCorrente].name);

                    if (tuttiTipiBonus[indiceCorrente].name === 'fenice') {
                        iconaBonus.setScale((dimensioneIcona / 150) * 10);
                    } else {
                        iconaBonus.setScale(dimensioneIcona / 150);
                    }

                    if (cicloCorrente >= massimiCicli && tuttiTipiBonus[indiceCorrente].name === bonusSelezionato.name) {
                        intervalloGiratorio.destroy();

                        this.tweens.add({
                            targets: [boxOggetto],
                            alpha: 0.2,
                            yoyo: true,
                            repeat: 3,
                            duration: 200,
                            onComplete: () => {
                                const testoBonus = this.add.text(
                                    centroX,
                                    centroY + dimensioneCassa / 2 + 30,
                                    bonusSelezionato.label,
                                    {
                                        fontFamily: 'minecraft',
                                        fontSize: '32px',
                                        color: '#ffffff',
                                        stroke: '#000000',
                                        strokeThickness: 6
                                    }
                                ).setOrigin(0.5).setDepth(100);

                                this.time.delayedCall(1200, () => {
                                    this.tweens.add({
                                        targets: [boxOggetto, iconaBonus, testoBonus],
                                        alpha: 0,
                                        scale: 1.5,
                                        duration: 500,
                                        onComplete: () => {
                                            boxOggetto.destroy();
                                            iconaBonus.destroy();
                                            testoBonus.destroy();

                                            this.applicaBonus(bonusSelezionato);

                                            this.animazioneCassaAttiva = false;
                                        }
                                    });
                                });
                            }
                        });
                    }
                },
                callbackScope: this,
                loop: true
            });
        });
    }

    private applicaBonus(bonusSelezionato: any): void {
        switch (bonusSelezionato.name) {
            case 'pezzo':
                const BonusPezzo = new Pezzo({
                    velocitaAttuale: this.velocitaCorrente,
                    aggiornaPunteggio: this.punteggio
                });

                const nuovoPunteggio = BonusPezzo.inizia();

                this.punteggio = nuovoPunteggio;
                this.punteggioTarget = nuovoPunteggio;
                this.testoPunteggio.setText('' + this.punteggio);
                break;

            case 'cuore':
                const bonusCuore = new Cuore({
                    cuore: this.vita
                });

                const nuovaVita = bonusCuore.inizia();

                this.vita = nuovaVita;

                if (this.vita >= 10) {
                    this.vita = 9999;
                    this.testoVita.setText('∞');
                    this.testoVita.setPosition(this.cameras.main.width - 80, 8);
                } else {
                    this.testoVita.setText('' + this.vita);
                }
                break;

            case 'coniglio':
                const istanzaConiglio = new Coniglio({
                    giocoVelocita: this.velocitaCorrente
                });

                const velocitaOriginale = this.velocitaCorrente;
                this.velocitaCorrente = istanzaConiglio.inizia();

                this.time.delayedCall(5000, () => {
                    this.velocitaCorrente = velocitaOriginale;
                }, [], this);
                break;

            case 'tartaruga':
                const BonusTartaruga = new Tartaruga({
                    velocitaAttuale: this.velocitaCorrente,
                });

                const velocitaPrecedente = this.velocitaCorrente;
                const nuovaVelocita = BonusTartaruga.inizia();

                this.velocitaCorrente = nuovaVelocita;

                if (this.velocitaCorrente !== velocitaPrecedente) {
                    this.time.delayedCall(10000, () => {
                        this.velocitaCorrente = velocitaPrecedente;
                    }, [], this);
                }
                break;

            case 'fenice':
                const BonusFenice = new Fenice({
                    scene: this,
                    player: this.Giocatore
                });

                BonusFenice.attivaInvincibilita();
                break;
        }
    }

    private aumentareDifficolta(): void {
        this.difficoltaCorrente += 0.2;
        if (this.difficoltaCorrente > 5) {
            this.difficoltaCorrente = 5;
        }
    }
}