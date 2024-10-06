import { Scene } from "phaser";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;

    score: number;

    constructor() {
        super("GameOver");
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.add.image(512, 300, "gameover");

        this.gameover_text = this.add.text(512, 384, this.score, {
            fontFamily: "Arial Black",
            fontSize: 64,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
            align: "center",
        });
        this.gameover_text.setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("MainMenu");
        });
        this.input.keyboard
            ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
            .once("down", () => {
                this.scene.start("MainMenu");
            });
    }
}
