export enum cell_type {
    CELL,
    CLEARER,
}

export class Cell extends Phaser.GameObjects.Sprite {
    target: Phaser.Geom.Point | null;
    speed: number;
    cell_type: cell_type.CELL;
    radius: number;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "drop");
        this.cell_type = cell_type.CELL;
        this.speed = Phaser.Math.FloatBetween(0.13, 0.25);
        this.angle = Phaser.Math.Angle.RandomDegrees();
        this.playAfterDelay("drop", Phaser.Math.Between(0, 1500));
    }
    remove() {
        this.target = null;
        this.visible = false;
    }
    // REturns true if cell got to target
    update(): boolean {
        if (!this.target) {
            return false;
        }
        const { target, speed } = this;
        const a = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.x += Math.cos(a) * speed;
        this.y += Math.sin(a) * speed;
        this.angle += 0.5;

        const d = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            target.x,
            target.y,
        );
        if (d < 10) {
            this.target = null;
            return true;
        }
        return false;
    }
}

export class BonusCell extends Phaser.GameObjects.Sprite {
    cell_type: cell_type;
    alive: boolean;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "drop");
        this.cell_type = cell_type.CLEARER;
        this.alive = true;
        this.playAfterDelay("drop", Phaser.Math.Between(0, 1500));
        this.setTintFill(0xff5500);
        this.radius = 30; // ... how do the scales get set?
        this.setScale(0.6);
    }
    // REturns true if cell got to target
    update(): boolean {
        this.y += Math.sin(Date.now() / 1000) * 0.1;
        return !this.alive;
    }
}
