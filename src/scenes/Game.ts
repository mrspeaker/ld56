import { Scene } from "phaser";

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

class MoleCell {
    type: number;
    alive: boolean = false;
    timer: number = 0;
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    bg: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    cody: Phaser.GameObjects.Sprite;

    keys: Phaser.Input.Keyboard.Key[];

    slots: MoleCell[] = [];
    slot_gfx: Phaser.GameObjects.GameObject[] = [];
    cells: Phaser.GameObjects.GameObject[] = [];

    NUM_COLS = 3;
    NUM_ROWS = 2;
    NUM_MOLES = 6;

    score = 0;

    constructor() {
        super("Game");
    }

    create() {
        const { add, input } = this;

        const camera = (this.camera = this.cameras.main);
        // this.camera.setBackgroundColor(0x00ff00);
        // this.camera.postFX.addTiltShift(0.1, 1.0, 0.2);
        this.camera.postFX.addVignette(0.5, 0.5, 0.9);

        const cell_size = 130;
        const cell_pad = 0;
        const total_width = this.NUM_COLS * (cell_size + cell_pad) - cell_pad;
        const total_height = this.NUM_ROWS * (cell_size + cell_pad) - cell_pad;

        this.bg = add.image(
            this.camera.centerX,
            this.camera.centerY,
            "background",
        );
        this.bg.setAlpha(0.5);
        this.bg.setDisplaySize(this.camera.width, this.camera.height);
        const score = add.text(512, 384, "LD56", {
            fontFamily: "Arial Black",
            fontSize: 38,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
            align: "center",
        });
        score.setOrigin(0.5);
        score.y = 20;
        this.score_text = score;

        /*input.once("pointerdown", () => {
            //this.scene.start("GameOver");
            });*/

        if (!input.keyboard) return;

        const group = this.add.group();
        for (let i = 0; i < 30; i++) {
            const cell = this.add.sprite(0, 0, "drop").setInteractive();
            group.add(cell);
            //group.playAnimation("walk", Phaser.Math.Between(0, 10));

            cell.playAfterDelay("drop", Phaser.Math.Between(0, 1500));
            cell.on("pointerdown", () => {
                cell.visible = false;
            });
            cell.on("pointerover", () => {
                cell.setTint(0xff0000);
            });
            cell.on("pointerout", () => {
                cell.setTint(0xffffff);
            });
        }

        this.cells = group.getChildren();
        this.cells.forEach((c) => {
            c.angle = Phaser.Math.Angle.RandomDegrees();
            c.setScale(0.65);
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
            c.x = (Math.cos(a) * camera.width) / 2 + camera.centerX;
            c.y = (Math.sin(a) * camera.height) / 2 + camera.centerY;
        });

        this.add.rectangle(
            camera.centerX,
            camera.centerY,
            total_width,
            total_height,
            0x000000,
        );

        const cell_bg = this.add.group();
        cell_bg.setDepth(2);
        this.slot_gfx = this.add
            .group({ key: "blerb", frameQuantity: this.NUM_MOLES })
            .setDepth(1)
            .getChildren();

        const gap_x = (camera.width - total_width) / 2;
        const gap_y = (camera.height - total_height) / 2;

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
                this.add.rectangle(x, y, cell_size, cell_size, 0x333333),
                true,
            );
            this.slots.push(new MoleCell());
            this.slot_gfx[i].x = x;
            this.slot_gfx[i].y = y;
            this.slot_gfx[i].visible = false;
        }
        const mole_cell_bg = cell_bg.getChildren();
        this.mole_cell_bg = mole_cell_bg;
        mole_cell_bg.forEach((c) => (c.alpha = 0));

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
        //Phaser.Actions.RandomRectangle(group.getChildren(), rect);
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
            const sp = 0.15;
            const a = Phaser.Math.Angle.Between(c.x, c.y, cx, cy);
            c.x += Math.cos(a) * sp;
            c.y += Math.sin(a) * sp;
            const d = Phaser.Math.Distance.Between(c.x, c.y, cx, cy);
            if (d < 20) {
                c.visible = false;
            }

            if (c.visible == false) {
                c.visible = true;
                const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
                c.x += Math.cos(a) * camera.width * 0.5;
                c.y += Math.sin(a) * camera.width * 0.5;
            }

            c.angle += 1;
        });

        this.slots.forEach((m, i) => {
            if (m.alive) {
                if (keys[i].isDown) {
                    m.alive = false;
                    this.mole_cell_bg[i].alpha = 1;

                    if (m.type == 0) {
                        // score!
                        this.score += 1;
                        this.mole_cell_bg[i].fillColor = 0x006600;
                    } else {
                        // brrrrp!
                        this.score -= 20;
                        this.mole_cell_bg[i].fillColor = 0x440000;
                    }
                    this.tweens.add({
                        targets: this.mole_cell_bg[i],
                        alpha: 0,
                    });
                    this.score_text.text = this.score;
                    this.slot_gfx[i].visible = false;
                }

                if (m.timer-- <= 0) {
                    m.alive = false;
                    this.slot_gfx[i].visible = false;
                }
            } else {
                if (Phaser.Math.Between(0, 200) == 1) {
                    m.alive = true;
                    m.timer = 150;
                    m.type = Phaser.Math.Between(0, 100) < 65 ? 0 : 1;
                    this.slot_gfx[i].fillColor = 0x333333;

                    this.slot_gfx[i].visible = true;
                    this.slot_gfx[i].play(["blerb2", "blerb"][m.type]);
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
