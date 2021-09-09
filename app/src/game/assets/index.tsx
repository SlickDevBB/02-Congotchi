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
export const BLACK_CIRCLE_SHADED = 'black-circle-shaded';
export const WHITE_CIRCLE_SHADED = 'white-circle-shaded';
export const MOVE_ICON = 'move_icon';
export const ROTATE_ICON = 'rotate_icon';
export const SHUFFLE_ICON = 'shuffle_icon';
export const BONUS_ICON = 'bonus_icon';


// Save all in game assets in the public folder
export const assets: Array<Asset | SpritesheetAsset> = [
  {
    key: BG,
    src: 'assets/bg/lava_lounge2.png',
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
    key: MOVE_ICON,
    src: 'assets/icons/move.png',
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
];
