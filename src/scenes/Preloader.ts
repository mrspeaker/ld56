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
        this.load.spritesheet("walk", "sheet.png", {
            frameWidth: 64 * 1,
            frameHeight: 64 * 1,
        });
    }

    create() {
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("walk", {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.start("MainMenu");
    }
}
