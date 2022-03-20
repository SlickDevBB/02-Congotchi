// types.ts

// export these for level-config
export const GRID_BG_COBBLE_STONES = 'grid_bg_cobble_stones';
export const GRID_BG_COBBLE_STONES_RECTANGLE = 'grid_bg_cobble_stones_rectangle';
export const GRID_BG_DIRT = 'grid_bg_dirt';
export const GRID_BG_DIRT_ROUNDED = 'grid_bg_dirt_rounded';
export const GRID_BG_GRASS = 'grid_bg_grass';
export const GRID_BG_SAND_STONE = 'grid_bg_sand_stone';

export interface ScoreSubmission {
    tokenId: string,
    name: string,
    level: number,
    score: number,
    stars: number,
}

export interface levelData {
    actionsRemaining: number,

}