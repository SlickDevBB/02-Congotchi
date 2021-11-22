export interface Asset {
  key: string;
  src: string;
  type: 'IMAGE' | 'SVG' | 'SPRITESHEET' | 'AUDIO';
  data?: {
    frameWidth?: number;
    frameHeight?: number;
  };
}

export interface SpritesheetAsset extends Asset {
  type: 'SPRITESHEET';
  data: {
    frameWidth: number;
    frameHeight: number;
  };
}

export const BG = 'bg';
export const FULLSCREEN = 'fullscreen';
export const LEFT_CHEVRON = 'left_chevron';
export const CLICK = 'click';
export const ARROW_DOWN = 'arrow_down';
export const GOTCHI_FRONT = 'gotchi_front';
export const GOTCHI_BACK = 'gotchi_back';
export const GOTCHI_LEFT = 'gotchi_left';
export const GOTCHI_RIGHT = 'gotchi_right';
export const M67_GRENADE = 'm67_grenade';
export const MILKSHAKE = 'milkshake';
export const UNCOMMON_CACTI = 'uncommon_cacti';
export const PORTAL_OPEN = 'portal_open';
export const PORTAL_CLOSED = 'portal_closed';
export const BLACK_CIRCLE_SHADED = 'black-circle-shaded';
export const WHITE_CIRCLE_SHADED = 'white-circle-shaded';
export const PINK_CIRCLE_SHADED = 'pink-circle-shaded';
export const RED_CIRCLE_SHADED = 'red-circle-shaded';
export const GREEN_CIRCLE_SHADED = 'green-circle-shaded';
export const BLUE_CIRCLE_SHADED = 'blue-circle-shaded';
export const MOVE_ICON = 'move_icon';
export const QUESTION_MARK_ICON = 'question_mark_icon';
export const ROTATE_ICON = 'rotate_icon';
export const SHUFFLE_ICON = 'shuffle_icon';
export const BONUS_ICON = 'bonus_icon';
export const ARROW_ICON = 'arrow_icon';
export const RED_BUTTON = 'red_button';
export const PURPLE_BUTTON = 'purple_button';
export const GREEN_BUTTON = 'green_button';
export const GUI_PANEL_5 = 'gui_panel_5';
export const GUI_LEVEL_SELECT_RIBBON = 'gui_level_select_ribbon';
export const GUI_BUTTON_CROSS = 'gui_button_cross';
export const GUI_BUTTON_TICK = 'gui_button_tick';
export const GUI_BUTTON_PLAY = 'gui_button_play';
export const GUI_BUTTON_FORWARD = 'gui_button_foward';
export const GUI_BUTTON_BACK = 'gui_button_back';
export const GUI_SCORE_PANEL = 'gui_score_panel';
export const GUI_0_STARS = 'gui_0_stars';
export const GUI_1_STARS = 'gui_1_stars';
export const GUI_2_STARS = 'gui_2_stars';
export const GUI_3_STARS = 'gui_3_stars';
export const CW_ROTATE_MOVE_ICON = 'cw_rotate_move_icon';
export const ACW_ROTATE_MOVE_ICON = 'acw_rotate_move_icon';
export const PIXEL_EXPLOSION = 'pixel_explosion';

// Save all in game assets in the public folder
export const assets: Array<Asset | SpritesheetAsset> = [
  {
    key: BG,
    src: 'assets/bg/map_reaalm_nolabels.png',
    type: 'IMAGE',
  },
  {
    key: LEFT_CHEVRON,
    src: 'assets/icons/chevron_left.svg',
    type: 'SVG',
  },
  {
    key: CLICK,
    src: 'assets/sounds/click.mp3',
    type: 'AUDIO',
  },
  {
    key: ARROW_DOWN,
    src: 'assets/images/arrow_down.png',
    type: 'IMAGE',
  },
  {
    key: GOTCHI_FRONT,
    src: 'assets/gotchis/1_front.png',
    type: 'IMAGE',
  },
  {
    key: GOTCHI_BACK,
    src: 'assets/gotchis/1_back.png',
    type: 'IMAGE',
  },
  {
    key: GOTCHI_LEFT,
    src: 'assets/gotchis/1_left.png',
    type: 'IMAGE',
  },
  {
    key: GOTCHI_RIGHT,
    src: 'assets/gotchis/1_right.png',
    type: 'IMAGE',
  },
  {
    key: M67_GRENADE,
    src: 'assets/images/grenade.png',
    type: 'IMAGE',
  },
  {
    key: MILKSHAKE,
    src: 'assets/images/milkshake.png',
    type: 'IMAGE',
  },
  {
    key: UNCOMMON_CACTI,
    src: 'assets/images/cacti.png',
    type: 'IMAGE',
  },
  {
    key: PORTAL_OPEN,
    src: 'assets/images/h2_open.svg',
    type: 'IMAGE',
  },
  {
    key: PORTAL_CLOSED,
    src: 'assets/images/h2_closed.svg',
    type: 'IMAGE',
  },
  {
    key: BLACK_CIRCLE_SHADED,
    src: 'assets/icons/black-circle-shaded.png',
    type: 'IMAGE',
  },
  {
    key: WHITE_CIRCLE_SHADED,
    src: 'assets/icons/white-circle-shaded.png',
    type: 'IMAGE',
  },
  {
    key: PINK_CIRCLE_SHADED,
    src: 'assets/icons/sphere-pink.png',
    type: 'IMAGE',
  },
  {
    key: RED_CIRCLE_SHADED,
    src: 'assets/icons/sphere-red.png',
    type: 'IMAGE',
  },
  {
    key: GREEN_CIRCLE_SHADED,
    src: 'assets/icons/sphere-green.png',
    type: 'IMAGE',
  },
  {
    key: BLUE_CIRCLE_SHADED,
    src: 'assets/icons/sphere-blue.png',
    type: 'IMAGE',
  },
  {
    key: MOVE_ICON,
    src: 'assets/icons/move-icon.png',
    type: 'IMAGE',
  },
  {
    key: QUESTION_MARK_ICON,
    src: 'assets/icons/question-mark-icon.png',
    type: 'IMAGE',
  },
  {
    key: ROTATE_ICON,
    src: 'assets/icons/rotate.png',
    type: 'IMAGE',
  },
  {
    key: SHUFFLE_ICON,
    src: 'assets/icons/shuffle.png',
    type: 'IMAGE',
  },
  {
    key: BONUS_ICON,
    src: 'assets/icons/bonus.png',
    type: 'IMAGE',
  },
  {
    key: RED_BUTTON,
    src: 'assets/images/level-button-small-red.png',
    type: 'IMAGE',
  },
  {
    key: PURPLE_BUTTON,
    src: 'assets/images/level-button-small-purple.png',
    type: 'IMAGE',
  },
  {
    key: GREEN_BUTTON,
    src: 'assets/images/level-button-small-green.png',
    type: 'IMAGE',
  },
  {
    key: GUI_PANEL_5,
    src: 'assets/gui/panel-5.png',
    type: 'IMAGE',
  },
  {
    key: GUI_LEVEL_SELECT_RIBBON,
    src: 'assets/gui/level-select-ribbon.png',
    type: 'IMAGE',
  },
  {
    key: GUI_BUTTON_CROSS,
    src: 'assets/gui/cross.png',
    type: 'IMAGE',
  },
  {
    key: GUI_BUTTON_TICK,
    src: 'assets/gui/tick.png',
    type: 'IMAGE',
  },
  {
    key: GUI_BUTTON_PLAY,
    src: 'assets/gui/play-button.png',
    type: 'IMAGE',
  },
  {
    key: GUI_BUTTON_FORWARD,
    src: 'assets/gui/forward-button-1.png',
    type: 'IMAGE',
  },
  {
    key: GUI_BUTTON_BACK,
    src: 'assets/gui/back-button-1.png',
    type: 'IMAGE',
  },
  {
    key: GUI_SCORE_PANEL,
    src: 'assets/gui/score-panel-2.png',
    type: 'IMAGE',
  },
  {
    key: GUI_0_STARS,
    src: 'assets/gui/0-stars.png',
    type: 'IMAGE',
  },
  {
    key: GUI_1_STARS,
    src: 'assets/gui/1-stars.png',
    type: 'IMAGE',
  },
  {
    key: GUI_2_STARS,
    src: 'assets/gui/2-stars.png',
    type: 'IMAGE',
  },
  {
    key: GUI_3_STARS,
    src: 'assets/gui/3-stars.png',
    type: 'IMAGE',
  },
  {
    key: CW_ROTATE_MOVE_ICON,
    src: 'assets/icons/cw-rotate-move-icon.png',
    type: 'IMAGE',
  },
  {
    key: ACW_ROTATE_MOVE_ICON,
    src: 'assets/icons/acw-rotate-move-icon.png',
    type: 'IMAGE',
  },
  {
    key: ARROW_ICON,
    src: 'assets/icons/arrow-icon.png',
    type: 'IMAGE',
  },
  {
    key: PIXEL_EXPLOSION,
    src: 'assets/effects/pixel-explosion.png',
    type: 'IMAGE',
  },
];
