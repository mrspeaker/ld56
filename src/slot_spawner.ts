export class SlotSpawner {
    slot_spawn_chance: number;
    slot_spawn_chance_max: number;
    slot_spawn_chance_inc: number;

    slot_spawn_life: number;
    slot_spawn_life_min: number; // minimum time on screen at fastest
    slot_spawn_life_deviation: number; // life +/- deviation
    slot_spawn_life_inc: number; // popup up for less and less time

    constructor() {}
    update() {
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

        // Spawns!
    }
}
