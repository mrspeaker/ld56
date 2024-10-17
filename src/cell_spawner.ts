export class CellSpawner {
    timer: number;
    rate: number;
    rate_inc: number;
    rate_fastest: number;
    speed_base: number;
    speed_inc: number;

    on_spawn: (speed: number) => void;

    constructor(on_spawn: (speed: number) => void) {
        this.timer = 500; // initial delay
        this.rate = 110; // spawn 1 every X ticks to start
        this.rate_inc = -1.8; // every spawn, reduce rate
        this.rate_fastest = 30; // fastest spawn rate
        this.speed_base = 0.35; // base speed of new cells
        this.speed_inc = 0.01; // how much faster each subsequent cell gets

        this.on_spawn = on_spawn;
    }

    update() {
        if (this.timer-- > 0) {
            return;
        }
        this.on_spawn(this.speed_base);
        this.speed_base += this.speed_inc;
        // Spawn faster each new cell
        this.timer = this.rate;
        this.rate = Math.max(this.rate_fastest, this.rate + this.rate_inc);
    }
}
