export type stats = {
    score: number;
    health: number;
    whacks_good: number;
    whacks_bad: number;
    whacks_missed: number;
    cells_killed: number;
    cells_escaped: number;
};

export const mk_stats = (health = 0) => ({
    score: 0,
    health,
    whacks_good: 0,
    whacks_bad: 0,
    whacks_missed: 0,
    cells_killed: 0,
    cells_escaped: 0,
});
