// stats.ts - stores the global stats object and values

export const STATS_MIN_MAX = {
    // NRG
    SPARE_MOVE_MIN: 75,              SPARE_MOVE_MAX: 150,
    GOTCHI_SAVE_MIN: 50,             GOTCHI_SAVE_MAX: 110,

    // AGG
    GREEN_ACTIVATE_MIN: 300,          GREEN_ACTIVATE_MAX: 500,
    RED_DESTROY_MIN: 300,            RED_DESTROY_MAX: 500,
    
    // SPK
    RED_DAMAGE_MIN: -300,            RED_DAMAGE_MAX: -100, 
    GREEN_BUFF_MIN: 100,              GREEN_BUFF_MAX: 300,
    
    // BRN
    CONGA_START_MIN: 300,             CONGA_START_MAX: 500,
    CONGA_JUMP_MIN: 20,             CONGA_JUMP_MAX: 50, 
}

export type StatPoints = {
    // NRG
    spareMove: number,
    gotchiSave: number,
    
    // AGG
    greenActivate: number,
    redDestroy: number,

    // SPK
    redDamage: number,
    greenBuff: number,

    // BRN
    congaJump: number,
    congaStart: number,
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
        gotchiSave: STATS_MIN_MAX.GOTCHI_SAVE_MIN + Math.round(NRG/100*(STATS_MIN_MAX.GOTCHI_SAVE_MAX-STATS_MIN_MAX.GOTCHI_SAVE_MIN)),
        

        greenActivate: STATS_MIN_MAX.GREEN_ACTIVATE_MIN + Math.round((100-AGG)/100*(STATS_MIN_MAX.GREEN_ACTIVATE_MAX-STATS_MIN_MAX.GREEN_ACTIVATE_MIN)),
        redDestroy: STATS_MIN_MAX.RED_DESTROY_MIN + Math.round(AGG/100*(STATS_MIN_MAX.RED_DESTROY_MAX-STATS_MIN_MAX.RED_DESTROY_MIN)),

        redDamage: STATS_MIN_MAX.RED_DAMAGE_MIN + Math.round((100-SPK)/100*(STATS_MIN_MAX.RED_DAMAGE_MAX-STATS_MIN_MAX.RED_DAMAGE_MIN)),
        greenBuff: STATS_MIN_MAX.GREEN_BUFF_MIN + Math.round(SPK/100*(STATS_MIN_MAX.GREEN_BUFF_MAX-STATS_MIN_MAX.GREEN_BUFF_MIN)),

        congaStart: STATS_MIN_MAX.CONGA_START_MIN + Math.round((100-BRN)/100*(STATS_MIN_MAX.CONGA_START_MAX-STATS_MIN_MAX.CONGA_START_MIN)),
        congaJump: STATS_MIN_MAX.CONGA_JUMP_MIN + Math.round(BRN/100*(STATS_MIN_MAX.CONGA_JUMP_MAX-STATS_MIN_MAX.CONGA_JUMP_MIN)),
    }

    // double check we haven't exceeded mins and max's
    s.spareMove = constrainMinMax(s.spareMove, STATS_MIN_MAX.SPARE_MOVE_MIN, STATS_MIN_MAX.SPARE_MOVE_MAX);
    s.gotchiSave = constrainMinMax(s.gotchiSave, STATS_MIN_MAX.GOTCHI_SAVE_MIN, STATS_MIN_MAX.GOTCHI_SAVE_MAX);

    s.greenActivate = constrainMinMax(s.greenActivate, STATS_MIN_MAX.GREEN_ACTIVATE_MIN, STATS_MIN_MAX.GREEN_ACTIVATE_MAX);
    s.redDestroy = constrainMinMax(s.redDestroy, STATS_MIN_MAX.RED_DESTROY_MIN, STATS_MIN_MAX.RED_DESTROY_MAX);

    s.redDamage = constrainMinMax(s.redDamage, STATS_MIN_MAX.RED_DAMAGE_MIN, STATS_MIN_MAX.RED_DAMAGE_MAX);
    s.greenBuff = constrainMinMax(s.greenBuff, STATS_MIN_MAX.GREEN_BUFF_MIN, STATS_MIN_MAX.GREEN_BUFF_MAX);

    s.congaStart = constrainMinMax(s.congaStart, STATS_MIN_MAX.CONGA_START_MIN, STATS_MIN_MAX.CONGA_START_MAX);
    s.congaJump = constrainMinMax(s.congaJump, STATS_MIN_MAX.CONGA_JUMP_MIN, STATS_MIN_MAX.CONGA_JUMP_MAX);

    return s;
}


