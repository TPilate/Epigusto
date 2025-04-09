import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { Pezzo } from '../items/Pezzo';
import { Cuore } from '../items/Cuore';
import { Coniglio } from '../items/Coniglio';
import { Tartaruga } from '../items/Tartaruga';
import { Fenice } from '../items/Fenice';

export class Game extends Phaser.Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    backgroundTexture: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    ground: Phaser.GameObjects.TileSprite;
    currentSpeed: number;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    Player: Phaser.Physics.Arcade.Sprite;
    keys: any;
    score: number;
    scoreText: Phaser.GameObjects.Text;
    health: number;
    healthText: Phaser.GameObjects.Text;
    crates: Phaser.Physics.Arcade.Group;
    coins: Phaser.Physics.Arcade.Group;
    private maxSpeed: number;
    private incrementInterval: number;
    private targetScore: number;
    private scoreIncrement: number;
    scoreIncrementTimer: Phaser.Time.TimerEvent;
    obstacle: Phaser.Physics.Arcade.Group;
    regenerationTime: number;
    userName: string;
    private crateAnimationActive: boolean = false;
    private lastObstacleX: number = 0;
    private minDistance: number = 0;
    private currentDifficulty: number = 1;
    forestSound: any;
    mainTheme: any;
    jumpAudio: any;
    damage: any;
    deathTheme: any;
    coinSound: any;
    groundCollision: Phaser.Physics.Arcade.StaticBody;

    constructor() {
        super('Game');
        this.currentSpeed = 1;
        this.score = 0;
        this.targetScore = 0;
        this.scoreIncrement = 2;
        this.maxSpeed = 5.0;
        this.incrementInterval = 5000;
        this.health = 0;
        this.regenerationTime = 0;
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('backgroundTexture', 'assets/background.png');
        this.load.spritesheet('ground', 'assets/ground.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('coin', 'assets/piece.png');
        this.load.image('heart', 'assets/heart.png');
        this.load.atlas('character', './assets/CharacterSheetSprite.png', './assets/CharacterSheet.json');
        this.load.atlas('coinAnim', './assets/coinsAnim.png', './assets/coinsAnim.json');

        this.load.spritesheet('trap', 'assets/trap_for_paths.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image('rabbit', 'assets/rabbit.png');
        this.load.image('turtle', 'assets/turtle.png');

        this.load.image('crate', 'assets/case.png');
        this.load.audio('crate-sound', 'assets/audio/case_opening.m4a');
        this.load.audio('forest', 'assets/audio/forest.mp3');
        this.load.audio('mainTheme', 'assets/audio/themePrincipal.mp3');
        this.load.audio('jump', 'assets/audio/jump.m4a');
        this.load.audio('damage', 'assets/audio/damage.m4a');
        this.load.audio('deathTheme', 'assets/audio/themeDeath.m4a');
        this.load.audio('coinSound', 'assets/audio/coins.m4a');
    }

    create() {
        this.currentSpeed = 1;
        this.score = 0;
        this.targetScore = 0;
        this.scoreIncrement = 2;
        this.health = 3;
        this.regenerationTime = 0;
        this.crateAnimationActive = false;

        this.crates = this.physics.add.group();
        this.userName = localStorage.getItem("playerName") || "";
        this.camera = this.cameras.main;
        this.obstacle = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.obstacle = this.physics.add.group();
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background');
        this.background.setOrigin(0, 0);
        this.background.setAlpha(0.5);

        this.forestSound = this.sound.add('forest', { loop: true, volume: 0.2 });
        this.forestSound.play();

        this.mainTheme = this.sound.add('mainTheme', { loop: true, volume: 0.3 });
        this.mainTheme.play();

        this.jumpAudio = this.sound.add('jump', { loop: false, volume: 0.5 });
        this.damage = this.sound.add('damage', { loop: false, volume: 4 });
        this.deathTheme = this.sound.add('deathTheme', { loop: false, volume: 0.6 });
        this.coinSound = this.sound.add('coinSound', { volume: 0.2 });

        this.anims.create({
            key: "trapClosing",
            frames: this.anims.generateFrameNumbers('trap', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('character', { prefix: 'death', end: 4, zeroPad: 2 }),
            frameRate: 8,
        });

        this.anims.create({
            key: 'rotate',
            frames: this.anims.generateFrameNames('coinAnim', { prefix: 'coin', end: 8, zeroPad: 2 }),
            frameRate: 8,
        });

        this.ground = this.add.tileSprite(
            0,
            this.cameras.main.height - 40,
            this.cameras.main.width,
            16,
            'ground'
        );

        this.ground.setOrigin(0, 0);
        this.ground.setScale(3);

        this.Player = this.physics.add.sprite(80, 200, 'character');
        this.physics.add.existing(this.ground, true);

        this.Player = this.physics.add.sprite(80, 200, 'character');

        this.physics.add.collider(this.Player, this.ground);
        this.Player.setSize(62, 105);
        this.Player.setOffset(16, 16);
        this.Player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.Player.setBounce(0.3);
        this.Player.setGravityY(800);

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('character', { prefix: 'run', end: 4, zeroPad: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('character', { prefix: 'jump', end: 3, zeroPad: 2 }),
            frameRate: 10,
        });

        // UI Score
        this.add.image(15, 5, 'coin').setOrigin(0, 0).setScale(0.15);
        this.scoreText = this.add.text(
            90,
            15,
            '0', {
            fontFamily: 'minecraft',
            fontSize: '52px',
            color: '#fff'
        });
        this.scoreText.setScrollFactor(0);

        this.add.image(this.cameras.main.width - 175, 5, 'heart').setOrigin(0, 0).setScale(0.2);
        this.healthText = this.add.text(
            this.cameras.main.width - 75,
            10,
            '0', {
            fontFamily: 'minecraft',
            fontSize: '52px',
            color: '#fff'
        });
        this.healthText.setScrollFactor(0);
        this.health = 3;
        this.healthText.setText('3');
        this.cursors = this.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;

        this.keys = this.input.keyboard?.addKeys({
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            spaceBar: Phaser.Input.Keyboard.KeyCodes.SPACE,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            w: Phaser.Input.Keyboard.KeyCodes.W
        });

        this.Player.play('run');

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.calculateNewTargetScore();
            },
            callbackScope: this,
            loop: true
        });

        this.scoreIncrementTimer = this.time.addEvent({
            delay: 100,
            callback: this.updateScoreDisplay,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: this.incrementInterval,
            callback: this.increaseSpeed,
            callbackScope: this,
            loop: true
        });
        this.cursors = this?.input?.keyboard?.createCursorKeys();

        this.time.addEvent({
            delay: 8000,
            callback: () => {

                if (Math.random() < 0.3) {
                    this.generateCrate();
                }

                const minDelay = Math.max(4000, 8000 - (this.currentSpeed * 400));
                const maxDelay = Math.max(7000, 12000 - (this.currentSpeed * 400));

                this.time.addEvent({
                    delay: Phaser.Math.Between(minDelay, maxDelay),
                    callback: this.generateCrate,
                    callbackScope: this,
                    loop: false
                });
            },
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(
            this.Player,
            this.crates,
            this.playerCrateCollision,
            undefined,
            this
        );

        this.initializeCollision();
        this.easterEgg();
        EventBus.emit('current-scene-ready', this);

        this.lastObstacleX = 0;
        this.minDistance = 600;
        this.currentDifficulty = 1;

        this.time.addEvent({
            delay: 10000,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 950,
            callback: this.generateRandomCoins,
            callbackScope: this,
            loop: true
        });

        this.groundCollision = this.physics.add.staticBody(0, this.cameras.main.height - 30, this.cameras.main.width, 20);
        this.physics.add.collider(this.Player, this.groundCollision);
    }

    easterEgg() {
        if (this.userName.toLocaleLowerCase() == "phoenix") {
            this.camera.setBackgroundColor(0xff0000);

            this.backgroundTexture = this.add.image(512, 384, 'backgroundTexture');
            this.backgroundTexture.setAlpha(0.5);
        }
    }

    placeObstacle() {
        const requiredDistance = this.minDistance;
        const lastPosition = this.lastObstacleX;
        const currentPosition = this.cameras.main.width;

        if (currentPosition - lastPosition < requiredDistance) {
            return;
        }

        const baseProbability = 0.15;
        const currentProbability = Math.min(baseProbability * this.currentDifficulty, 0.7);

        if (Math.random() > currentProbability) {
            return;
        }

        const doubleProbability = Math.min(0.1 * this.currentDifficulty, 0.5);
        const numTraps = Math.random() < doubleProbability ? 2 : 1;

        this.createTrap(this.cameras.main.width);

        if (numTraps === 2) {
            const distanceBetweenTraps = 300 - (this.currentSpeed * 10);
            this.createTrap(this.cameras.main.width + distanceBetweenTraps);
        }

        this.lastObstacleX = this.cameras.main.width + (numTraps === 2 ? 200 - (this.currentSpeed * 10) : 0);

        this.minDistance = 600 - (this.currentSpeed * 50);
        this.minDistance = Math.max(this.minDistance, 300);
    }

    createTrap(positionX: number) {
        const trap = this.physics.add.sprite(
            positionX,
            this.cameras.main.height - 57,
            'trap'
        );

        trap.setFrame(0);
        this.obstacle.add(trap);
        trap.setScale(4);
        trap.setSize(15, 5);

        trap.setImmovable(true);
        trap.body.setAllowGravity(false);
        trap.setData('hasHit', false);

        if (Math.random() < 0.4) {
            this.createCoin(positionX);
        }
    }

    createCoin(positionX: number, positionY?: number): void {
        const coin = this.physics.add.sprite(
            positionX,
            positionY || this.cameras.main.height - 57 - Phaser.Math.Between(50, 200),
            'coinAnim'
        );

        coin.play('rotate', true);
        this.coins.add(coin);
        coin.setScale(0.3);
        coin.setSize(50, 50);

        coin.setImmovable(true);
        coin.body.setAllowGravity(false);

        if (coin.body) {
            (coin.body as Phaser.Physics.Arcade.Body).checkCollision.up = false;
            (coin.body as Phaser.Physics.Arcade.Body).checkCollision.down = false;
            (coin.body as Phaser.Physics.Arcade.Body).checkCollision.left = false;
            (coin.body as Phaser.Physics.Arcade.Body).checkCollision.right = false;
        }

        coin.setData('collected', false);
    }

    trapCollision(obstacle: Phaser.Physics.Arcade.Sprite) {
        if (obstacle.getData('hasCollided')) {
            return;
        }

        obstacle.setData('hasCollided', true);

        obstacle.play("trapClosing", true);

        obstacle.once('animationcomplete', () => {
            obstacle.destroy();
        });

        if (this.Player.getData('invincible')) {
            return;
        }

        this.damage.play();
        this.health -= 1;
        this.healthText.setText('' + this.health);

        if (this.health <= 0) {
            this.time.delayedCall(500, () => {
                this.changeScene();
            });
        }
    }

    coinCollision(player: Phaser.Physics.Arcade.Sprite, coin: Phaser.Physics.Arcade.Sprite) {
        if (coin.getData('collected')) {
            return;
        }

        coin.setData('collected', true);

        // Play sound effect
        this.coinSound.play();

        // Add points
        this.score += 50;
        this.targetScore = this.score;
        this.scoreText.setText('' + this.score);

        this.tweens.add({
            targets: coin,
            y: coin.y - 50,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => {
                coin.destroy();
            }
        });
    }

    initializeCollision() {
        this.physics.add.overlap(
            this.Player,
            this.obstacle,
            (player, obstacle) => {
                this.trapCollision(obstacle as Phaser.Physics.Arcade.Sprite);
            }
        );

        this.physics.add.overlap(
            this.Player,
            this.coins,
            (player, coin) => {
                this.coinCollision(player as Phaser.Physics.Arcade.Sprite, coin as Phaser.Physics.Arcade.Sprite);
            }
        );
    }

    update(delta: number) {

        if (this.health <= 0) {
            this.currentSpeed = 0;
            this.obstacle.getChildren().forEach((child) => {
                (child as Phaser.Physics.Arcade.Sprite).setVelocity(0);
            });
            this.crates.getChildren().forEach((child) => {
                (child as Phaser.Physics.Arcade.Sprite).setVelocity(0);
            });
            this.physics.pause();

            this.time.delayedCall(1000, () => {
                this.scene.start('GameOver');
            });
        }

        Phaser.Actions.IncX(this.obstacle.getChildren(), -this.currentSpeed * 3);

        if (this.obstacle.getLength() > 0) {
            let furthestObstacle = 0;
            this.obstacle.getChildren().forEach((child) => {
                const obstacle = child as Phaser.Physics.Arcade.Sprite;
                if (obstacle.x > furthestObstacle) {
                    furthestObstacle = obstacle.x;
                }
            });

            if (furthestObstacle > 0) {
                this.lastObstacleX = furthestObstacle;
            } else {
                this.lastObstacleX = 0;
            }
        }

        this.regenerationTime += delta;
        if (this.regenerationTime >= 300) {
            this.placeObstacle();
            this.regenerationTime = 0;
        }

        this.background.tilePositionX += this.currentSpeed;
        this.ground.tilePositionX += this.currentSpeed;

        const playerOnGround = this.Player.body ? (this.Player.body.touching.down || this.Player.body.blocked.down) : false;
        if ((this.keys?.spaceBar?.isDown || this.cursors?.space?.isDown || this.keys?.z?.isDown || this.keys?.w?.isDown || this.cursors?.up.isDown) && playerOnGround) {
            this.jumpAudio.play();

            this.Player.setVelocityY(-600);
            this.Player.play('jump', true);
            this.time.delayedCall(500, () => {
                this.Player.play('run', true);
            });
            this.Player.setBounce(0);
        }

        if ((this.keys?.s?.isDown || this.keys?.down?.isDown) && !playerOnGround) {
            this.Player.setVelocityY(600);
            this.Player.setBounce(0);
        }

        if (playerOnGround && this.Player.body && this.Player.body.velocity.y === 0) {
            if (this.Player.anims.currentAnim?.key !== 'run') {
                this.Player.play('run', true);
            }
        }

        this.updateCrates();

        this.updateCoins();

        // Cleaning coins that go off-screen (to add after updateCrates())
        this.coins.getChildren().forEach((child) => {
            const coin = child as Phaser.Physics.Arcade.Sprite;
            if (coin.x < -coin.displayWidth) {
                coin.destroy();
            }
        });
    }

    calculateNewTargetScore() {
        const speedBonus = Math.floor(this.currentSpeed * 100);
        this.targetScore += 1 + speedBonus;
    }

    updateScoreDisplay() {
        if (this.score < this.targetScore) {
            this.score += this.scoreIncrement;

            if (this.score > this.targetScore) {
                this.score = this.targetScore;
            }

            this.scoreText.setText('' + this.score);
        }
    }

    changeScene() {
        this.Player.play('death', true);
        this.forestSound.stop();
        this.mainTheme.stop();
        this.deathTheme.play();

        // Save the score
        const playerInfo = JSON.stringify({
            name: this.userName,
            score: this.score
        });

        let nextIndex = 1;
        while (localStorage.getItem(`playerInfo${nextIndex}`)) {
            nextIndex++;
        }

        localStorage.setItem(`playerInfo${nextIndex}`, playerInfo);

        this.time.delayedCall(5000, () => {
            this.scene.start('GameOver');
        });
    }

    private increaseSpeed(): void {
        const incrementValue = 0.2;
        this.currentSpeed += incrementValue;

        if (this.currentSpeed > this.maxSpeed) {
            this.currentSpeed = this.maxSpeed;
        }
    }

    private generateCrate(): void {
        const y = Phaser.Math.Between(this.cameras.main.height - 325, this.cameras.main.height - 250);
        const crate = this.crates.create(this.cameras.main.width + 100, y, 'crate');
        crate.setOrigin(0, 0);
        crate.setScale(0.3);

        // Set collision body properties for the crate
        crate.body.setSize(crate.width * 0.8, crate.height * 0.8);
        crate.body.setOffset(crate.width * 0.1, crate.height * 0.1);

        // Add visual depth and shadow effect
        crate.setDepth(5);
        this.tweens.add({
            targets: crate,
            y: y + 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        crate.setImmovable(true);
        crate.body.allowGravity = false;

        if (crate.body) {
            (crate.body as Phaser.Physics.Arcade.Body).checkCollision.up = false;
            (crate.body as Phaser.Physics.Arcade.Body).checkCollision.down = false;
            (crate.body as Phaser.Physics.Arcade.Body).checkCollision.left = false;
            (crate.body as Phaser.Physics.Arcade.Body).checkCollision.right = false;
        }
    }

    private updateCrates(): void {
        this.crates.getChildren().forEach((child) => {
            const crate = child as Phaser.Physics.Arcade.Sprite;

            crate.x -= this.currentSpeed * 3;

            if (crate.x < -crate.displayWidth) {
                crate.destroy();
            }
        });
    }

    private updateCoins(): void {
        this.coins.getChildren().forEach((child) => {
            const coin = child as Phaser.Physics.Arcade.Sprite;
            coin.x -= this.currentSpeed * 3; // Same speed as obstacles

            if (coin.x < -coin.displayWidth) {
                coin.destroy();
            }
        });
    }

    private playerCrateCollision(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody, crate: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody): void {
        (crate as Phaser.Physics.Arcade.Sprite).destroy();

        const bonusTypesArr = [
            { name: 'coin', chance: 0.35, label: "Points +", color: 0xFFD700, icon: 'coin' },
            { name: 'heart', chance: 0.25, label: "Lives +", color: 0xFF0000, icon: 'heart' },
            { name: 'rabbit', chance: 0.20, label: "Speed +", color: 0x00FF00, icon: 'rabbit' },
            { name: 'turtle', chance: 0.15, label: "Speed -", color: 0x0000FF, icon: 'turtle' },
            { name: 'phoenix', chance: 0.05, label: "Invincible!", color: 0xFF00FF, icon: 'phoenix' }
        ];

        const totalProbability = bonusTypesArr.reduce((sum, type) => sum + type.chance, 0);
        let normalizedBonusTypes = bonusTypesArr.map(type => ({
            ...type,
            chance: type.chance / totalProbability
        }));

        const randomValue = Math.random();
        let cumulativeProbability = 0;
        let selectedBonus = null;

        for (const bonusType of normalizedBonusTypes) {
            cumulativeProbability += bonusType.chance;
            if (randomValue <= cumulativeProbability) {
                selectedBonus = bonusType;
                break;
            }
        }

        if (selectedBonus) {
            this.showCrateAnimation(selectedBonus);
        }
    }

    private showCrateAnimation(selectedBonus: any): void {
        if (this.crateAnimationActive) {
            return;
        }

        this.crateAnimationActive = true;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 3;

        const crateSize = 150;
        const itemBox = this.add.rectangle(
            centerX,
            centerY,
            crateSize,
            crateSize,
            0xFFFFFF,
            0
        ).setOrigin(0.5);

        const questionMark = this.add.text(
            centerX,
            centerY,
            '?',
            {
                fontFamily: 'minecraft',
                fontSize: '80px',
                color: '#000000'
            }
        ).setOrigin(0.5).setDepth(100);

        itemBox.setDepth(98);

        const allBonusTypes = [
            { name: 'coin', label: "Points +", color: 0xFFD700 },
            { name: 'heart', label: "Lives +", color: 0xFF0000 },
            { name: 'rabbit', label: "Speed +", color: 0x00FF00 },
            { name: 'turtle', label: "Speed -", color: 0x0000FF },
            { name: 'phoenix', label: "Invincible!", color: 0xFF00FF }
        ];

        const iconSize = 60;
        const bonusIcon = this.add.image(centerX, centerY, 'coin')
            .setVisible(false)
            .setOrigin(0.5)
            .setDepth(100)
            .setScale(iconSize / 150);

        let currentIndex = 0;
        const cycleSpeed = 100;
        const rotationTime = 2000;
        const maxCycles = Math.floor(rotationTime / cycleSpeed);
        let currentCycle = 0;

        this.sound.play('crate-sound', { volume: 0.7 });
        this.time.delayedCall(500, () => {
            questionMark.destroy();
            bonusIcon.setVisible(true);

            const spinInterval = this.time.addEvent({
                delay: cycleSpeed,
                callback: () => {
                    currentIndex = (currentIndex + 1) % allBonusTypes.length;
                    currentCycle++;

                    bonusIcon.setTexture(allBonusTypes[currentIndex].name);

                    if (allBonusTypes[currentIndex].name === 'phoenix') {
                        bonusIcon.setScale((iconSize / 150) * 10);
                    } else {
                        bonusIcon.setScale(iconSize / 150);
                    }

                    if (currentCycle >= maxCycles && allBonusTypes[currentIndex].name === selectedBonus.name) {
                        spinInterval.destroy();

                        this.tweens.add({
                            targets: [itemBox],
                            alpha: 0.2,
                            yoyo: true,
                            repeat: 3,
                            duration: 200,
                            onComplete: () => {
                                const bonusText = this.add.text(
                                    centerX,
                                    centerY + crateSize / 2 + 30,
                                    selectedBonus.label,
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
                                        targets: [itemBox, bonusIcon, bonusText],
                                        alpha: 0,
                                        scale: 1.5,
                                        duration: 500,
                                        onComplete: () => {
                                            itemBox.destroy();
                                            bonusIcon.destroy();
                                            bonusText.destroy();

                                            this.applyBonus(selectedBonus);

                                            this.crateAnimationActive = false;
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

    private applyBonus(selectedBonus: any): void {
        switch (selectedBonus.name) {
            case 'coin':
                const coinBonus = new Pezzo({
                    velocitaAttuale: this.currentSpeed,
                    aggiornaPunteggio: this.score
                });

                const newScore = coinBonus.inizia();

                this.score = newScore;
                this.targetScore = newScore;
                this.scoreText.setText('' + this.score);
                break;

            case 'heart':
                const heartBonus = new Cuore({
                    cuore: this.health
                });

                const newHealth = heartBonus.inizia();

                this.health = newHealth;

                if (this.health >= 10) {
                    this.health = 9999;
                    this.healthText.setText('∞');
                    this.healthText.setPosition(this.cameras.main.width - 80, 8);
                } else {
                    this.healthText.setText('' + this.health);
                }
                break;

            case 'rabbit':
                const rabbitInstance = new Coniglio({
                    giocoVelocita: this.currentSpeed
                });

                const originalSpeed = this.currentSpeed;
                this.currentSpeed = rabbitInstance.inizia();

                this.time.delayedCall(5000, () => {
                    this.currentSpeed = originalSpeed;
                }, [], this);
                break;

            case 'turtle':
                const turtleBonus = new Tartaruga({
                    velocitaAttuale: this.currentSpeed,
                });

                const previousSpeed = this.currentSpeed;
                const newSpeed = turtleBonus.inizia();

                this.currentSpeed = newSpeed;

                if (this.currentSpeed !== previousSpeed) {
                    this.time.delayedCall(10000, () => {
                        this.currentSpeed = previousSpeed;
                    }, [], this);
                }
                break;

            case 'phoenix':
                const phoenixBonus = new Fenice({
                    scene: this,
                    player: this.Player
                });

                phoenixBonus.attivaInvincibilita();
                break;
        }
    }

    private increaseDifficulty(): void {
        this.currentDifficulty += 0.2;
        if (this.currentDifficulty > 5) {
            this.currentDifficulty = 5;
        }
    }

    private generateRandomCoins(): void {
        if (Math.random() < 0.9) {
            const numCoins = Phaser.Math.Between(2, 5);

            const startX = this.cameras.main.width + 50;

            const minHeight = 80;
            const maxHeight = 350;
            const height = Phaser.Math.Between(minHeight, maxHeight);
            const y = this.cameras.main.height - height;

            const formationType = Math.random();

            if (formationType < 0.25) {
                for (let i = 0; i < numCoins; i++) {
                    this.createCoin(startX + (i * 40), y);
                }
            } else if (formationType < 0.5) {
                for (let i = 0; i < numCoins; i++) {
                    this.createCoin(startX, y - (i * 40));
                }
            } else if (formationType < 0.75) {
                for (let i = 0; i < numCoins; i++) {
                    this.createCoin(startX + (i * 40), y - (i * 40));
                }
            } else if (Math.random() < 0.2) {
                const y = this.cameras.main.height - Phaser.Math.Between(100, 250);
                const numCoins = Phaser.Math.Between(8, 15); // Long row

                for (let i = 0; i < numCoins; i++) {
                    this.createCoin(this.cameras.main.width + 50 + (i * 30), y);
                }
            } else {
                const radius = 50;
                for (let i = 0; i < numCoins; i++) {
                    const angle = (i / numCoins) * Math.PI * 2;
                    const offsetX = Math.cos(angle) * radius;
                    const offsetY = Math.sin(angle) * radius;
                    this.createCoin(startX + offsetX, y + offsetY);
                }
            }
        }
    }
}