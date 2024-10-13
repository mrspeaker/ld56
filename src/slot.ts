export enum slot_type {
    AI_BOT,
    BLOB1,
    BLOB2,
}

export enum slot_state {
    EMPTY,
    MOVING_IN,
    ALIVE,
    WHACKED,
    MISSED,
    MOVING_OUT,
}

export class Slot {
    type: slot_type;
    state: slot_state;
    timer: number;
    life: number;
    idx: number;
    key_gfx: Phaser.GameObjects.Text | null;
    seg_gfx: Phaser.GameObjects.Graphics | null;
    constructor(idx: number) {
        this.state = slot_state.EMPTY;
        this.timer = 0;
        this.idx = idx;
        this.life = 0;
    }

    is_baddie() {
        return this.type == slot_type.AI_BOT;
    }
}
