import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(512, 384, "LD56", {
            fontFamily: "Arial Black",
            fontSize: 38,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
            align: "center",
        });
        this.msg_text.setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("GameOver");
        });

        const cody = this.add.sprite(100, 100);
        cody.setScale(1);
        cody.play("walk");

        console.log(Phaser.Math.Between(0, 10));
        const group = this.add.group({ key: "walk", frameQuantity: 30 });
        //group.playAnimation("walk", Phaser.Math.Between(0, 10));
        group
            .getChildren()
            .forEach((c) =>
                c.playAfterDelay("walk", Phaser.Math.Between(0, 1500)),
            );

        const rect = new Phaser.Geom.Rectangle(
            0,
            0,
            this.sys.game.scale.gameSize.width,
            this.sys.game.scale.gameSize.height,
        );

        //  Randomly position the sprites within the rectangle
        Phaser.Actions.RandomRectangle(group.getChildren(), rect);
    }
}
