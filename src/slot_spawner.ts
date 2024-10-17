import { slot_type } from "./slot";

export class SlotSpawner {
    spawn_chance: number;
    spawn_chance_max: number;
    spawn_chance_inc: number;

    life: number;
    life_min: number; // minimum time on screen at fastest
    life_deviation: number; // life +/- deviation
    life_inc: number; // popup up for less and less time

    spawn_ai_chance: number; // between 0-1
    spawn_sploder_chance: number; // between 0-1

    constructor() {
        this.spawn_chance = 0.08;
        this.spawn_chance_max = 10;
        this.spawn_chance_inc = 0.00005;

        this.life_min = 40;
        this.life = 100;
        this.life_deviation = 15; // life +/- deviation
        this.life_inc = -0.01; // popup up for less and less time

        this.spawn_ai_chance = 0.6;
        this.spawn_sploder_chance = 0.1; // testing this idea
    }

    // Returns true if time to spawn.
    update() {
        // Update every frame
        this.spawn_chance = Math.min(
            this.spawn_chance_max,
            this.spawn_chance + this.spawn_chance_inc,
        );

        // Get faster each time
        this.life = Math.max(this.life_min, this.life + this.life_inc);

        // Spawn someone?
        if (!(Phaser.Math.Between(0, 1000) < this.spawn_chance * 100)) {
            return false;
        }

        // Spawns!
        return true;
    }

    // How long spawn slot lives for
    // Gets shorter as the game progresses
    get_life() {
        return Math.max(
            this.life_min,
            this.life +
                Phaser.Math.Between(-this.life_deviation, this.life_deviation),
        );
    }

    get_type() {
        const is_sploder =
            Phaser.Math.Between(0, 100) < this.spawn_sploder_chance * 100;
        const is_bot = Phaser.Math.Between(0, 100) < this.spawn_ai_chance * 100;

        if (is_sploder) {
            return slot_type.SPLODER;
        } else if (is_bot) {
            return Phaser.Math.Between(0, 100) < 50
                ? slot_type.AI_BOT
                : slot_type.AI_BOT_SIDE;
        }
        // It's a friendly blob
        return Phaser.Math.Between(0, 100) < 50
            ? slot_type.BLOB1
            : slot_type.BLOB2;
    }
}
