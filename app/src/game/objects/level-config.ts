// // level-configs.ts - file for our level config interface (server has an exact duplicate)

export interface LevelConfig {
    levelNumber: number,
    gridObjectLayout: Array<number[]>,
    levelDescription: string,
    gridTexture: string,
    pos: number[],
    curveThisPos: number[],
    curvePrevPos: number[],
    actionsRemaining: number,
    statMask: {spareMove: number, congaJump: number, greenActivate: number, redDestroy: number, 
        redDamage: number, greenBuff: number, gotchiSave: number, congaStart: number}
}