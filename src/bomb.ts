export class Bomb extends Phaser.GameObjects.Sprite {
    timer: number;
    charge_time: number;
    constructor(scene: Phaser.Scene, charge_time: number) {
        super(scene, 0, 0, "meta");
        this.visible = false;
        this.x = 100;
        this.y = 40;
        this.timer = 0;
        this.charge_time = charge_time;
    }
    ignite(x: number, y: number, scene: Phaser.Scene) {
        this.timer = this.charge_time;
        this.visible = true;
        this.x = x;
        this.y = y;
        this.scale = 0.75;
        this.play("meta");
        /*scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 300,
            repeat: 0,
            delay: 80,
            ease: "bounce.out",
        });*/
    }
    update() {
        if (this.timer > 0) {
            this.timer--;
            if (this.timer == 0) {
                this.visible = false;
                return false;
            }
        }
        return true;
    }
    explode() {
        return this.timer <= 0;
    }
}
