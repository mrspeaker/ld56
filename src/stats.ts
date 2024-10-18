export type stats = {
    score: number;
    score_highest: number;
    health: number;
    whacks_good: number;
    whacks_bad: number;
    whacks_missed: number;
    cells_killed: number;
    cells_escaped: number;
    cell_combo: number;
    cell_combo_longest: number;
};

export const mk_stats = (health = 0) => ({
    score: 0,
    score_highest: 0,
    health,
    whacks_good: 0,
    whacks_bad: 0,
    whacks_missed: 0,
    cells_killed: 0,
    cells_escaped: 0,
    cell_combo: 0,
    cell_combo_longest: 0,
});
