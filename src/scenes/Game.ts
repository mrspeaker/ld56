import { Bomb } from "../bomb.ts";
import { Cell, BonusCell } from "../cell.ts";
import { Scene } from "phaser";
import { Slot, slot_state, slot_type } from "../slot.ts";
import {
    FONT_FAMILY,
    FONT_PRIMARY_COLOR,
    FONT_PRIMARY_STROKE,
} from "../font.ts";
import { type stats, mk_stats } from "../stats.ts";
import { CellSpawner } from "../cell_spawner.ts";

// Game constants
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

const MAX_CELLS = 50;
const MAX_BOMBS = 30;
const RADIUS = 220;
const NUM_SLOTS = 6;

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

enum game_state {
    PLAYING,
    DEAD,
}

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    bomb_group: Phaser.GameObjects.Group;
    bonus_group: Phaser.GameObjects.Group;
    score_text: Phaser.GameObjects.Text;
    hp_text: Phaser.GameObjects.Text;

    sfx: {
        theme: Phaser.Sound.BaseSound;
        laugh: Phaser.Sound.BaseSound;
        ohno: Phaser.Sound.BaseSound;
        punch: Phaser.Sound.BaseSound;
        splode: Phaser.Sound.BaseSound;
        yell: Phaser.Sound.BaseSound;
        exp: Phaser.Sound.BaseSound;
        exp2: Phaser.Sound.BaseSound;
        happy: Phaser.Sound.BaseSound;
    };

    keys: Phaser.Input.Keyboard.Key[];

    state: game_state;
    state_time: number;

    slots: Slot[];
    cells: Cell[];
    bombs: Bomb[];

    last_flash: number;

    bomb_cooldown: number; // bomb placement cooldown

    stats: stats;

    cell_spawn: CellSpawner;

    slot_spawn_chance: number;
    slot_spawn_chance_max: number;
    slot_spawn_chance_inc: number;

    slot_spawn_ai_chance: number; // between 0-1
    slot_spawn_sploder_chance: number; // between 0-1
    slot_spawn_life: number;
    slot_spawn_life_min: number; // minimum time on screen at fastest
    slot_spawn_life_deviation: number; // life +/- deviation
    slot_spawn_life_inc: number; // popup up for less and less time

    constructor() {
        super("Game");
    }

    init() {
        this.state = game_state.PLAYING;
        this.stats = mk_stats(HP_INITIAL);
        this.bomb_cooldown = 0;

        this.cell_spawn = new CellSpawner(this.spawn_cell.bind(this));

        this.slot_spawn_chance = 0.08;
        this.slot_spawn_chance_max = 10;
        this.slot_spawn_chance_inc = 0.00005;

        this.slot_spawn_life_min = 40;
        this.slot_spawn_life = 100;
        this.slot_spawn_life_deviation = 15; // life +/- deviation
        this.slot_spawn_life_inc = -0.01; // popup up for less and less time

        this.slot_spawn_ai_chance = 0.6;
        this.slot_spawn_sploder_chance = 0.1; // testing this idea

        this.slots = [];
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
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.postFX.addVignette(0.5, 0.5, 0.9, 0.3);
        return this.camera;
    }

    create_sound() {
        const { sound } = this;
        this.sfx = {
            theme: sound.add("theme", { volume: 0.5, loop: true }),
            laugh: sound.add("laugh", { volume: 1 }),
            ohno: sound.add("ohno", { volume: 1 }),
            punch: sound.add("punch", { volume: 1 }),
            splode: sound.add("splode", { volume: 1 }),
            yell: sound.add("yell", { volume: 1 }),
            exp: sound.add("exp", { volume: 1 }),
            exp2: sound.add("exp2", { volume: 0.5 }),
            happy: sound.add("happy", { volume: 0.5 }),
        };
        this.sfx.theme.play();
    }

    create_input() {
        const { input } = this;

        input.setDefaultCursor("url(assets/syr.png), pointer");

        // Dodgy handle escape
        input.keyboard?.addKey(KeyCodes.ESC).on("down", () => {
            if (confirm("Quit?")) {
                this.sfx.theme.stop();
                this.scene.start("MainMenu");
            }
        });

        // Handle key reconfigure via query paramaters, lol
        // eg `?1=a&2=b&...6=space` <- remappable to phaser keys
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
            color: FONT_PRIMARY_COLOR,
            stroke: FONT_PRIMARY_STROKE,
            strokeThickness: 8,
            align: "right",
        };

        this.score_text = this.add.text(392, 15, "0", font);
        this.hp_text = this.add.text(720, 15, "100", font);

        this.add.image(camera.centerX - 200, 40, "score");
        this.add.image(camera.centerX + 150, 40, "hp");
    }

    create_bg(camera: Phaser.Cameras.Scene2D.Camera) {
        const bg = this.add.image(camera.centerX, camera.centerY, "background");
        bg.setAlpha(0.1);
        bg.setDisplaySize(camera.width, camera.height);
        bg.postFX.addVignette(0.5, 0.5, 0.6);
        this.add.circle(camera.centerX, camera.centerY, RADIUS, 0x000000, 0.8);
        this.add.circle(camera.centerX, camera.centerY, RADIUS, 0x7dff7d, 0.1);
    }

    create_fg(camera: Phaser.Cameras.Scene2D.Camera) {
        // Lil light effects
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
        const helpbot = this.add.image(150, 400, "helpbot");
        helpbot.setAlpha(0);

        const helpmouse = this.add.image(870, 400, "helpmouse");
        helpmouse.setAlpha(0);
        helpmouse.setScale(0.8);

        // Fade in and out first help screen
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

        // Fade in and out second help screen
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
        for (let i = 0; i < MAX_CELLS; i++) {
            const cell = new Cell(this, 0, 0);
            cell.visible = false;
            cell.setScale(Phaser.Math.FloatBetween(0.3, 0.8));
            this.cells.push(cell);
            cell_group.add(cell, true);
        }

        this.bomb_group = this.add.group();
        for (let i = 0; i < MAX_BOMBS; i++) {
            const b = new Bomb(this, BOMB_CHARGE_TIME);
            this.bombs.push(b);
            this.bomb_group.add(b, true);
        }

        this.bonus_group = this.add.group();

        // Circular playfield: keys and slots graphics
        const cx = camera.centerX;
        const cy = camera.centerY;
        const TAU = Math.PI * 2;

        for (let i = 0; i < NUM_SLOTS; i++) {
            const slot = new Slot(i);
            this.slots.push(slot);

            // Angle (starting from top left slot)
            const a = (i / NUM_SLOTS) * TAU - Phaser.Math.DegToRad(145);

            // Position the gfx pos for each slot (where character will appear)
            const char_rad = RADIUS - 60;
            slot.char_gfx = this.add.sprite(
                Math.cos(a) * char_rad + cx,
                Math.sin(a) * char_rad + cy,
                "blerb",
            );
            slot.char_gfx.visible = false;

            // Graphics for the key letter around circle
            const key_rad = RADIUS + 20;
            slot.key_gfx = this.add.text(
                Math.cos(a - 0.1) * key_rad + cx,
                Math.sin(a - 0.1) * key_rad + cy,
                "QWEDSA".split("")[i],
                {
                    fontFamily: FONT_FAMILY,
                    fontSize: 18,
                    color: FONT_PRIMARY_COLOR,
                },
            );

            // Segment arc around circle
            const arc = this.add.graphics();
            arc.lineStyle(4, 0x7dff7d, 0.4);
            arc.beginPath();
            const start = Math.PI + (i / NUM_SLOTS) * TAU;
            arc.arc(cx, cy, RADIUS, start, start + TAU / NUM_SLOTS);
            arc.strokePath();
            arc.alpha = 0;
            slot.seg_gfx = arc;
        }
    }

    draw_score() {
        const { score_text, hp_text, stats } = this;
        const { score, health } = stats;
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
        target.x -= Math.cos(a) * (RADIUS - 20);
        target.y -= Math.sin(a) * (RADIUS - 20);
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
        const { bonus_group, bombs, camera, cells, slots, stats } = this;

        // Update cells
        cells.forEach((c) => {
            if (c.update()) {
                // Made it to the target
                stats.health += HP_CELL_ESCAPED;
                stats.cells_escaped++;
                this.sfx.exp.play();
                c.visible = false;
            }
        });

        this.cell_spawn.update();

        const bonuses = bonus_group.getChildren().map((c) => c as BonusCell);

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
                    if (!c.visible) return;
                    const d = Phaser.Math.Distance.Between(b.x, b.y, c.x, c.y);
                    if (d < BOMB_EXPLOSION_RADIUS) {
                        c.remove();
                        stats.score += SCORE_CELL_KILL;
                        stats.cells_killed++;
                        this.sfx.exp2.play();
                    }
                });
                // And trigger any nearby bonuses too.
                bonuses.forEach((c) => {
                    const d = Phaser.Math.Distance.Between(b.x, b.y, c.x, c.y);
                    if (d < BOMB_EXPLOSION_RADIUS) {
                        c.alive = false;
                    }
                });
            }
        });

        bonuses.forEach((b) => {
            if (b.update()) {
                // triggered: do bonus!
                this.sfx.exp.play();
                b.destroy();
                this.explode_all_cells();
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
            if (dist >= RADIUS * 0.85) {
                // Drop a bomba!
                this.bomb_cooldown = BOMB_COOLDOWN;
                this.sfx.splode.play();
                const b = this.bombs.find((b) => b.explode());
                if (b) {
                    b.ignite(pointer.position.x, pointer.position.y);
                }
            }
        }

        // Update slots
        slots.forEach((m) => this.handle_slot(m));

        // Spawn any new slots
        this.spawn_slots();

        // HP
        if (stats.health > 100) stats.health = 100;
        if (stats.health <= 0) {
            stats.health = 0;
            this.sfx.theme.stop();
            this.state = game_state.DEAD;
            this.state_time = 0;
        }

        // Get redder as get dead-er
        camera.backgroundColor.red =
            stats.health > 50 ? 0 : ((50 - stats.health) / 50) * 40;
    }

    update_dead() {
        if (this.state_time === 1) {
            this.flash();
            this.sfx.punch.play();
        }
        if (this.state_time++ < 100) {
            return;
        }
        this.scene.start("GameOver", this.stats);
    }

    explode_all_cells() {
        const { stats } = this;
        // Destroy the entire cell wave
        this.cells.forEach((c) => {
            if (!c.visible) return;
            stats.score += SCORE_CELL_KILL;
            stats.cells_killed++;
            c.remove();
        });
    }

    spawn_cell(speed: number) {
        const { cells, camera } = this;
        const c = cells.find((c) => c.target == null);
        if (c) {
            c.visible = true;
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
            c.x = (Math.cos(a) * camera.width) / 2 + camera.centerX;
            c.y = (Math.sin(a) * camera.height) / 2 + camera.centerY;
            c.target = this.get_cell_target(c.x, c.y);
            c.speed = speed;
        }
    }

    handle_slot(m: Slot) {
        const { keys, stats } = this;

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
                    m.char_gfx?.setVisible(true);
                    m.char_gfx?.setAngle(Phaser.Math.FloatBetween(-20, 20));
                    m.char_gfx?.play(
                        ["bot1", "sidebot", "blerb", "blerb2", "goop"][m.type],
                    );
                    m.state = slot_state.ALIVE;
                    m.timer = m.life;
                }
                break;
            case slot_state.ALIVE:
                if (keys[m.idx].isDown) {
                    this.handle_whack(m);
                }

                // Slot timer
                if (m.timer-- <= 0) {
                    m.state = slot_state.MISSED;
                    if (m.is_baddie()) {
                        stats.whacks_missed++;
                        stats.health += HP_BOT_MISSED;
                        this.flash();
                        this.sfx.laugh.play();
                    } else {
                        stats.score += SCORE_GOODY_SURVIVED;
                        this.sfx.happy.play();
                        this.tweens.add({
                            targets: m.char_gfx,
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
                m.char_gfx?.setFlipY(true);
                m.state = slot_state.MOVING_OUT;
                m.timer = 25;
                break;
            case slot_state.MOVING_OUT:
                if (m.timer-- <= 0) {
                    m.state = slot_state.EMPTY;
                    m.char_gfx?.setVisible(false);
                    m.char_gfx?.setFlipY(false);
                    m.char_gfx?.setAlpha(1);
                }
                break;
            default:
                break;
        }
    }

    handle_whack(m: Slot) {
        const { camera, stats } = this;

        m.state = slot_state.WHACKED;

        const hit_gfx = this.add
            .sprite(m.char_gfx?.x ?? 0, m.char_gfx?.y ?? 0, "hit")
            .play("hit", false)
            .once("animationcomplete", () => {
                hit_gfx.destroy();
            });
        camera.shake(100, 0.01);

        this.sfx.punch.play();

        if (m.is_baddie()) {
            // score!
            stats.score += SCORE_BOT_KILL;
            stats.health += HP_BOT_KILL;
            stats.whacks_good++;
            m.char_gfx?.play("bot1_die");

            this.sfx.yell.play();
        } else if (m.type == slot_type.SPLODER) {
            console.log("Timer:", m.timer);
            if (m.timer < 52 && m.timer > 10) {
                //nope  spawn clearer cells...
                //this.spawn_clearer(m.idx);
                this.explode_all_cells();
            }
        } else {
            // brrrrp!
            stats.health += HP_FRIENDLY_FIRE;
            stats.whacks_bad++;
            m.char_gfx?.setVisible(false);
            this.flash();
            this.sfx.ohno.play();
        }
    }

    spawn_clearer(slot_idx: number) {
        // make a "clearer" pickup
        console.log("add a clearer near slot", slot_idx);

        const w = Phaser.Math.Between(0, this.camera.width);
        const h = Phaser.Math.Between(0, this.camera.height);
        const c = new BonusCell(this, w, h);
        this.bonus_group.add(c, true);
    }

    spawn_slots() {
        const { slots } = this;

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

        // Spawn someone?
        if (!(Phaser.Math.Between(0, 1000) < this.slot_spawn_chance * 100)) {
            return;
        }

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
            Phaser.Math.Between(0, 100) < this.slot_spawn_sploder_chance * 100;
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
}
