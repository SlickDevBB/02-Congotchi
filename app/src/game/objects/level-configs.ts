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
    levelDescription: string,
    pos: number[],
    curveApos: number[],
    curveBpos: number[],
}

export const levels: Array<LevelConfig> = [
    {
        levelNumber: 1,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 2, 1, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 0, 7, 6, 8, 0, 0, 0],
        ],
        levelDescription: 
        'Welcome aadventurer! Our frens are lost throughout the REAALM and we need yawr help to save them!' +
        "\n\n" +
        'Tip: Click & drag gotchis into conga lines then open portals to bring them home :)',
        pos: [0.23, 0.65 ],
        curveApos: [],
        curveBpos: [],
    },
    {
        levelNumber: 2,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 3, 3, 5, 0, 0],
        [0, 0, 6, 2, 2, 1, 4, 0, 0],
        [0, 0, 1, 1, 1, 1, 4, 0, 0],
        [0, 0, 1, 1, 1, 5, 5, 0, 0],
        [0, 0, 1, 2, 5, 4, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "Phew! So far so good. The GRID is a bit more dangerous though and you'll need to learn how to rotate." +
        "\n\n" +
        "Tip: Single click on gotchis to help point them in the right direction",
        pos: [0.285, 0.485 ],
        curveApos: [0.24, 0.5],
        curveBpos: [0.285, 0.62],
    },
    {
        levelNumber: 3,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 8, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 8, 1, 1, 0],
        [0, 1, 3, 1, 1, 1, 1, 1, 0],
        [0, 0, 3, 1, 1, 1, 1, 0, 0],
        [0, 0, 4, 1, 2, 2, 4, 0, 0],
        [0, 0, 5, 1, 1, 6, 1, 0, 0],
        [0, 0, 0, 8, 1, 4, 0, 0, 0],
        [0, 0, 1, 3, 8, 3, 2, 0, 0],
        ],
        levelDescription: 
        "The DAARK FOREST beckons... but on the way there, keep yawr eyes peeled for milkshakes!" +
        "\n\n" +
        "Tip: Position shakes next to gotchis and click them to give nearby frens a boost!",
        pos: [0.206, 0.386 ],
        curveApos: [0.24, 0.37],
        curveBpos: [0.288, 0.4],
    },
    {
        levelNumber: 4,
        gridObjectLayout: [
        [0, 0, 0, 0, 7, 7, 0, 0, 0],
        [0, 0, 0, 0, 7, 0, 0, 0, 0],
        [0, 0, 1, 1, 7, 1, 1, 0, 0],
        [0, 7, 3, 1, 2, 4, 1, 1, 0],
        [0, 1, 5, 2, 7, 7, 4, 1, 0],
        [0, 7, 1, 7, 6, 7, 3, 7, 0],
        [0, 1, 1, 4, 7, 8, 1, 4, 0],
        [0, 7, 2, 1, 7, 1, 1, 7, 0],
        [0, 0, 1, 3, 4, 2, 1, 0, 0],
        ],
        levelDescription: 
        "A final test before we enter the DAARK FOREST. This level is littered with grenades!" +
        "\n\n" +
        "Tip: BEFORE you open any portals PLEASE make sure grenades are moved far away from your frens!",
        pos: [0.06, 0.4],
        curveApos: [0.12, 0.47],
        curveBpos: [0.12, 0.4],
    },
    {
        levelNumber: 5,
        gridObjectLayout: [
        [0, 0, 0, 1, 4, 1, 0, 0, 0],
        [0, 0, 1, 3, 1, 7, 1, 0, 0],
        [0, 1, 3, 0, 1, 0, 1, 1, 0],
        [0, 1, 7, 0, 1, 0, 2, 1, 0],
        [0, 2, 4, 1, 6, 5, 8, 5, 0],
        [0, 8, 1, 0, 0, 0, 1, 1, 0],
        [1, 1, 2, 2, 1, 1, 3, 4, 1],
        [0, 1, 1, 1, 2, 3, 2, 1, 0],
        [0, 1, 0, 4, 0, 1, 0, 1, 0],  
        ],
        levelDescription: "The TREE OF FUD! OK fren... no need to panic... it's just a smiling, giant, purple, terrifying, gotchi eating tree..." +
        "\n\n" +
        "Tip: Use all your skills to bring our frens home safely!",
        pos: [0.115, 0.273],
        curveApos: [0.038, 0.2],
        curveBpos: [0.029, 0.279],
    },
    // {
    //     levelNumber: 6,
    //     gridObjectLayout: [
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 7, 1, 1, 1, 8, 0, 0],
    //     [0, 0, 1, 1, 4, 1, 1, 0, 0],
    //     [0, 0, 1, 3, 6, 5, 1, 0, 0],
    //     [0, 0, 1, 1, 2, 1, 1, 0, 0],
    //     [0, 0, 8, 1, 1, 1, 7, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     ],
    //     levelDescription: "A new blank level.... LFG!",
    //     pos: [0.115, 0.200],
    //     curveApos: [0.038, 0.195],
    //     curveBpos: [0.150, 0.250],
    // },
];