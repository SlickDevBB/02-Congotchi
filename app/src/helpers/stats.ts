// stats.ts - stores the global stats object and values

export const STATS_MIN_MAX = {
    // NRG
    SPARE_MOVE_MIN: 5,              SPARE_MOVE_MAX: 15,
    CONGA_JUMP_MIN: 10,             CONGA_JUMP_MAX: 25, 

    // AGG
    GREEN_ACTIVATE_MIN: 5,          GREEN_ACTIVATE_MAX: 25,
    RED_ACTIVATE_MIN: 5,            RED_ACTIVATE_MAX: 25,
    
    // SPK
    RED_DAMAGE_MIN: -15,            RED_DAMAGE_MAX: -5, 
    GREEN_BUFF_MIN: 5,              GREEN_BUFF_MAX: 15,
    
    // BRN
    GOTCHI_SAVE_MIN: 5,             GOTCHI_SAVE_MAX: 25,
    PORTAL_OPEN_MIN: 50,             PORTAL_OPEN_MAX: 100,
}

export type StatPoints = {
    // NRG
    spareMove: number,
    congaJump: number,

    // AGG
    greenActivate: number,
    redActivate: number,

    // SPK
    redDamage: number,
    greenBuff: number,

    // BRN
    gotchiSave: number,
    portalOpen: number,
}

export const constrainMinMax = (value: number, min: number, max: number): number => {
    if (value < min) return min;
    else if (value > max) return max;
    else return value;
}

export const calcStats = (NRG: number, AGG: number, SPK: number, BRN: number): StatPoints => {
    // generate stats
    const s = {
        spareMove: STATS_MIN_MAX.SPARE_MOVE_MIN + Math.round((100-NRG)/100*(STATS_MIN_MAX.SPARE_MOVE_MAX-STATS_MIN_MAX.SPARE_MOVE_MIN)),
        congaJump: STATS_MIN_MAX.CONGA_JUMP_MIN + Math.round(NRG/100*(STATS_MIN_MAX.CONGA_JUMP_MAX-STATS_MIN_MAX.CONGA_JUMP_MIN)),

        greenActivate: STATS_MIN_MAX.GREEN_ACTIVATE_MIN + Math.round((100-AGG)/100*(STATS_MIN_MAX.GREEN_ACTIVATE_MAX-STATS_MIN_MAX.GREEN_ACTIVATE_MIN)),
        redActivate: STATS_MIN_MAX.RED_ACTIVATE_MIN + Math.round(AGG/100*(STATS_MIN_MAX.RED_ACTIVATE_MAX-STATS_MIN_MAX.RED_ACTIVATE_MIN)),

        redDamage: STATS_MIN_MAX.RED_DAMAGE_MIN + Math.round((100-SPK)/100*(STATS_MIN_MAX.RED_DAMAGE_MAX-STATS_MIN_MAX.RED_DAMAGE_MIN)),
        greenBuff: STATS_MIN_MAX.GREEN_BUFF_MIN + Math.round(SPK/100*(STATS_MIN_MAX.GREEN_BUFF_MAX-STATS_MIN_MAX.GREEN_BUFF_MIN)),

        gotchiSave: STATS_MIN_MAX.GOTCHI_SAVE_MIN + Math.round((100-BRN)/100*(STATS_MIN_MAX.GOTCHI_SAVE_MAX-STATS_MIN_MAX.GOTCHI_SAVE_MIN)),
        portalOpen: STATS_MIN_MAX.PORTAL_OPEN_MIN + Math.round(BRN/100*(STATS_MIN_MAX.PORTAL_OPEN_MAX-STATS_MIN_MAX.PORTAL_OPEN_MIN)),
    }

    // double check we haven't exceeded mins and max's
    s.spareMove = constrainMinMax(s.spareMove, STATS_MIN_MAX.SPARE_MOVE_MIN, STATS_MIN_MAX.SPARE_MOVE_MAX);
    s.congaJump = constrainMinMax(s.congaJump, STATS_MIN_MAX.CONGA_JUMP_MIN, STATS_MIN_MAX.CONGA_JUMP_MAX);

    s.greenActivate = constrainMinMax(s.greenActivate, STATS_MIN_MAX.GREEN_ACTIVATE_MIN, STATS_MIN_MAX.GREEN_ACTIVATE_MAX);
    s.redActivate = constrainMinMax(s.redActivate, STATS_MIN_MAX.RED_ACTIVATE_MIN, STATS_MIN_MAX.RED_ACTIVATE_MAX);

    s.redDamage = constrainMinMax(s.redDamage, STATS_MIN_MAX.RED_DAMAGE_MIN, STATS_MIN_MAX.RED_DAMAGE_MAX);
    s.greenBuff = constrainMinMax(s.greenBuff, STATS_MIN_MAX.GREEN_BUFF_MIN, STATS_MIN_MAX.GREEN_BUFF_MAX);

    s.gotchiSave = constrainMinMax(s.gotchiSave, STATS_MIN_MAX.GOTCHI_SAVE_MIN, STATS_MIN_MAX.GOTCHI_SAVE_MAX);
    s.portalOpen = constrainMinMax(s.portalOpen, STATS_MIN_MAX.PORTAL_OPEN_MIN, STATS_MIN_MAX.PORTAL_OPEN_MAX);

    return s;
}

// export const STATS_MIN_MAX = {
//     INTERACT_BLUE_MIN: 1,       INTERACT_BLUE_MAX: 5,
//     MOVE_BLUE_MIN: 1,           MOVE_BLUE_MAX: 5, 

//     INTERACT_RED_MIN: 1,        INTERACT_RED_MAX: 5,
//     MOVE_RED_MIN: 1,            MOVE_RED_MAX: 5,
    
//     INTERACT_GREEN_MIN: 1,      INTERACT_GREEN_MAX: 5, 
//     MOVE_GREEN_MIN: 1,          MOVE_GREEN_MAX: 5,
    
//     INTERACT_PINK_MIN: 1,       INTERACT_PINK_MAX: 5,
//     MOVE_PINK_MIN: 1,           MOVE_PINK_MAX: 5,
// }

// export type Stats = {
//     interactBlue: number,
//     moveBlue: number,

//     interactRed: number,
//     moveRed: number,

//     interactGreen: number,
//     moveGreen: number,

//     interactPink: number,
//     movePink: number,
// }

// export const constrainMinMax = (value: number, min: number, max: number): number => {
//     if (value < min) return min;
//     else if (value > max) return max;
//     else return value;
// }

// export const calcStats = (NRG: number, AGG: number, SPK: number, BRN: number): Stats => {
//     // generate stats
//     const s = {
//         interactBlue: STATS_MIN_MAX.INTERACT_BLUE_MAX - Math.round((100-NRG)/100*(STATS_MIN_MAX.INTERACT_BLUE_MAX-STATS_MIN_MAX.INTERACT_BLUE_MIN)),
//         moveBlue: STATS_MIN_MAX.MOVE_BLUE_MAX - Math.round(NRG/100*(STATS_MIN_MAX.MOVE_BLUE_MAX-STATS_MIN_MAX.MOVE_BLUE_MIN)),

//         interactRed: STATS_MIN_MAX.INTERACT_RED_MAX - Math.round((100-AGG)/100*(STATS_MIN_MAX.INTERACT_RED_MAX-STATS_MIN_MAX.INTERACT_RED_MIN)),
//         moveRed: STATS_MIN_MAX.MOVE_RED_MAX - Math.round(AGG/100*(STATS_MIN_MAX.MOVE_RED_MAX-STATS_MIN_MAX.MOVE_RED_MIN)),

//         interactGreen: STATS_MIN_MAX.INTERACT_GREEN_MAX - Math.round((100-SPK)/100*(STATS_MIN_MAX.INTERACT_GREEN_MAX-STATS_MIN_MAX.INTERACT_GREEN_MIN)),
//         moveGreen: STATS_MIN_MAX.MOVE_GREEN_MAX - Math.round(SPK/100*(STATS_MIN_MAX.MOVE_GREEN_MAX-STATS_MIN_MAX.MOVE_GREEN_MIN)),

//         interactPink: STATS_MIN_MAX.INTERACT_PINK_MAX - Math.round((100-BRN)/100*(STATS_MIN_MAX.INTERACT_PINK_MAX-STATS_MIN_MAX.INTERACT_PINK_MIN)),
//         movePink: STATS_MIN_MAX.MOVE_PINK_MAX - Math.round(BRN/100*(STATS_MIN_MAX.MOVE_PINK_MAX-STATS_MIN_MAX.MOVE_PINK_MIN)),
//     }

//     // double check we haven't exceeded mins and max's
//     s.interactBlue = constrainMinMax(s.interactBlue, STATS_MIN_MAX.INTERACT_BLUE_MIN, STATS_MIN_MAX.INTERACT_BLUE_MAX);
//     s.moveBlue = constrainMinMax(s.moveBlue, STATS_MIN_MAX.MOVE_BLUE_MIN, STATS_MIN_MAX.MOVE_BLUE_MAX);

//     s.interactRed = constrainMinMax(s.interactRed, STATS_MIN_MAX.INTERACT_RED_MIN, STATS_MIN_MAX.INTERACT_RED_MAX);
//     s.moveRed = constrainMinMax(s.moveRed, STATS_MIN_MAX.MOVE_RED_MIN, STATS_MIN_MAX.MOVE_RED_MAX);

//     s.interactGreen = constrainMinMax(s.interactGreen, STATS_MIN_MAX.INTERACT_GREEN_MIN, STATS_MIN_MAX.INTERACT_GREEN_MAX);
//     s.moveGreen = constrainMinMax(s.moveGreen, STATS_MIN_MAX.MOVE_GREEN_MIN, STATS_MIN_MAX.MOVE_GREEN_MAX);

//     s.interactPink = constrainMinMax(s.interactPink, STATS_MIN_MAX.INTERACT_PINK_MIN, STATS_MIN_MAX.INTERACT_PINK_MAX);
//     s.movePink = constrainMinMax(s.movePink, STATS_MIN_MAX.MOVE_PINK_MIN, STATS_MIN_MAX.MOVE_PINK_MAX);

//     return s;
// }


