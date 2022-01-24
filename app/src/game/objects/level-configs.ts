// level-configs.ts
// this file defines all the different levels

import { GRID_BG_COBBLE_STONES_RECTANGLE, GRID_BG_DIRT, GRID_BG_DIRT_ROUNDED, GRID_BG_GRASS, GRID_BG_SAND_STONE } from "game/assets";

// upon creation, each grid level should be passed this "levels" config object that defines how to set all the levels up
// the config will be a 2d matrix that defines what element will be in each grid cell initially

// 0 = no grid cell
// 1 = empty grid cell

// 2 = gotchi (direction randomly assigned but doesn't matter in game)

// 3 = portal (always open)

// 4 = milkshake
// 5 = grenade
// 6 = cactii

// 9 = burnt gotchi (as in a normal gotchi that just starts a level burnt)

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
    gridTexture: string,
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
        
        // 1: Introduce players to moving gotchis
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
        'Tip: CLICK & DRAG gotchis into conga lines in front of portals to bring them home :)',
        gridTexture: GRID_BG_COBBLE_STONES_RECTANGLE,
        pos: [0.23, 0.65 ],
        curveThisPos: [],
        curvePrevPos: [],
        actionsRemaining: 3,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 2: Introduce players to moving portals
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
        "Phew! So far so good. The GRID is a bit more dangerous though and you'll need to think carefully out here..." +
        "\n\n" +
        "Tip: Sometimes it's more efficient to bring the portal to the gotchi ;) ",
        gridTexture: GRID_BG_GRASS,
        pos: [0.258, 0.480 ],
        curveThisPos: [0.25, 0.49],
        curvePrevPos: [0.285, 0.62],
        actionsRemaining: 10,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 3: Introduce players to the move counts
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
        "Wow, we're right on the cusp of the DAARK FOREST... wonder what's inside?" +
        "\n\n" +
        "Tip: Keep an eye on your move count at the bottom of each level. It reduces every time you move an object.",
        gridTexture: GRID_BG_GRASS,
        pos: [0.181, 0.375 ],
        curveThisPos: [0.204, 0.418],
        curvePrevPos: [0.262, 0.395],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // 4: Introduction to milkshakes
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
        "Milkshakes! Mmmm.. mmm.. nomm.. nom... m.. MMMMM!" +
        "\n\n" +
        "Tip: Gotchis are sometimes greedy ghosts. Any gotchi next to a milkshake will slurp it up immediately for some points!",
        gridTexture: GRID_BG_GRASS,
        pos: [0.06, 0.4],
        curveThisPos: [0.12, 0.44],
        curvePrevPos: [0.1, 0.4],
        actionsRemaining: 20,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
    {
        // Introduction to the tree of fud
        levelNumber: 5,
        gridObjectLayout: [
        [0, 0, 0, 1, 2, 1, 0, 0, 0],
        [0, 0, 1, 9, 1, 1, 1, 0, 0],
        [0, 1, 2, 0, 4, 0, 1, 1, 0],
        [0, 1, 2, 0, 1, 0, 2, 1, 0],
        [0, 2, 2, 1, 3, 1, 2, 2, 0],
        [0, 1, 1, 0, 0, 0, 1, 1, 0],
        [4, 1, 2, 2, 1, 1, 2, 1, 4],
        [0, 1, 1, 1, 2, 9, 2, 1, 0],
        [0, 1, 0, 4, 0, 9, 0, 1, 0],  
        ],
        levelDescription: "The TREE OF FUD! Don't panic.. it looks.. friendly?" +
        "\n\n" +
        "Tip: Some gotchis in this level have been out in the sun too long and are burnt. Move them to allow them to conga again.",
        gridTexture: GRID_BG_DIRT,
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
        [0, 0, 0, 0, 1, 5, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 1, 1, 5, 2, 1, 1, 2, 0],
        [0, 1, 1, 1, 2, 1, 1, 2, 0],
        [0, 1, 1, 1, 2, 1, 1, 1, 0],
        [0, 2, 2, 2, 2, 1, 3, 1, 0],
        [0, 1, 1, 5, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 5, 1, 1, 0, 0],
        ],
        levelDescription: "Aaaah the mountai... STOP! There's grenades here???" +
        "\n\n" +
        "Tip: Moving grenades or starting a conga next to one begins a detonation countdown. Keep gotchis away from explosions!",
        gridTexture: GRID_BG_GRASS,
        pos: [0.04, 0.232],
        curveThisPos: [0.044, 0.261],
        curvePrevPos: [0.088, 0.259],
        actionsRemaining: 17,
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
        levelDescription: "We've been floating for aaaages... are we at NORTH BEACH yet? Ooooh moar grenades!" +
        "\n\n" +
        "Tip: Create a grenade chain reaction to clear the way to the portal!",
        gridTexture: GRID_BG_GRASS,
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
        [ 0,  0,  0,  0,  0,  0,  1,  5, 11],
        [ 0,  0,  1,  2,  1,  1,  1,  1,  1],
        [ 0,  0,  1,  2,  2,  2,  2,  0,  0],
        [ 0,  0,  2,  1,  1,  2,  1,  0,  0],
        [ 0,  0,  1,  3,  1,  2,  1,  0,  0],
        [ 1,  1,  5,  1,  2,  2, 11,  0,  0],
        [ 1, 11,  1,  0,  0,  0,  0,  0,  0],
        [ 1,  1,  1,  0,  0,  0,  0,  0,  0],
        ],
        levelDescription: "Ahh here we are... NORTH BEACH! A pebbles throw from ROFL REEF..." +
        "\n\n" +
        "Tip: ROFLs move, rotate & conga home like gotchis. They're worth moar points but can be tricky to save..",
        gridTexture: GRID_BG_SAND_STONE,
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
        [0, 0, 1, 1, 0, 6,  2, 1, 1],
        [0, 2, 1, 1, 1, 1,  2, 1, 0],
        [1, 2, 2, 6, 1, 1,  1, 0, 0],
        [1, 2, 1, 2, 2, 2,  2, 0, 0],
        [1, 1, 1, 1, 6, 2,  1, 0, 0],
        [0, 2, 1, 1, 0, 1,  3, 1, 0],
        [0, 0, 0, 0, 0, 0,  1, 0, 0],
        ],
        levelDescription: "Welcome to the DEFI DESERT, home of the.. OUCH.. Cact.. OUCH!!" +
        "\n\n" +
        "Tip: Gotchis that conga next to cactii lose points. Move them away from conga lines just to be safe fren :)",
        gridTexture: GRID_BG_SAND_STONE,
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
        [ 0, 0, 1, 2, 2, 5, 1, 0, 0],
        [ 0, 1, 2, 0, 1, 0, 1, 1, 0],
        [ 0, 2, 1, 0, 5, 0, 2, 2, 0],
        [ 0, 1, 4, 5, 3, 4, 1, 2, 0],
        [ 0, 2, 1, 0, 0, 0, 1, 1, 0],
        [ 1, 5, 2, 6, 1, 2, 2, 2, 1],
        [ 0, 1, 2, 2, 2, 1, 2, 1, 0],
        [ 0,11, 0, 2, 0, 4, 0, 1, 0],  
        ],
        levelDescription: "I swear to god... one more level with this smiling tree..." +
        "\n\n" +
        "Tip: Gotchis score points when they 'jump' in a conga line so make those lines as long as possible!",
        gridTexture: GRID_BG_DIRT,
        pos: [0.167, 0.272],
        curveThisPos: [0.19, 0.23],
        curvePrevPos: [0.165, 0.185],
        actionsRemaining: 35,
        statMask: {spareMove: 0, congaJump: 0, greenActivate: 0, redActivate: 0, 
            redDamage: 0, greenBuff: 0, gotchiSave: 0, portalOpen: 0}
    },
];