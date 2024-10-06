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
        this.input.setDefaultCursor("url(assets/syr.png), pointer");

        this.add.image(100, 180, "bad");
        this.add.sprite(70, 280, "bot1").play("bot1");
        this.add.sprite(180, 270, "drop").play("drop");

        this.add.image(950, 420, "good");
        this.add.sprite(860, 560, "blerb").play("blerb");
        this.add.sprite(980, 530, "blerb2").play("blerb2");

        const g = this.add.image(500, 400, "glass");
        this.add.image(512, 400, "logo");
        g.setAlpha(0.2);

        this.add.image(120, 620, "keymouse");

        /*this.title = this.add
            .text(402, 740, "Keys: whack creatures. Mouse: explode cells", {
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
