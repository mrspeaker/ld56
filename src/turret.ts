export class Turret extends Phaser.GameObjects.Sprite {
    cooldown: number;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "drop");
    }
    update(
        targets: Phaser.GameObjects.Sprite[],
    ): Phaser.GameObjects.Sprite | null {
        this.x += 0.05;
        if (this.cooldown-- > 0) {
            return null;
        }
        // Find closest target
        let closest = -1;
        let closest_distance = 99999;
        for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            const d = Phaser.Math.Distance.Between(this.x, this.y, t.x, t.y);
            if (d < closest_distance) {
                closest_distance = d;
                closest = i;
            }
        }

        if (closest_distance < 200) {
            this.cooldown = 200;
            return targets[closest] || null;
        }
        return null;
    }
}
