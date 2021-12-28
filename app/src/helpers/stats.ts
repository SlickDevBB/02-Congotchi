// stats.ts - stores the global stats object and values

export const STATS_MIN_MAX = {
    INTERACT_PINK_MIN: 5,       INTERACT_PINK_MAX: 15,
    MOVE_PINK_MIN: 5,           MOVE_PINK_MAX: 15,

    INTERACT_RED_MIN: 1,        INTERACT_RED_MAX: 5,
    MOVE_RED_MIN: 3,            MOVE_RED_MAX: 9,
    
    INTERACT_GREEN_MIN: 1,      INTERACT_GREEN_MAX: 5, 
    MOVE_GREEN_MIN: 3,          MOVE_GREEN_MAX: 9,
    
    INTERACT_BLUE_MIN: 1,       INTERACT_BLUE_MAX: 5,
    MOVE_BLUE_MIN: 3,           MOVE_BLUE_MAX: 9,  
}

export type Stats = {
    interactPink: number,
    movePink: number,

    interactRed: number,
    moveRed: number,

    interactGreen: number,
    moveGreen: number,

    interactBlue: number,
    moveBlue: number,
}

export const constrainMinMax = (value: number, min: number, max: number): number => {
    if (value < min) return min;
    else if (value > max) return max;
    else return value;
}

export const calcStats = (NRG: number, AGG: number, SPK: number, BRN: number): Stats => {
    // generate stats
    const s = {
        interactPink: STATS_MIN_MAX.INTERACT_PINK_MIN + Math.floor((100-NRG)/100*(STATS_MIN_MAX.INTERACT_PINK_MAX-STATS_MIN_MAX.INTERACT_PINK_MIN)),
        movePink: STATS_MIN_MAX.MOVE_PINK_MIN + Math.floor(NRG/100*(STATS_MIN_MAX.MOVE_PINK_MAX-STATS_MIN_MAX.MOVE_PINK_MIN)),

        interactRed: STATS_MIN_MAX.INTERACT_RED_MIN + Math.floor((100-AGG)/100*(STATS_MIN_MAX.INTERACT_RED_MAX-STATS_MIN_MAX.INTERACT_RED_MIN)),
        moveRed: STATS_MIN_MAX.MOVE_RED_MIN + Math.floor(AGG/100*(STATS_MIN_MAX.MOVE_RED_MAX-STATS_MIN_MAX.MOVE_RED_MIN)),

        interactGreen: STATS_MIN_MAX.INTERACT_GREEN_MIN + Math.floor((100-SPK)/100*(STATS_MIN_MAX.INTERACT_GREEN_MAX-STATS_MIN_MAX.INTERACT_GREEN_MIN)),
        moveGreen: STATS_MIN_MAX.MOVE_GREEN_MIN + Math.floor(SPK/100*(STATS_MIN_MAX.MOVE_GREEN_MAX-STATS_MIN_MAX.MOVE_GREEN_MIN)),

        interactBlue: STATS_MIN_MAX.INTERACT_BLUE_MIN + Math.floor((100-BRN)/100*(STATS_MIN_MAX.INTERACT_BLUE_MAX-STATS_MIN_MAX.INTERACT_BLUE_MIN)),
        moveBlue: STATS_MIN_MAX.MOVE_BLUE_MIN + Math.floor(BRN/100*(STATS_MIN_MAX.MOVE_BLUE_MAX-STATS_MIN_MAX.MOVE_BLUE_MIN)),
    }

    // double check we haven't exceeded mins and max's
    s.interactPink = constrainMinMax(s.interactPink, STATS_MIN_MAX.INTERACT_PINK_MIN, STATS_MIN_MAX.INTERACT_PINK_MAX);
    s.movePink = constrainMinMax(s.movePink, STATS_MIN_MAX.MOVE_PINK_MIN, STATS_MIN_MAX.MOVE_PINK_MAX);

    s.interactRed = constrainMinMax(s.interactRed, STATS_MIN_MAX.INTERACT_RED_MIN, STATS_MIN_MAX.INTERACT_RED_MAX);
    s.moveRed = constrainMinMax(s.moveRed, STATS_MIN_MAX.MOVE_RED_MIN, STATS_MIN_MAX.MOVE_RED_MAX);

    s.interactGreen = constrainMinMax(s.interactGreen, STATS_MIN_MAX.INTERACT_GREEN_MIN, STATS_MIN_MAX.INTERACT_GREEN_MAX);
    s.moveGreen = constrainMinMax(s.moveGreen, STATS_MIN_MAX.MOVE_GREEN_MIN, STATS_MIN_MAX.MOVE_GREEN_MAX);

    s.interactBlue = constrainMinMax(s.interactBlue, STATS_MIN_MAX.INTERACT_BLUE_MIN, STATS_MIN_MAX.INTERACT_BLUE_MAX);
    s.moveBlue = constrainMinMax(s.moveBlue, STATS_MIN_MAX.MOVE_BLUE_MIN, STATS_MIN_MAX.MOVE_BLUE_MAX);

    return s;
}


