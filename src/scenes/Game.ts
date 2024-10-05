import { Scene } from "phaser";

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

class MoleCell {
    type: number;
    alive: boolean = false;
    timer: number = 0;
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    cody: Phaser.GameObjects.Sprite;

    keys: Phaser.Input.Keyboard.Key[];

    mole_cells: MoleCell[];

    NUM_COLS = 3;
    NUM_ROWS = 2;
    NUM_MOLES = 6;

    constructor() {
        super("Game");
    }

    create() {
        const { add, input } = this;

        this.camera = this.cameras.main;
        //        this.camera.setBackgroundColor(0x00ff00);
        //this.camera.postFX.addTiltShift(0.1, 1.0, 0.2);
        this.camera.postFX.addVignette(0.5, 0.5, 0.9);

        this.background = add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.msg_text = add.text(512, 384, "LD56", {
            fontFamily: "Arial Black",
            fontSize: 38,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
            align: "center",
        });
        this.msg_text.setOrigin(0.5);

        input.once("pointerdown", () => {
            this.scene.start("GameOver");
        });

        if (!input.keyboard) return;

        const group = this.add.group({ key: "walk", frameQuantity: 30 });
        //group.playAnimation("walk", Phaser.Math.Between(0, 10));
        group
            .getChildren()
            .forEach((c) =>
                c.playAfterDelay("walk", Phaser.Math.Between(0, 1500)),
            );
        this.cells = group.getChildren();
        this.cells.forEach((c) => {
            c.angle = Phaser.Math.Angle.RandomDegrees();
            c.setScale(0.65);
        });

        const cell_bg = this.add.group();
        cell_bg.setDepth(2);
        this.mole_cell_gfx = this.add
            .group({ key: "walk", frameQuantity: this.NUM_MOLES })
            .setDepth(1)
            .getChildren();

        const cell_size = 130;
        const cell_pad = 30;
        const total_width = this.NUM_COLS * (cell_size + cell_pad);
        const total_height = this.NUM_ROWS * (cell_size + cell_pad);
        const gap_x = (this.camera.width - total_width) / 2;
        const gap_y = (this.camera.height - total_height) / 2;
        this.mole_cells = [];
        for (let i = 0; i < this.NUM_MOLES; i++) {
            const x =
                (i % this.NUM_COLS) * (cell_size + cell_pad) +
                cell_size / 2 +
                gap_x;
            const y =
                Math.floor(i / this.NUM_COLS) * (cell_size + cell_pad) +
                cell_size / 2 +
                gap_y;

            cell_bg.add(
                this.add.rectangle(x, y, cell_size, cell_size, 0x888888),
                true,
            );
            this.mole_cells.push(new MoleCell());
            this.mole_cell_gfx[i].type = 0;
            this.mole_cell_gfx[i].x = x;
            this.mole_cell_gfx[i].y = y;
            this.mole_cell_gfx[i].visible = false;
        }

        this.cursors = input.keyboard.createCursorKeys();
        this.space = input.keyboard.addKey(KeyCodes.SPACE);
        this.keys = [
            input.keyboard.addKey(KeyCodes.Q),
            input.keyboard.addKey(KeyCodes.W),
            input.keyboard.addKey(KeyCodes.E),
            input.keyboard.addKey(KeyCodes.A),
            input.keyboard.addKey(KeyCodes.S),
            input.keyboard.addKey(KeyCodes.D),
        ];

        const cody = add.sprite(100, 100);
        cody.setScale(1.5);
        cody.play("walk");
        this.cody = cody;

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
        const { cody, keys, camera, cursors, space, cells } = this;

        const cx = camera.centerX;
        const cy = camera.centerY;

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

        cells.forEach((c) => {
            //c.x++;
            const sp = 0.2;
            const a = Phaser.Math.Angle.Between(c.x, c.y, cx, cy);
            c.x += Math.cos(a) * sp;
            c.y += Math.sin(a) * sp;
            const d = Phaser.Math.Distance.Between(c.x, c.y, cx, cy);
            if (d < 20) {
                const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
                c.x += Math.cos(a) * camera.width * 0.5;
                c.y += Math.sin(a) * camera.width * 0.5;
            }
        });

        this.mole_cells.forEach((m, i) => {
            if (m.alive) {
                if (keys[i].isDown) {
                    m.alive = false;
                    this.mole_cell_gfx[i].visible = false;
                }

                if (m.timer-- <= 0) {
                    m.alive = false;
                    this.mole_cell_gfx[i].visible = false;
                }
            } else {
                if (Phaser.Math.Between(0, 100) == 1) {
                    m.alive = true;
                    m.timer = 150;
                    this.mole_cell_gfx[i].visible = true;
                }
            }
        });

        if (xo || yo) {
            cody.x += xo;
            cody.y += yo;
            cody.play("walk", true);
        } else {
            cody.stop();
        }
    }
}
