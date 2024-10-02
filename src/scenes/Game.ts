import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    cody: Phaser.GameObjects.Sprite;

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
        cody.setScale(3);
        cody.play("walk");
        this.cody = cody;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );

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

    update() {
        const { cody, cursors, space } = this;
        let xo = 0;
        let yo = 0;
        if (space.isDown) {
            xo += 10;
        }

        if (cursors.right.isDown) {
            xo++;
        }
        if (cursors.left.isDown) {
            xo--;
        }
        if (cursors.down.isDown) {
            yo++;
        }
        if (cursors.up.isDown) {
            yo--;
        }

        // Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.dragon.getBounds())

        if (xo || yo) {
            cody.x += xo;
            cody.y += yo;
            cody.play("walk", true);
        } else {
            cody.stop();
        }
    }
}
