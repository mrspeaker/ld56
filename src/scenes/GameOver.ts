import { Scene } from "phaser";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;

    score: number;
    whacks_good: number;
    whacks_bad: number;
    whacks_missed: number;
    cells_killed: number;
    cells_escaped: number;

    cooldown: number;

    constructor() {
        super("GameOver");
    }

    init(data) {
        this.score = data.score;
        this.whacks_good = data.whacks_good;
        this.whacks_bad = data.whacks_bad;
        this.whacks_missed = data.whacks_missed;
        this.cells_killed = data.cells_killed;
        this.cells_escaped = data.cells_escaped;
        this.cooldown = 100;
    }

    update() {
        this.cooldown--;
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.sound.add("laugh", { volume: 1 }).play();

        this.add.image(512, 300, "gameover");

        const font = {
            fontFamily: "Arial Black",
            fontSize: 64,
            color: "#ffffff",
            align: "center",
        };

        this.gameover_text = this.add.text(512, 398, this.score, font);
        this.gameover_text.setOrigin(0.5);

        const perc = this.whacks_good / (this.whacks_good + this.whacks_missed);
        this.stats = this.add.text(
            750,
            400,
            `bots destroyed: ${Math.round(perc * 100)}%
good guys killed: ${this.whacks_bad}
cells destroyed: ${this.cells_killed}`,
            { ...font, fontSize: 24 },
        );

        this.input.on("pointerdown", () => {
            if (this.cooldown <= 0) {
                this.scene.start("MainMenu");
            }
        });
        this.input.keyboard
            ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
            .on("down", () => {
                if (this.cooldown <= 0) {
                    this.scene.start("MainMenu");
                }
            });
    }
}
