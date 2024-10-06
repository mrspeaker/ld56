import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        //        this.background = this.add.image(512, 384, "background");

        this.logo = this.add.image(512, 300, "logo");

        /*this.title = this.add
            .text(612, 460, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: 28,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);*/

        //this.input.once("pointerdown", () => {
        this.input.once("pointerdown", () => {
            this.scene.start("Game");
        });

        this.input.keyboard
            ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
            .once("down", () => {
                this.scene.start("Game");
            });

        //});
    }
}
