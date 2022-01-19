// grid-object-base-class.ts - base class for all grid objects

import { COMMON_DOWN_ROFL, COMMON_LEFT_ROFL, COMMON_RIGHT_ROFL, COMMON_UP_ROFL } from 'game/assets';
import { GO_Gotchi, GridLevel } from 'game/objects';
import { GO_Gotchi_Props } from './go-gotchi';

export interface GO_Rofl_Props extends GO_Gotchi_Props {
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'GODLIKE';
}

export class GO_Rofl extends GO_Gotchi {
  // rofls only real differentiating stat from a gotchi
  private rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'GODLIKE';

  constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType = 'ROFL', direction, rarity }: GO_Rofl_Props) {
      super({scene, gridLevel, gridRow, gridCol, key, gridSize, objectType, direction});

      // set our rarity and rofl image based on this
      this.rarity = rarity;

      this.setDisplaySize(gridSize*.5, gridSize*.5);
      
  }

  public setDirection(direction: 'DOWN' | 'LEFT' | 'RIGHT' | 'UP') {
    super.setDirection(direction);

    // check we're a rofl and update image
    if (this.objectType === 'ROFL') {
        switch (direction) {
            case 'DOWN': {
                this.setTexture(COMMON_DOWN_ROFL);
                break;
            }
            case 'LEFT': {
                this.setTexture(COMMON_LEFT_ROFL);
                break;
            }
            case 'RIGHT': {
                this.setTexture(COMMON_RIGHT_ROFL);
                break;
            }
            case 'UP': {
                this.setTexture(COMMON_UP_ROFL);
                break;
            }
            default: {
                
                break;
            }
        }
    }
    return this;
}


  update(): void {
      super.update(); 
  }


}
  