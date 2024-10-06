import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        this.add.image(512, 384, "background");
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
        this.load.on("progress", (progress: number) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("gameover", "gameover.png");
        this.load.spritesheet("hit", "hit.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet("blerb", "blerb.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet("blerb2", "blerb2.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet("drop", "drop.png", {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet("bot1", "bot1.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet("mol", "mol.png", {
            frameWidth: 512,
            frameHeight: 512 * (9 / 16),
        });
    }

    create() {
        this.anims.create({
            key: "hit",
            frames: this.anims.generateFrameNumbers("hit"),
            frameRate: 30,
            repeat: 0,
        });

        this.anims.create({
            key: "blerb",
            frames: this.anims.generateFrameNumbers("blerb"),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "blerb2",
            frames: this.anims.generateFrameNumbers("blerb2"),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "drop",
            frames: this.anims.generateFrameNumbers("drop"),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: "bot1",
            frames: this.anims.generateFrameNumbers("bot1", {
                start: 0,
                end: 9,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "bot1_die",
            frames: this.anims.generateFrameNumbers("bot1", {
                start: 10,
                end: 19,
            }),
            frameRate: 20,
            repeat: 0,
        });
        this.anims.create({
            key: "mol",
            frames: this.anims.generateFrameNumbers("mol"),
            frameRate: 3,
            repeat: -1,
        });
        this.scene.start("MainMenu");
    }
}
