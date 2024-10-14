import { Scene } from "phaser";
import { Cell } from "../cell.ts";
import { Bomb } from "../bomb.ts";
import { Slot, slot_state, slot_type } from "../slot.ts";
import { FONT_FAMILY } from "../font.ts";

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

const SCORE_BOT_KILL = 100;
const SCORE_CELL_KILL = 20;
const SCORE_GOODY_SURVIVED = 8;
const HP_INITIAL = 100;
const HP_BOT_KILL = 0;
const HP_BOT_MISSED = -10;
const HP_CELL_ESCAPED = -5;
const HP_FRIENDLY_FIRE = -13;
const BOMB_COOLDOWN = 15;
const BOMB_CHARGE_TIME = 30;
const BOMB_EXPLOSION_RADIUS = 80;

enum game_state {
    PLAYING,
    DEAD,
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    msg_text: Phaser.GameObjects.Text;

    keys: Phaser.Input.Keyboard.Key[];

    static MAX_CELLS = 50;
    static MAX_BOMBS = 30;
    static RADIUS = 220;

    state: game_state;
    state_time: number;
    slots: Slot[];
    slot_gfx: Phaser.GameObjects.Sprite[];
    cells: Cell[];
    bombs: Bomb[];
    bomb_group: Phaser.GameObjects.Group;

    score_text: Phaser.GameObjects.Text;
    hp_text: Phaser.GameObjects.Text;
    theme: Phaser.Sound.BaseSound;
    sfx: {
        laugh: Phaser.Sound.BaseSound;
        ohno: Phaser.Sound.BaseSound;
        punch: Phaser.Sound.BaseSound;
        splode: Phaser.Sound.BaseSound;
        yell: Phaser.Sound.BaseSound;
        exp: Phaser.Sound.BaseSound;
        exp2: Phaser.Sound.BaseSound;
        happy: Phaser.Sound.BaseSound;
    };

    NUM_COLS = 3;
    NUM_ROWS = 2;
    NUM_MOLES = 6;

    last_flash: number;

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
    slot_spawn_sploder_chance: number; // between 0-1
    slot_spawn_life: number;
    slot_spawn_life_min: number; // minum time on screen at fastest
    slot_spawn_life_deviation: number; // life +/- deviation
    slot_spawn_life_inc: number; // popup up for less and less time

    constructor() {
        super("Game");
    }

    init() {
        this.state = game_state.PLAYING;
        this.health = HP_INITIAL;
        this.score = 0;
        this.bomb_cooldown = 0;
        this.whacks_good = 0;
        this.whacks_bad = 0;
        this.whacks_missed = 0;
        this.cells_killed = 0;
        this.cells_escaped = 0;

        this.cell_spawn_timer = 500; // initial delay
        this.cell_spawn_rate = 110; // spawn 1 every X ticks to start
        this.cell_spawn_rate_inc = -1.8; // every spawn, reduce rate
        this.cell_spawn_rate_fastest = 30; // fastest spawn rate
        this.cell_spawn_speed_base = 0.35; // base speed of new cells
        this.cell_spawn_speed_inc = 0.01; // how much faster each subsequent cell gets

        this.slot_spawn_chance = 0.08;
        this.slot_spawn_chance_max = 10;
        this.slot_spawn_chance_inc = 0.00005;

        this.slot_spawn_life_min = 40;
        this.slot_spawn_life = 100;
        this.slot_spawn_life_deviation = 15; // life +/- deviation
        this.slot_spawn_life_inc = -0.01; // popup up for less and less time

        this.slot_spawn_ai_chance = 0.6;
        this.slot_spawn_sploder_chance = 0.05;

        this.slots = [];
        this.slot_gfx = [];
        this.cells = [];
        this.bombs = [];

        this.last_flash = Date.now();
    }

    create() {
        const camera = this.create_camera();
        this.create_sound();
        this.create_input();

        this.create_bg(camera);
        this.create_score(camera);
        this.create_playfield(camera);
        this.create_fg(camera);
        this.create_helps();
    }

    create_camera() {
        const camera = (this.camera = this.cameras.main);
        this.camera.setBackgroundColor(0x000000);
        this.camera.postFX.addVignette(0.5, 0.5, 0.9, 0.3);
        return camera;
    }

    create_sound() {
        const theme = this.sound.add("theme", { volume: 0.5 });
        theme.play();
        theme.loop = true;
        this.theme = theme;
        this.sfx = {
            laugh: this.sound.add("laugh", { volume: 1 }),
            ohno: this.sound.add("ohno", { volume: 1 }),
            punch: this.sound.add("punch", { volume: 1 }),
            splode: this.sound.add("splode", { volume: 1 }),
            yell: this.sound.add("yell", { volume: 1 }),
            exp: this.sound.add("exp", { volume: 1 }),
            exp2: this.sound.add("exp2", { volume: 0.5 }),
            happy: this.sound.add("happy", { volume: 0.5 }),
        };
    }

    create_input() {
        const { input } = this;

        input.setDefaultCursor("url(assets/syr.png), pointer");

        // Dodgy handle escape
        input.keyboard?.addKey(KeyCodes.ESC).on("down", () => {
            if (confirm("Quit?")) {
                this.theme?.stop();
                this.scene.start("MainMenu");
            }
        });

        // Handle key reconfigure
        const key_map = ["Q", "W", "E", "D", "S", "A"];
        if (window?.URLSearchParams && window?.location?.search) {
            for (let i = 0; i < key_map.length; i++) {
                const parms = new URLSearchParams(window.location.search);
                const key_txt = (i + 1).toString();
                if (parms.has(key_txt)) {
                    const phaser_key = parms.get(key_txt).toUpperCase();
                    const code = KeyCodes[phaser_key];
                    if (code) {
                        console.log(
                            "switching keys. Was:",
                            key_map[i],
                            "Now:",
                            key_txt,
                            phaser_key,
                            code,
                        );
                        key_map[i] = phaser_key;
                    }
                }
            }
        }

        if (!input.keyboard) return;

        this.keys = key_map.map((key_txt) =>
            input.keyboard.addKey(KeyCodes[key_txt]),
        );
    }

    create_score(camera: Phaser.Cameras.Scene2D.Camera) {
        const font = {
            fontFamily: FONT_FAMILY,
            fontSize: 38,
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
            align: "right",
        };

        this.score_text = this.add.text(392, 15, "0", font); //.setOrigin(0.5);
        this.hp_text = this.add.text(720, 15, "100", font);

        this.add.image(camera.centerX - 200, 40, "score");
        this.add.image(camera.centerX + 150, 40, "hp");
    }

    create_bg(camera: Phaser.Cameras.Scene2D.Camera) {
        const bg = this.add.image(camera.centerX, camera.centerY, "background");
        bg.setAlpha(0.1);
        bg.setDisplaySize(camera.width, camera.height);
        bg.postFX.addVignette(0.5, 0.5, 0.6);
        this.add.circle(
            camera.centerX,
            camera.centerY,
            Game.RADIUS,
            0x000000,
            0.8,
        );
        this.add.circle(
            camera.centerX,
            camera.centerY,
            Game.RADIUS,
            0x7dff7d,
            0.1,
        );
    }

    create_fg(camera: Phaser.Cameras.Scene2D.Camera) {
        // Lil bg effects
        this.add.particles(0, 100, "drop", {
            x: { min: 0, max: camera.width },
            y: { min: -100, max: camera.height },
            quantity: 1,
            lifespan: 200,
            tint: 0xffff00,
            blendMode: Phaser.BlendModes.LIGHTER,
            accelerationX: [-100, 100],
            accelerationY: [-100, 100],
            scale: 0.1,
        });

        const glass = this.add.image(camera.centerX, camera.centerY, "glass");
        glass.setAlpha(0.14);
    }

    create_helps() {
        // Help texts
        const helpbot = this.add.image(150, 400, "helpbot");
        helpbot.setAlpha(0);
        const helpmouse = this.add.image(870, 400, "helpmouse");
        helpmouse.setAlpha(0);
        helpmouse.setScale(0.8);
        this.tweens.chain({
            targets: helpbot,
            onComplete: () => {
                helpbot.destroy();
            },
            tweens: [
                {
                    alpha: 1,
                    delay: 1000,
                    duration: 1000,
                },
                {
                    alpha: 0,
                    delay: 3000,
                    duration: 1000,
                },
            ],
        });
        this.tweens.chain({
            targets: helpmouse,
            onComplete: () => {
                helpmouse.destroy();
            },
            tweens: [
                {
                    alpha: 1,
                    delay: 9000,
                    duration: 1000,
                },
                {
                    alpha: 0,
                    delay: 3000,
                    duration: 1000,
                },
            ],
        });
    }

    create_playfield(camera: Phaser.Cameras.Scene2D.Camera) {
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

        this.slot_gfx = this.add
            .group({ key: "blerb", frameQuantity: this.NUM_MOLES })
            .getChildren() as Phaser.GameObjects.Sprite[];

        const cell_size = 180;
        const cell_pad = 0;
        const total_width = this.NUM_COLS * (cell_size + cell_pad) - cell_pad;
        const total_height = this.NUM_ROWS * (cell_size + cell_pad) - cell_pad;

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

            const slot = new Slot(i);

            // Graphics for the key letter around circle
            slot.key_gfx = this.add.text(
                x - 50,
                y - 50,
                "QWEDSA".split("")[i],
                {
                    fontFamily: FONT_FAMILY,
                    fontSize: 18,
                    color: "#ffffff",
                },
            );

            // Segment arc around circle
            const arc = this.add.graphics();
            arc.lineStyle(4, 0x7dff7d, 0.4);
            arc.beginPath();
            const start = Math.PI + (i / this.NUM_MOLES) * (Math.PI * 2);
            arc.arc(
                camera.centerX,
                camera.centerY,
                220,
                start - 0,
                start + (Math.PI * 2) / this.NUM_MOLES,
                false,
            );
            arc.strokePath();
            arc.alpha = 0;
            slot.seg_gfx = arc;

            this.slots.push(slot);

            const off =
                (i / this.NUM_MOLES) * Math.PI * 2 - Phaser.Math.DegToRad(145);
            const rad = 160;
            this.slot_gfx[i].x = camera.centerX + Math.cos(off) * rad;
            this.slot_gfx[i].y = camera.centerY + Math.sin(off) * rad;
            this.slot_gfx[i].visible = false;
            slot.key_gfx.x = camera.centerX + Math.cos(off - 0.1) * 240;
            slot.key_gfx.y = camera.centerY + Math.sin(off - 0.1) * 240;
        }
    }

    draw_score() {
        const { score, score_text, health, hp_text } = this;
        const anim = (scene: Phaser.Scene, target: any) => {
            const boop = scene.tweens.getTweensOf(target);
            if (!boop.length) {
                scene.tweens.add({
                    targets: target,
                    scale: 1.3,
                    y: "-=10",
                    x: "-=10",
                    ease: "Sine.easeInOut",
                    yoyo: true,
                    duration: 100,
                });
            }
        };
        const sc = score.toFixed(0);
        if (sc != score_text.text) {
            anim(this, score_text);
            score_text.text = sc;
        }

        const hp = health.toFixed(0);
        if (hp != hp_text.text) {
            anim(this, hp_text);
            hp_text.text = hp;
        }
    }

    flash() {
        // Not sure how much flashing is too much - but let's limit it to 2 times / second maximum
        const now = Date.now();
        const t = now - this.last_flash;
        this.last_flash = now;
        if (t < 500) return;
        this.camera.flash(100, 255, 0, 0);
    }

    get_cell_target(src_x: number, src_y: number) {
        const { camera } = this;
        const target = new Phaser.Geom.Point(camera.centerX, camera.centerY);
        const a = Phaser.Math.Angle.Between(src_x, src_y, target.x, target.y);
        target.x -= Math.cos(a) * 200;
        target.y -= Math.sin(a) * 200;
        return target;
    }

    update() {
        switch (this.state) {
            case game_state.PLAYING:
                this.update_playing();
                break;
            case game_state.DEAD:
                this.update_dead();
                break;
            default:
                break;
        }
        this.draw_score();
    }

    update_playing() {
        const { cells, camera, slots, bombs } = this;

        // Update cells
        cells.forEach((c) => {
            if (c.update()) {
                // Made it to the target
                this.health += HP_CELL_ESCAPED;
                this.sfx.exp.play();
                this.cells_escaped++;
                c.visible = false;
            }
        });

        if (this.cell_spawn_timer-- <= 0) {
            // spawn a cell
            this.spawn_cell(cells, camera);
        }

        // Update bombs
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
                        this.sfx.exp2.play();
                        this.cells_killed++;
                        c.target = null;
                        c.visible = false;
                    }
                });
            }
        });

        // Add new bombs
        const pointer = this.input.activePointer;
        this.bomb_cooldown--;
        if (pointer.isDown && this.bomb_cooldown <= 0) {
            const dist = Phaser.Math.Distance.Between(
                camera.centerX,
                camera.centerY,
                pointer.position.x,
                pointer.position.y,
            );
            if (dist >= Game.RADIUS * 0.85) {
                // Drop a bomba!
                this.bomb_cooldown = BOMB_COOLDOWN;
                this.sfx.splode.play();
                const b = this.bombs.find((b) => b.explode());
                if (b) {
                    b.ignite(pointer.position.x, pointer.position.y, this);
                }
            }
        }

        // Update slots
        slots.forEach((m) => this.handle_slot(m));

        // Spawn any new slots
        this.spawn_slots();

        // HP
        if (this.health > 100) this.health = 100;
        if (this.health <= 0) {
            this.health = 0;
            this.theme.stop();
            this.state = game_state.DEAD;
            this.state_time = 0;
        }

        // Get redder as get dead-er
        camera.backgroundColor.red =
            this.health > 50 ? 0 : ((50 - this.health) / 50) * 40;
    }

    update_dead() {
        if (this.state_time === 1) {
            this.flash();
            this.sfx.punch.play();
        }
        if (this.state_time++ < 100) {
            return;
        }
        this.scene.start("GameOver", {
            score: this.score,
            whacks_good: this.whacks_good,
            whacks_bad: this.whacks_bad,
            whacks_missed: this.whacks_missed,
            cells_killed: this.cells_killed,
            cells_escaped: this.cells_escaped,
        });
    }

    spawn_cell(cells: Cell[], camera: Phaser.Cameras.Scene2D.Camera) {
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

    handle_slot(m: Slot) {
        const { keys, slot_gfx } = this;

        if (keys[m.idx].isDown) {
            m.key_gfx?.setTint(0xff8800);
            m.seg_gfx?.setAlpha(1);
        } else {
            m.key_gfx?.setTint(0xffffff);
            m.seg_gfx?.setAlpha(0);
        }

        switch (m.state) {
            case slot_state.MOVING_IN:
                if (m.timer-- <= 0) {
                    slot_gfx[m.idx].visible = true;
                    slot_gfx[m.idx].setAngle(Phaser.Math.FloatBetween(-20, 20));
                    slot_gfx[m.idx].play(
                        ["bot1", "sidebot", "blerb", "blerb2", "goop"][m.type],
                    );
                    m.state = slot_state.ALIVE;
                    m.timer = m.life;
                }
                break;
            case slot_state.ALIVE:
                if (keys[m.idx].isDown) {
                    this.handle_whack(m, m.idx);
                }

                // Handle timer
                if (m.timer-- <= 0) {
                    m.state = slot_state.MISSED;
                    if (m.is_baddie()) {
                        this.whacks_missed++;
                        this.health += HP_BOT_MISSED;
                        this.flash();
                        this.sfx.laugh.play();
                    } else {
                        this.sfx.happy.play();
                        this.score += SCORE_GOODY_SURVIVED;
                        this.tweens.add({
                            targets: slot_gfx[m.idx],
                            alpha: 0,
                            duration: 250,
                        });
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
                    slot_gfx[m.idx].alpha = 1;
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
            this.flash();
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

            // How long to show?
            m.life = Math.max(
                this.slot_spawn_life_min,
                this.slot_spawn_life +
                    Phaser.Math.Between(
                        -this.slot_spawn_life_deviation,
                        this.slot_spawn_life_deviation,
                    ),
            );

            const is_sploder =
                Phaser.Math.Between(0, 100) <
                this.slot_spawn_sploder_chance * 100;
            const is_bot =
                Phaser.Math.Between(0, 100) < this.slot_spawn_ai_chance * 100;

            if (is_sploder) {
                m.type = slot_type.SPLODER;
            } else if (is_bot) {
                m.type =
                    Phaser.Math.Between(0, 100) < 50
                        ? slot_type.AI_BOT
                        : slot_type.AI_BOT_SIDE;
            } else {
                m.type =
                    Phaser.Math.Between(0, 100) < 50
                        ? slot_type.BLOB1
                        : slot_type.BLOB2;
            }
        }

        // Update every frame
        this.slot_spawn_chance = Math.min(
            this.slot_spawn_chance_max,
            this.slot_spawn_chance + this.slot_spawn_chance_inc,
        );
        // Get faster each time
        this.slot_spawn_life = Math.max(
            this.slot_spawn_life_min,
            this.slot_spawn_life + this.slot_spawn_life_inc,
        );
    }
}
