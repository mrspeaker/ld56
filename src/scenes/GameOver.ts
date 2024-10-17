import { Scene } from "phaser";
import { FONT_FAMILY, FONT_PRIMARY_COLOR } from "../font.ts";

type gameover_data = {
    score: number;
    whacks_good: number;
    whacks_bad: number;
    whacks_missed: number;
    cells_killed: number;
    cells_escaped: number;
};

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;
    stats_text: Phaser.GameObjects.Text;

    stats: gameover_data;
    cooldown: number;

    constructor() {
        super("GameOver");
    }

    init(data: gameover_data) {
        this.stats = data;
        this.cooldown = 100;
    }

    update() {
        this.cooldown--;
    }

    create() {
        const { cameras, stats } = this;
        const {
            score,
            whacks_good,
            whacks_bad,
            whacks_missed,
            cells_killed,
            cells_escaped,
        } = stats;

        cameras.main.setBackgroundColor(0x000000);

        this.sound.add("yell", { volume: 1 }).play();

        this.add.image(512, 300, "gameover");

        const font = {
            fontFamily: FONT_FAMILY,
            fontSize: 64,
            color: FONT_PRIMARY_COLOR,
            align: "center",
        };

        this.gameover_text = this.add
            .text(512, 398, score.toFixed(0), font)
            .setOrigin(0.5);
        this.tweens.add({
            targets: this.gameover_text,
            scale: 1.2,
            ease: "Sine.easeInOut",
            yoyo: true,
            duration: 2000,
            repeat: -1,
        });

        this.gameover_text.setOrigin(0.5);

        const total_whacks = Math.max(1, whacks_good + whacks_missed);
        const total_cells = Math.max(1, cells_killed + cells_escaped);
        const perc = whacks_good / total_whacks;
        const perc_cells = cells_killed / total_cells;

        this.stats_text = this.add.text(
            700,
            370,
            `bots destroyed: ${Math.round(perc * 100)}%
cells destroyed: ${Math.round(perc_cells * 100)}%
good guys killed: ${whacks_bad}`,
            { ...font, fontSize: 20 },
        );

        this.input.on("pointerdown", () => {
            if (this.cooldown <= 0) {
                this.scene.start("MainMenu");
            }
        });
        this.input.keyboard
            ?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
            .on("down", () => {
                if (this.cooldown <= 0) {
                    this.scene.start("MainMenu");
                }
            });
    }
}
