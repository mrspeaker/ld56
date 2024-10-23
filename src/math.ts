export const from_center = (
    cx: number,
    cy: number,
    x: number,
    y: number,
    r: number,
) => {
    const a = Phaser.Math.Angle.Between(cx, cy, x, y);
    const bx = Math.cos(a) * r + cx;
    const by = Math.sin(a) * r + cy;
    return new Phaser.Math.Vector2(bx, by);
};
