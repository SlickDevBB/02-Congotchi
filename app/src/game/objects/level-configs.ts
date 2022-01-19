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

// 12, 22, 32, 42, 52, 62 = common, uncommon, rare, legendary, mythical, godlike DOWN rofls respectively
// 13, 23, 33, 43, 53, 63 = common, uncommon, rare, legendary, mythical, godlike LEFT rofls respectively
// 14, 24, 34, 44, 54, 64 = common, uncommon, rare, legendary, mythical, godlike UP rofls respectively
// 15, 25, 35, 45, 55, 65 = common, uncommon, rare, legendary, mythical, godlike RIGHT rofls respectively

export interface LevelConfig {
    levelNumber: number,
    gridObjectLayout: Array<number[]>,
    levelDescription: string,
    pos: number[],
    curveThisPos: number[],
    curvePrevPos: number[],
}

export const levels: Array<LevelConfig> = [
    // {
    //     levelNumber: XX,
    //     gridObjectLayout: [
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 1, 1, 1, 1, 1, 0, 0],
    //     [0, 0, 1, 1, 1, 1, 1, 0, 0],
    //     [0, 0, 1, 1, 1, 1, 1, 0, 0],
    //     [0, 0, 1, 1, 1, 1, 1, 0, 0],
    //     [0, 0, 1, 1, 1, 1, 1, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     ],
    //     levelDescription: "A new blank level.... LFG!",
    //     pos: [0.XXX, 0.XXX],
    //     curveThisPos: [0.XXX, 0.XXX],
    //     curvePrevPos: [0.XXX, 0.XXX],
    // },
    {
        
        // 1: Introduce players to moving grid objects around
        levelNumber: 1,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 6, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        'Welcome aadventurer! Our frens are lost throughout the REAALM & we need yawr help to save them!' +
        "\n\n" +
        'CLICK & DRAG gotchis into conga lines then OPEN PORTALS to bring them home :)',
        pos: [0.23, 0.65 ],
        curveThisPos: [],
        curvePrevPos: [],
    },
    {
        // 2: Introduce players to rotating gotchis (and multi portal entry)
        levelNumber: 2,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 6, 5, 3, 3, 0, 0],
        [0, 0, 1, 4, 1, 1, 1, 0, 0],
        [0, 0, 1, 3, 1, 1, 1, 0, 0],
        [0, 0, 1, 4, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "Phew! So far so good. The GRID is a bit more dangerous though & you'll need to learn how to ROTATE." +
        "\n\n" +
        "SINGLE CLICK on gotchis to help point them in the right direction.",
        pos: [0.258, 0.480 ],
        curveThisPos: [0.25, 0.49],
        curvePrevPos: [0.285, 0.62],
    },
    {
        // 3: Introduction to stat changes
        levelNumber: 3,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 6, 0, 0],
        [0, 5, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 2, 1, 0, 0],
        [0, 0, 2, 1, 1, 2, 1, 0, 0],
        [0, 0, 2, 1, 1, 2, 1, 0, 0],
        [0, 0, 1, 4, 1, 1, 1, 5, 0],
        [0, 0, 6, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "Keep an eye on your 8 coloured stat circles at the bottom of each level." +
        "\n\n" +
        "Each MOVE (click & drag) or INTERACT (single click) of an object reduces the corresponding coloured stat.",
        pos: [0.181, 0.375 ],
        curveThisPos: [0.204, 0.418],
        curvePrevPos: [0.262, 0.395],
    },
    {
        // 4: Introduction to milkshakes and gotchi point system
        levelNumber: 4,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 3, 1, 1, 1, 0],
        [0, 1, 3, 1, 8, 8, 1, 1, 0],
        [0, 0, 3, 1, 1, 1, 1, 0, 0],
        [0, 0, 4, 1, 2, 2, 4, 0, 0],
        [0, 0, 5, 1, 1, 6, 1, 0, 0],
        [0, 0, 0, 1, 1, 4, 0, 0, 0],
        [0, 0, 1, 3, 8, 3, 2, 0, 0],
        ],
        levelDescription: 
        "MILKSHAKES! Single click shakes that are next to gotchis for a point boost." +
        "\n\n" +
        "Each gotchis' points get added to your total when portalling. Make long conga lines for even moar!",
        pos: [0.06, 0.4],
        curveThisPos: [0.12, 0.44],
        curvePrevPos: [0.1, 0.4],
    },
    {
        // Introduction to getting at least one star to progress
        levelNumber: 5,
        gridObjectLayout: [
        [0, 0, 0, 1, 4, 1, 0, 0, 0],
        [0, 0, 1, 3, 1, 1, 1, 0, 0],
        [0, 1, 3, 0, 8, 0, 1, 1, 0],
        [0, 1, 2, 0, 2, 0, 2, 1, 0],
        [0, 2, 4, 1, 6, 5, 8, 5, 0],
        [0, 8, 1, 0, 0, 0, 1, 1, 0],
        [1, 1, 2, 2, 1, 1, 3, 4, 1],
        [0, 1, 1, 1, 2, 3, 2, 1, 0],
        [0, 1, 0, 4, 0, 8, 0, 1, 0],  
        ],
        levelDescription: "The TREE OF FUD! Don't panic.. it's just a giant, smiling, terrifying  tree.." +
        "\n\n" +
        "This is a toughie but saving at least 33% of your frens in levels still allows you to progress.",
        pos: [0.115, 0.273],
        curveThisPos: [0.075, 0.289],
        curvePrevPos: [0.037, 0.336],
    },
    {
        // 6: Introduction to grenades
        levelNumber: 6,
        gridObjectLayout: [
        [0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 1, 1, 7, 2, 1, 1, 1, 0],
        [0, 1, 1, 1, 2, 1, 1, 1, 0],
        [0, 1, 1, 1, 4, 1, 1, 1, 0],
        [0, 5, 5, 5, 5, 5, 6, 1, 0],
        [0, 1, 1, 7, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 7, 1, 1, 0, 0],
        ],
        levelDescription: "Ahh! The mounta... STOP! There's grenades here???" +
        "\n\n" +
        "MOVE grenades away from conga lines before portalling or you'll need to MOVE or ROTATE gotchis to rid them of soot.",
        // "DO NOT conga if your gotchi line is near grenades or you'll need to MOVE/ROTATE gotchis to shake off the soot.",
        pos: [0.04, 0.232],
        curveThisPos: [0.044, 0.261],
        curvePrevPos: [0.088, 0.259],
    },
    {
        // Introduction to grenade chains
        levelNumber: 7,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 6, 0, 0, 0, 0],
        [0, 0, 0, 1, 7, 1, 0, 0, 0],
        [0, 0, 2, 1, 1, 1, 7, 0, 0],
        [0, 1, 2, 7, 1, 7, 1, 1, 0],
        [1, 1, 2, 1, 1, 4, 1, 1, 1],
        [1, 1, 1, 1, 1, 4, 1, 1, 1],
        [1, 1, 1, 5, 5, 5, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: "We've been floating for aaaages... are we at NORTH BEACH yet? Ooh moar grenades!" +
        "\n\n" +
        "SINGLE CLICK grenades to detonate them. Try get an ebic chain reaction to clear the path to the portal!",
        pos: [0.086, 0.145],
        curveThisPos: [0.04, 0.06],
        curvePrevPos: [0.03, 0.178],
    },
    {
        // 8: Introduction to rofls
        levelNumber: 8,
        gridObjectLayout: [
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
        [ 0,  0,  0,  0,  0,  0,  1,  1,  1],
        [ 0,  0,  1, 15,  1,  1,  1,  1,  1],
        [ 0,  0,  1, 12,  1, 12, 14,  0,  0],
        [ 0,  0, 13,  2,  1, 13,  1,  0,  0],
        [ 0,  0,  1,  6,  1,  4,  1,  0,  0],
        [ 1,  1,  1,  1,  1,  1,  1,  0,  0],
        [ 1,  1,  1,  0,  0,  0,  0,  0,  0],
        [ 1,  1,  1,  0,  0,  0,  0,  0,  0],
        ],
        levelDescription: "Ahh here we are... NORTH BEACH. A pebbles throw from ROFL REEF." +
        "\n\n" +
        "ROFLs move, rotate & conga home like gotchis. They're worth moar points but can be tricky to save..",
        pos: [0.16, 0.075],
        curveThisPos: [0.105, 0.095],
        curvePrevPos: [0.085, 0.123],
    },
    {
        // 9: Introduction to cactii
        levelNumber: 9,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 6, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: "Ouch! Don't step on the.. ouch! cact.. OUUUUUUCH!!!" +
        "\n\n" +
        "If your gotchis conga past CACTII they'll lose points. Move CACTII away or single click CACTII to uproot them safely.",
        pos: [0.177, 0.145],
        curveThisPos: [0.18, 0.111],
        curvePrevPos: [0.23, 0.085],
    },
    {
        levelNumber: 10,
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
        levelDescription: "I swear to god... one more level with a gotchi eating tree..." +
        "\n\n" +
        "This level has a bit of everything. Use all your skills to escape the forest for good!",
        pos: [0.167, 0.272],
        curveThisPos: [0.19, 0.23],
        curvePrevPos: [0.165, 0.185],
    },
];