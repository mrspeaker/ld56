export enum slot_type {
    AI_BOT,
    AI_BOT_SIDE,
    BLOB1,
    BLOB2,
    SPLODER,
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
    char_gfx: Phaser.GameObjects.Sprite | null;
    key_gfx: Phaser.GameObjects.Text | null;
    seg_gfx: Phaser.GameObjects.Graphics | null;

    onMiss: (idx: number, is_bot: boolean) => void;

    constructor(idx: number, onMiss: (idx: number, is_bot: boolean) => void) {
        this.state = slot_state.EMPTY;
        this.timer = 0;
        this.idx = idx;
        this.life = 0;

        this.onMiss = onMiss;
    }

    is_baddie() {
        return (
            this.type == slot_type.AI_BOT || this.type == slot_type.AI_BOT_SIDE
        );
    }

    update(is_press: boolean) {
        const { char_gfx, key_gfx, seg_gfx, state, type, idx } = this;

        if (is_press) {
            key_gfx?.setTint(0xff8800);
            seg_gfx?.setAlpha(1);
        } else {
            key_gfx?.setTint(0xffffff);
            seg_gfx?.setAlpha(0);
        }

        switch (state) {
            case slot_state.MOVING_IN:
                if (this.timer-- <= 0) {
                    char_gfx?.setVisible(true);
                    char_gfx?.setAngle(Phaser.Math.FloatBetween(-20, 20));
                    char_gfx?.play(
                        ["bot1", "sidebot", "blerb", "blerb2", "goop"][type],
                    );
                    this.state = slot_state.ALIVE;
                    this.timer = this.life;
                }
                break;
            case slot_state.ALIVE:
                if (this.timer-- <= 0) {
                    this.state = slot_state.MISSED;
                    this.onMiss(idx, this.is_baddie());
                }
                break;
            case slot_state.WHACKED:
                this.state = slot_state.MOVING_OUT;
                this.timer = 25;
                break;
            case slot_state.MISSED:
                char_gfx?.setFlipY(true);
                this.state = slot_state.MOVING_OUT;
                this.timer = 25;
                break;
            case slot_state.MOVING_OUT:
                if (this.timer-- <= 0) {
                    this.state = slot_state.EMPTY;
                    char_gfx?.setVisible(false);
                    char_gfx?.setFlipY(false);
                    char_gfx?.setAlpha(1);
                }
                break;
            default:
                break;
        }
    }
}
