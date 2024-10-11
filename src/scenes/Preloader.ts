import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
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
        this.load.image("bad", "bad.png");
        this.load.image("good", "good.png");
        this.load.image("keymouse", "keymouse.png");
        this.load.image("glass", "glass.png");
        this.load.image("score", "score.png");
        this.load.image("hp", "hp.png");
        this.load.image("helpbot", "helpbot.png");
        this.load.image("helpmouse", "helpmouse.png");

        this.load.audio("theme", ["sfx/squirf.mp3", "sfx/squirf.ogg"]);
        this.load.audio("laugh", "sfx/laugh.mp3");
        this.load.audio("ohno", "sfx/ohno.mp3");
        this.load.audio("punch", "sfx/punch.mp3");
        this.load.audio("happy", "sfx/happy.mp3");
        this.load.audio("splode", "sfx/rev-bleb.mp3");
        this.load.audio("yell", "sfx/yell-get.mp3");
        this.load.audio("exp", "sfx/exp.mp3");
        this.load.audio("exp2", "sfx/exp2.mp3");

        this.load.spritesheet("hit", "hit.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet("meta", "meta.png", {
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
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet("bot1", "bot1.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet("sidebot", "sidebot.png", {
            frameWidth: 128,
            frameHeight: 128,
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
            frameRate: 8,
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
            frameRate: 9,
            repeat: -1,
        });
        this.anims.create({
            key: "sidebot",
            frames: this.anims.generateFrameNumbers("sidebot", {
                start: 0,
                end: 9,
            }),
            frameRate: 9,
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
            key: "meta",
            frames: this.anims.generateFrameNumbers("meta"),
            frameRate: 30,
            repeat: -1,
        });
        this.scene.start("MainMenu");
    }
}
