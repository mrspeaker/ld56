import { Scene } from "phaser";
import { Cell } from "../cell.ts";
import { Bomb } from "../bomb.ts";

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

class Slot {
    type: number;
    alive: boolean = false;
    timer: number = 0;
}

const SCORE_BOT_KILL = 100;
const SCORE_CELL_KILL = 20;
const HP_BOT_KILL = 2;
const HP_FRIENDLY_FIRE = -5;

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    bg: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;

    keys: Phaser.Input.Keyboard.Key[];

    static MAX_CELLS = 50;
    static MAX_BOMBS = 30;
    static RADIUS = 220;

    slots: Slot[];
    slot_gfx: Phaser.GameObjects.GameObject[];
    cells: Cell[];
    bombs: Bomb[];
    bomb_group: Phaser.GameObjects.Group;

    NUM_COLS = 3;
    NUM_ROWS = 2;
    NUM_MOLES = 6;

    score: number;
    health: number;
    cooldown: number; // bomb placement cooldown
    whacks_good: number;
    whacks_bad: number;
    whacks_missed: number;

    cells_killed: number;
    cells_escaped: number;

    cell_spawn_timer: number;
    cell_spawn_rate: number;
    cell_spawn_rate_inc: number;
    cell_spawn_rate_fastest: number;
    cell_spawn_speed_base: number;
    cell_spawn_speed_inc: number;

    constructor() {
        super("Game");
    }

    init() {
        this.health = 100;
        this.score = 0;
        this.cooldown = 0;
        this.whacks_good = 0;
        this.whacks_bad = 0;
        this.whacks_missed = 0;
        this.cells_killed = 0;
        this.cells_escaped = 0;

        this.cell_spawn_timer = 500; // initial delay
        this.cell_spawn_rate = 200; // spawn 1 every X ticks to start
        this.cell_spawn_rate_inc = -10; // every spawn, reduce rate
        this.cell_spawn_rate_fastest = 30; // fastest spawn rate
        this.cell_spawn_speed_base = 0.1; // base speed of new cells
        this.cell_spawn_speed_inc = -0.01; // how much faster each subsequent cell gets

        this.slots = [];
        this.slot_gfx = [];
        this.cells = [];
        this.bombs = [];
    }

    get_cell_target(src_x: number, src_y: number) {
        const { camera } = this;
        const target = new Phaser.Geom.Point(camera.centerX, camera.centerY);
        const a = Phaser.Math.Angle.Between(src_x, src_y, target.x, target.y);
        target.x -= Math.cos(a) * 200;
        target.y -= Math.sin(a) * 200;
        return target;
    }

    create() {
        const { add, input } = this;

        input.setDefaultCursor("url(assets/syr.png), pointer");

        const camera = (this.camera = this.cameras.main);
        this.camera.setBackgroundColor(0x000000);
        // this.camera.postFX.addTiltShift(0.1, 1.0, 0.2);
        //this.camera.postFX.addVignette(0.5, 0.5, 0.9, 0.3);

        const cell_size = 180;
        const cell_pad = 0;
        const total_width = this.NUM_COLS * (cell_size + cell_pad) - cell_pad;
        const total_height = this.NUM_ROWS * (cell_size + cell_pad) - cell_pad;

        this.bg = add.image(camera.centerX, camera.centerY, "background");
        this.bg.setAlpha(0.1);
        this.bg.setDisplaySize(camera.width, camera.height);
        this.bg.postFX.addVignette(0.5, 0.5, 0.6);

        //const m = add.sprite(camera.centerX, camera.centerY, "mol");
        //m.play("mol");

        this.add.circle(
            camera.centerX,
            camera.centerY,
            Game.RADIUS,
            0x7dff7d,
            0.1,
        );
        /*        const bits = 10;
        for (let i = 0; i < bits; i++) {
            const graphics = this.add.graphics();
            graphics.lineStyle(4, 0x7dff7d, 1);
            graphics.beginPath();
            const start = (i / bits) * (Math.PI * 2);
            graphics.arc(
                camera.centerX,
                camera.centerY,
                220,
                start, //Phaser.Math.DegToRad(90),
                start - 0.5, //Phaser.Math.DegToRad(180),
                true,
            );
            graphics.strokePath();
        }*/

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
            cell.visible = false;
            this.cells.push(cell);
            cell_group.add(cell, true);
        }

        this.bomb_group = this.add.group();
        for (let i = 0; i < Game.MAX_BOMBS; i++) {
            const b = new Bomb(this);
            this.bombs.push(b);
            this.bomb_group.add(b, true);
        }

        const cell_bg = this.add.group();
        cell_bg.setDepth(2);
        this.slot_gfx = this.add
            .group({ key: "blerb", frameQuantity: this.NUM_MOLES })
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

            const txt = this.add.text(x - 50, y - 50, "QWEASD".split("")[i], {
                fontFamily: "Arial Black",
                fontSize: 18,
                color: "#ffffff",
            });
            this.slots.push(new Slot());
            const off =
                (i / this.NUM_MOLES) * Math.PI * 2 - Phaser.Math.DegToRad(145);
            const rad = 160;
            this.slot_gfx[i].x = camera.centerX + Math.cos(off) * rad;
            this.slot_gfx[i].y = camera.centerY + Math.sin(off) * rad;
            this.slot_gfx[i].visible = false;
            txt.x = camera.centerX + Math.cos(off) * 240 - 5;
            txt.y = camera.centerY + Math.sin(off) * 240 - 5;
        }
        const slot_bg = (this.slot_bg = cell_bg.getChildren());
        slot_bg.forEach((c) => (c.alpha = 0));

        this.keys = [
            input.keyboard.addKey(KeyCodes.Q),
            input.keyboard.addKey(KeyCodes.W),
            input.keyboard.addKey(KeyCodes.E),
            input.keyboard.addKey(KeyCodes.D),
            input.keyboard.addKey(KeyCodes.S),
            input.keyboard.addKey(KeyCodes.A),
        ];
        const space = input.keyboard.addKey(KeyCodes.SPACE);
        space.once("down", () => {
            //            this.health = 2;
        });

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

    draw_score() {
        this.score_text.text =
            "SCORE: " +
            (this.score + "").padStart(5, "0") +
            " HP: " +
            this.health;
    }

    update() {
        const { keys, cells, camera, slots, bombs } = this;

        cells.forEach((c) => {
            if (c.update()) {
                // Made it to the target
                this.health -= 1;
                this.cells_escaped++;
                c.visible = false;
            }
        });

        if (this.cell_spawn_timer-- <= 0) {
            // spawn a cell
            const c = cells.find((c) => c.target == null);
            if (c) {
                c.visible = true;
                const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
                c.x = (Math.cos(a) * camera.width) / 2 + camera.centerX;
                c.y = (Math.sin(a) * camera.height) / 2 + camera.centerY;
                c.target = this.get_cell_target(c.x, c.y);
                // Get faster each new cell
                c.speed = this.cell_spawn_speed_base;
                this.cell_spawn_speed_base += this.cell_spawn_speed_inc;
            }
            // Spawn faster each new cell
            this.cell_spawn_timer = this.cell_spawn_rate;
            this.cell_spawn_rate = Math.max(
                this.cell_spawn_rate_fastest,
                this.cell_spawn_rate + this.cell_spawn_rate_inc,
            );
        }

        bombs.forEach((b) => {
            if (!b.update()) {
                // exlodey
                const e = this.add.sprite(b.x, b.y, "hit").play("hit");
                e.once("animationcomplete", () => {
                    e.destroy();
                });
                // Find nearby cells and destroy them.
                const bomb_radius = 50;
                cells.forEach((c) => {
                    const d = Phaser.Math.Distance.Between(b.x, b.y, c.x, c.y);
                    if (d < bomb_radius) {
                        this.score += SCORE_CELL_KILL;
                        this.cells_killed++;
                        c.target = null;
                        c.visible = false;
                    }
                });
            }
        });

        const pointer = this.input.activePointer;
        this.cooldown--; // = Math.max(0, this.cooldown--);
        if (pointer.isDown && this.cooldown <= 0) {
            const dist = Phaser.Math.Distance.Between(
                camera.centerX,
                camera.centerY,
                pointer.position.x,
                pointer.position.y,
            );
            if (dist >= Game.RADIUS) {
                // Drop a bomba!
                this.cooldown = 30;
                const b = this.bombs.find((b) => b.explode());
                if (b) {
                    b.ignite(pointer.position.x, pointer.position.y, this);
                }
            }
        }

        this.draw_score();

        slots.forEach((m, i) => {
            if (m.alive) {
                if (keys[i].isDown) {
                    m.alive = false;

                    const hit_gfx = this.add
                        .sprite(this.slot_gfx[i].x, this.slot_gfx[i].y, "hit")
                        .play("hit", false)
                        .once("animationcomplete", () => {
                            hit_gfx.destroy();
                        });
                    camera.shake(100, 0.01);

                    if (m.type == 0) {
                        // score!
                        this.score += SCORE_BOT_KILL;
                        this.health += HP_BOT_KILL;
                        this.whacks_good++;
                        this.slot_gfx[i].play("bot1_die");
                    } else {
                        // brrrrp!
                        this.health += HP_FRIENDLY_FIRE;
                        this.whacks_bad++;
                        this.slot_gfx[i].visible = false;
                    }
                    this.tweens.add({
                        targets: this.slot_bg[i],
                        alpha: 0,
                    });
                }

                if (m.timer-- <= 0) {
                    m.alive = false;
                    this.slot_gfx[i].visible = false;
                    if (m.type == 0) {
                        this.whacks_missed++;
                        this.health -= 10;
                    }
                }
            } else {
                if (Phaser.Math.Between(0, 200) == 1) {
                    m.alive = true;
                    m.timer = 150;
                    m.type =
                        Phaser.Math.Between(0, 100) < 65
                            ? 0
                            : Phaser.Math.Between(0, 100) < 50
                            ? 1
                            : 2;
                    this.slot_gfx[i].visible = true;
                    this.slot_gfx[i].play(["bot1", "blerb", "blerb2"][m.type]);
                }
            }
        });
        if (this.health > 100) this.health = 100;
        if (this.health <= 0) {
            this.scene.start("GameOver", {
                score: this.score,
                whacks_good: this.whacks_good,
                whacks_bad: this.whacks_bad,
                whacks_missed: this.whacks_missed,
                cells_killed: this.cells_killed,
                cells_escaped: this.cells_escaped,
            });
        }
    }
}
