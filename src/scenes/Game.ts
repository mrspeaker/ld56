import { Scene } from "phaser";
import { Cell } from "../cell.ts";
import { Turret } from "../turret.ts";

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

    static MAX_CELLS = 30;
    cells: Cell[] = [];

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
        this.camera.setBackgroundColor(0x000000);
        // this.camera.postFX.addTiltShift(0.1, 1.0, 0.2);
        this.camera.postFX.addVignette(0.5, 0.5, 0.9, 0.3);

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
        this.bg.postFX.addVignette(0.5, 0.5, 0.6);

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

        const cell_group = this.add.group();
        for (let i = 0; i < Game.MAX_CELLS; i++) {
            const cell = new Cell(this, 0, 0);
            this.cells.push(cell);
            cell_group.add(cell, true);
            cell.target = new Phaser.Geom.Point(camera.centerX, camera.centerY);
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
            cell.x = (Math.cos(a) * camera.width) / 2 + camera.centerX;
            cell.y = (Math.sin(a) * camera.height) / 2 + camera.centerY;

            cell.playAfterDelay("drop", Phaser.Math.Between(0, 1500));
            cell.on("pointerdown", () => {
                //cell.visible = false;
                cell.target = null;
            });
            cell.on("pointerover", () => {
                cell.setTint(0x00ff00);
            });
            cell.on("pointerout", () => {
                cell.setTint(0xffffff);
            });
        }

        this.turrets = this.add.group();
        const t = new Turret(this, 50, 50);
        this.turrets.add(t, true);

        const r = this.add.rectangle(
            camera.centerX,
            camera.centerY,
            total_width,
            total_height,
            0x111111,
        );
        r.alpha = 0.9;

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
            //cell_bg.add(
            this.add.text(x - 50, y - 50, "QWERASD".split("")[i], {
                fontFamily: "Arial Black",
                fontSize: 18,
                color: "#ffffff",
            }),
                //);

                this.slots.push(new MoleCell());
            this.slot_gfx[i].x = x;
            this.slot_gfx[i].y = y;
            this.slot_gfx[i].visible = false;
        }
        const mole_cell_bg = cell_bg.getChildren();
        this.mole_cell_bg = mole_cell_bg;
        mole_cell_bg.forEach((c) => (c.alpha = 0));

        this.keys = [
            input.keyboard.addKey(KeyCodes.Q),
            input.keyboard.addKey(KeyCodes.W),
            input.keyboard.addKey(KeyCodes.E),
            input.keyboard.addKey(KeyCodes.A),
            input.keyboard.addKey(KeyCodes.S),
            input.keyboard.addKey(KeyCodes.D),
        ];

        this.add.particles(0, 100, "drop", {
            x: { min: 0, max: camera.width },
            y: { min: 0, max: camera.height },
            quantity: 2,
            lifespan: 2500,
            blendMode: Phaser.BlendModes.MULTIPLY,
            //gravityY: 200,
            accelerationX: [-100, 100],
            accelerationY: [-100, 100],
            scale: 0.1,
        });
    }

    update() {
        const { keys, camera, cells } = this;

        cells.forEach((c) => {
            c.update();
            if (!c.target) {
                // dead.
                c.visible = false;
            }
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
    }
}
