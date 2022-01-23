// level-configs.ts
// this file defines all the different levels

// upon creation, each grid level should be passed this "levels" config object that defines how to set all the levels up
// the config will be a 2d matrix that defines what element will be in each grid cell initially

// 0 = no grid cell
// 1 = empty grid cell

// 2 = gotchi (direction randomly assigned but doesn't matter in game)

// 3 = portal (always open)
// 4 = 

// 6 = portal

// 7 = grenade
// 8 = milkshake
// 9 = cactii

// 11 = common rofl
// 12 = uncommon rofl
// 13 = rare rofl
// 14 = legendary rofl
// 15 = mythical rofl
// 16 = godlike rofl

export interface LevelConfig {
    levelNumber: number,
    gridObjectLayout: Array<number[]>,
    levelDescription: string,
    pos: number[],
    curveThisPos: number[],
    curvePrevPos: number[],
    actionsRemaining: number,
    statMask: {spareMove: number, congaJump: number, greenActivate: number, redActivate: number, 
        redDamage: number, greenBuff: number, gotchiSave: number, portalOpen: number}
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
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 3, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        'Welcome aadventurer! Our frens have been blockified throughout the REAALM & need saving!' +
        "\n\n" +
        'CLICK & DRAG gotchis into conga lines then SINGLE CLICK portals to bring them home :)',
        pos: [0.23, 0.65 ],
        curveThisPos: [],
        curvePrevPos: [],
        actionsRemaining: 10,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 2: Introduce players to rotating gotchis (and multi portal entry)
        levelNumber: 2,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 3, 1, 2, 2, 2, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "Phew! So far so good. The GRID is a bit more dangerous though & you'll need to learn how to rotate." +
        "\n\n" +
        "SINGLE CLICK on gotchis to help point them in the right direction.",
        pos: [0.258, 0.480 ],
        curveThisPos: [0.25, 0.49],
        curvePrevPos: [0.285, 0.62],
        actionsRemaining: 10,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 3: Introduction to stat changes
        levelNumber: 3,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 3, 0, 0],
        [0, 2, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 2, 1, 0, 0],
        [0, 0, 2, 1, 1, 2, 1, 0, 0],
        [0, 0, 2, 1, 1, 2, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 2, 0],
        [0, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "Wow! You unlocked two POINT SPHERES! These will hover near your gotchi while you solve levels :)" +
        "\n\n" +
        "These two spheres show the points you get for saving gotchis and opening portals.",
        pos: [0.181, 0.375 ],
        curveThisPos: [0.204, 0.418],
        curvePrevPos: [0.262, 0.395],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 4: Introduction to milkshakes and gotchi point system
        levelNumber: 4,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 2, 1, 1, 1, 1, 0],
        [0, 1, 2, 1, 4, 4, 1, 1, 0],
        [0, 0, 2, 1, 1, 1, 1, 0, 0],
        [0, 0, 2, 1, 2, 2, 1, 0, 0],
        [0, 0, 2, 1, 1, 1, 3, 0, 0],
        [0, 0, 0, 1, 1, 2, 0, 0, 0],
        [0, 0, 1, 2, 2, 2, 2, 0, 0],
        ],
        levelDescription: 
        "Milkshakes! And two moar POINT SPHERES for green blocks this time!" +
        "\n\n" +
        "SINGLE CLICK green block items for points. For milkshakes, click them next to gotchis for moar points!",
        pos: [0.06, 0.4],
        curveThisPos: [0.12, 0.44],
        curvePrevPos: [0.1, 0.4],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // Introduction to getting at least one star to progress
        levelNumber: 5,
        gridObjectLayout: [
        [0, 0, 0, 1, 2, 1, 0, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 1, 2, 0, 4, 0, 1, 1, 0],
        [0, 1, 2, 0, 1, 0, 2, 1, 0],
        [0, 2, 2, 1, 3, 1, 2, 2, 0],
        [0, 8, 1, 0, 0, 0, 1, 1, 0],
        [4, 1, 2, 2, 1, 1, 2, 1, 4],
        [0, 1, 1, 1, 2, 2, 2, 1, 0],
        [0, 1, 0, 4, 0, 2, 0, 1, 0],  
        ],
        levelDescription: "The TREE OF FUD! It sure looks... friendly?" +
        "\n\n" +
        "Saving 33% of your frens still allows you to progress. Leftover moves are worth points though as shown on this new POINT SPHERE!",
        pos: [0.115, 0.273],
        curveThisPos: [0.075, 0.289],
        curvePrevPos: [0.037, 0.336],
        actionsRemaining: 25,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 6: Introduction to grenades
        levelNumber: 6,
        gridObjectLayout: [
        [0, 0, 0, 0, 1, 8, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 1, 1, 5, 2, 1, 1, 2, 0],
        [0, 1, 1, 1, 2, 1, 1, 2, 0],
        [0, 1, 1, 1, 2, 1, 1, 1, 0],
        [0, 2, 2, 2, 2, 1, 3, 1, 0],
        [0, 1, 1, 5, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 5, 1, 1, 0, 0],
        ],
        levelDescription: "Mmm! The mounta... STOP! There's grenades here???" +
        "\n\n" +
        "CLICK & DRAG grenades away from conga lines before portalling or you'll need to MOVE or ROTATE gotchis to rid them of soot.",
        // "DO NOT conga if your gotchi line is near grenades or you'll need to MOVE/ROTATE gotchis to shake off the soot.",
        pos: [0.04, 0.232],
        curveThisPos: [0.044, 0.261],
        curvePrevPos: [0.088, 0.259],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // Introduction to grenade chains
        levelNumber: 7,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 5, 1, 5, 1, 5, 0, 0],
        [0, 0, 1, 1, 1, 1, 5, 0, 0],
        [0, 1, 2, 2, 1, 5, 1, 1, 0],
        [1, 1, 2, 1, 1, 2, 1, 1, 1],
        [1, 5, 1, 1, 1, 2, 1, 2, 2],
        [1, 2, 1, 2, 2, 2, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: "We've been floating for aaaages... are we at NORTH BEACH yet? Ooh moar grenades and a red POINT SPHERE!" +
        "\n\n" +
        "SINGLE CLICK grenades to detonate them. Be wary of chain reactions!",
        pos: [0.086, 0.145],
        curveThisPos: [0.04, 0.06],
        curvePrevPos: [0.03, 0.178],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 8: Introduction to rofls
        levelNumber: 8,
        gridObjectLayout: [
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
        [ 0,  0,  0,  0,  0,  0, 1, 11,  11],
        [ 0,  0,  1,  2,  1,  1,  1,  1,  1],
        [ 0,  0,  1,  2,  2,  2,  2,  0,  0],
        [ 0,  0,  2,  1,  1,  2,  1,  0,  0],
        [ 0,  0,  1,  3,  1,  2,  1,  0,  0],
        [ 1,  1,  7,  1,  2,  2, 11,  0,  0],
        [ 1, 11,  1,  0,  0,  0,  0,  0,  0],
        [ 1,  1,  1,  0,  0,  0,  0,  0,  0],
        ],
        levelDescription: "Ahh here we are... NORTH BEACH! A pebbles throw from ROFL REEF..." +
        "\n\n" +
        "ROFLs move, rotate & conga home like gotchis. They're worth moar points but can be tricky to save..",
        pos: [0.16, 0.075],
        curveThisPos: [0.105, 0.095],
        curvePrevPos: [0.085, 0.123],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 9: Introduction to cactii
        levelNumber: 9,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0,  1, 1, 0],
        [0, 0, 0, 0, 0, 1, 11, 1, 1],
        [0, 0, 1, 1, 0, 9,  2, 1, 1],
        [0, 2, 1, 1, 1, 1,  2, 1, 0],
        [1, 2, 6, 6, 1, 1,  1, 0, 0],
        [1, 2, 1, 2, 2, 2,  2, 0, 0],
        [1, 1, 1, 1, 6, 2,  1, 0, 0],
        [0, 2, 1, 1, 0, 1,  3, 1, 0],
        [0, 0, 0, 0, 0, 0,  1, 0, 0],
        ],
        levelDescription: "Ouch! Don't conga past the cact.. OUCH!!" +
        "\n\n" +
        "Red block items can deduct points. Here's a new red POINT SPHERE to show how much. SINGLE CLICK cactii to uproot them safely.",
        pos: [0.177, 0.145],
        curveThisPos: [0.18, 0.111],
        curvePrevPos: [0.23, 0.085],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        levelNumber: 10,
        gridObjectLayout: [
        [ 0, 0, 0, 1, 2, 1, 0, 0, 0],
        [ 0, 0, 1, 2, 1, 7, 1, 0, 0],
        [ 0, 1, 2, 0, 1, 0, 1, 1, 0],
        [ 0, 1, 2, 0, 1, 0, 2, 1, 0],
        [ 0, 2, 4, 6, 3, 5, 2, 2, 0],
        [ 0, 2, 1, 0, 0, 0, 1, 1, 0],
        [ 1, 1, 2, 2, 1, 2, 2, 2, 1],
        [ 0, 1, 2, 2, 1, 2, 2, 1, 0],
        [ 0,11, 0, 2, 0, 1, 0, 1, 0],  
        ],
        levelDescription: "I swear to god... one more level with this smiling tree..." +
        "\n\n" +
        "The final POINT SPHERE shows the points you get each time your gotchis jump. Form long lines to max out your score!",
        pos: [0.167, 0.272],
        curveThisPos: [0.19, 0.23],
        curvePrevPos: [0.165, 0.185],
        actionsRemaining: 35,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
];