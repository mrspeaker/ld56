export class Cell extends Phaser.GameObjects.Sprite {
    target: Phaser.Geom.Point | null;
    speed: number;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "drop");
        this.setInteractive();
        this.speed = Phaser.Math.FloatBetween(0.13, 0.25);
        this.angle = Phaser.Math.Angle.RandomDegrees();
        this.setScale(0.65);
    }
    update() {
        if (!this.target) {
            return;
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
        }
    }
}
