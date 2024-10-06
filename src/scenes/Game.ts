import { Scene } from "phaser";
import { Cell } from "../cell.ts";
import { Bomb } from "../bomb.ts";
import { Slot, slot_state, slot_type } from "../slot.ts";

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

const SCORE_BOT_KILL = 100;
const SCORE_CELL_KILL = 20;
const HP_BOT_KILL = 0;
const HP_BOT_MISSED = -5;
const HP_FRIENDLY_FIRE = -5;
const BOMB_COOLDOWN = 20;
const BOMB_CHARGE_TIME = 60;
const BOMB_EXPLOSION_RADIUS = 80;

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

    bomb_cooldown: number; // bomb placement cooldown

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

    slot_spawn_chance: number;
    slot_spawn_chance_max: number;
    slot_spawn_chance_inc: number;

    slot_spawn_ai_chance: number; // between 0-1
    slot_spawn_life: number;
    slot_spawn_life_min: number; // minum time on screen at fastest
    slot_spawn_life_deviation: number; // life +/- deviation
    slot_spawn_life_inc: number; // popup up for less and less time

    constructor() {
        super("Game");
    }

    init() {
        this.health = 100;
        this.score = 0;
        this.bomb_cooldown = 0;
        this.whacks_good = 0;
        this.whacks_bad = 0;
        this.whacks_missed = 0;
        this.cells_killed = 0;
        this.cells_escaped = 0;

        this.cell_spawn_timer = 500; // initial delay
        this.cell_spawn_rate = 150; // spawn 1 every X ticks to start
        this.cell_spawn_rate_inc = -2; // every spawn, reduce rate
        this.cell_spawn_rate_fastest = 5; // fastest spawn rate
        this.cell_spawn_speed_base = 0.05; // base speed of new cells
        this.cell_spawn_speed_inc = 0.01; // how much faster each subsequent cell gets

        this.slot_spawn_chance = 0.08;
        this.slot_spawn_chance_max = 1;
        this.slot_spawn_chance_inc = 0.001;

        this.slot_spawn_life_min = 40;
        this.slot_spawn_life = 100;
        this.slot_spawn_life_deviation = 15; // life +/- deviation
        this.slot_spawn_life_inc = -0.2; // popup up for less and less time

        this.slot_spawn_ai_chance = 0.6;

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

        const theme = this.sound.add("theme", { volume: 1 });
        theme.play();
        this.theme = theme;
        this.sfx = {
            laugh: this.sound.add("laugh", { volume: 1 }),
            ohno: this.sound.add("ohno", { volume: 1 }),
            punch: this.sound.add("punch", { volume: 1 }),
            splode: this.sound.add("splode", { volume: 1 }),
            yell: this.sound.add("yell", { volume: 1 }),
        };

        const camera = (this.camera = this.cameras.main);
        this.camera.setBackgroundColor(0x000000);
        //// this.camera.postFX.addTiltShift(0.1, 1.0, 0.2);
        this.camera.postFX.addVignette(0.5, 0.5, 0.9, 0.3);

        const cell_size = 180;
        const cell_pad = 0;
        const total_width = this.NUM_COLS * (cell_size + cell_pad) - cell_pad;
        const total_height = this.NUM_ROWS * (cell_size + cell_pad) - cell_pad;

        this.bg = add.image(camera.centerX, camera.centerY, "background");
        this.bg.setAlpha(0.1);
        this.bg.setDisplaySize(camera.width, camera.height);
        this.bg.postFX.addVignette(0.5, 0.5, 0.6);

        this.add.circle(
            camera.centerX,
            camera.centerY,
            Game.RADIUS,
            0x000000,
            0.8,
        );

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

        const font = {
            fontFamily: "Arial Black",
            fontSize: 38,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
            align: "center",
        };
        const score = add.text(392, 15, "", font);
        this.score_text = score;
        this.hp_text = add.text(720, 15, "XX", font);

        this.add.image(camera.centerX - 200, 40, "score");
        this.add.image(camera.centerX + 150, 40, "hp");

        if (!input.keyboard) return;

        const cell_group = this.add.group();
        for (let i = 0; i < Game.MAX_CELLS; i++) {
            const cell = new Cell(this, 0, 0);
            cell.visible = false;
            cell.setScale(Phaser.Math.FloatBetween(0.3, 0.8));
            this.cells.push(cell);
            cell_group.add(cell, true);
        }

        this.bomb_group = this.add.group();
        for (let i = 0; i < Game.MAX_BOMBS; i++) {
            const b = new Bomb(this, BOMB_CHARGE_TIME);
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

            const txt = this.add.text(x - 50, y - 50, "QWEASD".split("")[i], {
                fontFamily: "Arial Black",
                fontSize: 18,
                color: "#ffffff",
            });
            this.slots.push(new Slot(i));
            const off =
                (i / this.NUM_MOLES) * Math.PI * 2 - Phaser.Math.DegToRad(145);
            const rad = 160;
            this.slot_gfx[i].x = camera.centerX + Math.cos(off) * rad;
            this.slot_gfx[i].y = camera.centerY + Math.sin(off) * rad;
            this.slot_gfx[i].visible = false;
            txt.x = camera.centerX + Math.cos(off - 0.1) * 240;
            txt.y = camera.centerY + Math.sin(off - 0.1) * 240;
        }

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
            y: { min: -100, max: camera.height },
            quantity: 1,
            lifespan: 200,
            tint: 0xffff00,
            opacity: 0.5,
            blendMode: Phaser.BlendModes.LIGHTER,
            //gravityY: 200,
            accelerationX: [-100, 100],
            accelerationY: [-100, 100],
            scale: 0.1,
        });

        const glass = this.add.image(camera.centerX, camera.centerY, "glass");
        glass.setAlpha(0.14);
    }

    draw_score() {
        this.score_text.text = this.score;
        this.hp_text.text = this.health;
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
                cells.forEach((c) => {
                    const d = Phaser.Math.Distance.Between(b.x, b.y, c.x, c.y);
                    if (d < BOMB_EXPLOSION_RADIUS) {
                        this.score += SCORE_CELL_KILL;
                        this.cells_killed++;
                        c.target = null;
                        c.visible = false;
                    }
                });
            }
        });

        const pointer = this.input.activePointer;
        this.bomb_cooldown--; // = Math.max(0, this.cooldown--);
        if (pointer.isDown && this.bomb_cooldown <= 0) {
            const dist = Phaser.Math.Distance.Between(
                camera.centerX,
                camera.centerY,
                pointer.position.x,
                pointer.position.y,
            );
            if (dist >= Game.RADIUS) {
                // Drop a bomba!
                this.bomb_cooldown = BOMB_COOLDOWN;
                this.sfx.splode.play();
                const b = this.bombs.find((b) => b.explode());
                if (b) {
                    b.ignite(pointer.position.x, pointer.position.y, this);
                }
            }
        }

        this.draw_score();

        // Update slots
        slots.forEach((m, i) => this.handle_slot(m, i));

        // Spawn any new slots
        this.spawn_slots();

        // HP
        if (this.health > 100) this.health = 100;
        if (this.health <= 0) {
            this.theme.stop();
            this.scene.start("GameOver", {
                score: this.score,
                whacks_good: this.whacks_good,
                whacks_bad: this.whacks_bad,
                whacks_missed: this.whacks_missed,
                cells_killed: this.cells_killed,
                cells_escaped: this.cells_escaped,
            });
        }
        camera.backgroundColor.red =
            this.health > 50 ? 0 : ((50 - this.health) / 50) * 40;
    }

    handle_slot(m: Slot, i: number) {
        const { keys, slot_gfx } = this;

        switch (m.state) {
            case slot_state.MOVING_IN:
                if (m.timer-- <= 0) {
                    slot_gfx[m.idx].visible = true;
                    slot_gfx[m.idx].setAngle(Phaser.Math.FloatBetween(-20, 20));
                    slot_gfx[m.idx].play(["bot1", "blerb", "blerb2"][m.type]);
                    m.state = slot_state.ALIVE;
                    m.timer = m.life;
                }
                break;
            case slot_state.ALIVE:
                if (keys[i].isDown) {
                    this.handle_whack(m, i);
                }

                // Handle timer
                if (m.timer-- <= 0) {
                    m.state = slot_state.MISSED;
                    if (m.is_baddie()) {
                        this.whacks_missed++;
                        this.health += HP_BOT_MISSED;
                        this.camera.flash(100, 255, 0, 0);
                        this.sfx.laugh.play();
                    }
                }
                break;
            case slot_state.WHACKED:
                m.state = slot_state.MOVING_OUT;
                m.timer = 25;
                break;
            case slot_state.MISSED:
                slot_gfx[m.idx].flipY = true;
                m.state = slot_state.MOVING_OUT;
                m.timer = 25;
                break;
            case slot_state.MOVING_OUT:
                if (m.timer-- <= 0) {
                    m.state = slot_state.EMPTY;
                    slot_gfx[m.idx].visible = false;
                    slot_gfx[m.idx].flipY = false;
                }
                break;
            default:
                break;
        }
    }

    handle_whack(m: Slot, i: number) {
        const { camera } = this;

        m.state = slot_state.WHACKED;

        const hit_gfx = this.add
            .sprite(this.slot_gfx[i].x, this.slot_gfx[i].y, "hit")
            .play("hit", false)
            .once("animationcomplete", () => {
                hit_gfx.destroy();
            });
        camera.shake(100, 0.01);

        this.sfx.punch.play();

        if (m.is_baddie()) {
            // score!
            this.score += SCORE_BOT_KILL;
            this.health += HP_BOT_KILL;
            this.whacks_good++;
            this.slot_gfx[i].play("bot1_die");
            this.sfx.yell.play();
        } else {
            // brrrrp!
            this.health += HP_FRIENDLY_FIRE;
            this.whacks_bad++;
            this.slot_gfx[i].visible = false;
            camera.flash(100, 255, 0, 0);
            this.sfx.ohno.play();
        }
    }

    spawn_slots() {
        const { slots } = this;
        if (Phaser.Math.Between(0, 1000) < this.slot_spawn_chance * 100) {
            const free_slots = slots.filter((s) => s.state == slot_state.EMPTY);
            if (free_slots.length == 0) return;
            const m = Phaser.Utils.Array.GetRandom(free_slots);
            m.state = slot_state.MOVING_IN;
            m.timer = 30;
            m.type =
                Phaser.Math.Between(0, 100) < this.slot_spawn_ai_chance * 100
                    ? slot_type.AI_BOT
                    : Phaser.Math.Between(0, 100) < 50
                    ? slot_type.BLOB1
                    : slot_type.BLOB2;
            // How long to show?
            m.life = Math.max(
                this.slot_spawn_life_min,
                this.slot_spawn_life +
                    Phaser.Math.Between(
                        -this.slot_spawn_life_deviation,
                        this.slot_spawn_life_deviation,
                    ),
            );
            // Get faster each time
            this.slot_spawn_life = Math.max(
                this.slot_spawn_life_min,
                this.slot_spawn_life + this.slot_spawn_life_inc,
            );

            this.slot_spawn_chance = Math.min(
                this.slot_spawn_chance_max,
                this.slot_spawn_chance + this.slot_spawn_chance_inc,
            );
            /*console.log(
                (this.slot_spawn_chance * 100).toFixed(0),
                this.slot_spawn_life,
                this.slot_spawn_life_min,
            );*/
        }
    }
}
