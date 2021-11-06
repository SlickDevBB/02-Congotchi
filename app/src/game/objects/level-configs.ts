// level-configs.ts
// this file defines all the different levels

// upon creation, each grid level should be passed this "levels" config object that defines how to set all the levels up
// the config will be a 2d matrix that defines what element will be in each grid cell initially
// 0 = no grid cell
// 1 = empty grid cell

// 2 = gotchi down
// 3 = gotchi left
// 4 = gotchi up
// 5 = gotchi right

// 6 = portal

// 7 = grenade
// 8 = milkshake

export interface LevelConfig {
    levelNumber: number,
    gridObjectLayout: Array<number[]>,
}

export const levels: Array<LevelConfig> = [
    {
        levelNumber: 1,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 3, 3, 3, 1, 0],
        [0, 1, 5, 5, 2, 1, 4, 1, 0],
        [0, 1, 1, 1, 2, 1, 1, 1, 0],
        [0, 1, 1, 2, 3, 3, 3, 1, 0],
        [0, 1, 1, 2, 1, 1, 1, 1, 0],
        [0, 1, 1, 6, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
    },
    {
        levelNumber: 2,
        gridObjectLayout: [
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 3, 0, 1, 0, 1, 1, 0],
        [0, 1, 1, 0, 1, 0, 2, 1, 0],
        [0, 2, 4, 1, 6, 5, 0, 5, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 1, 2, 1, 2, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
    }
];