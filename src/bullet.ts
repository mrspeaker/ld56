export class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "drop");
        this.setScale(0.3);
    }
}
