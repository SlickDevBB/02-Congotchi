// grid-object-base-class.ts - base class for all grid objects

import { GO_Props, GridLevel, GridObject, Player } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, PORTAL_OPEN } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';

// Grid objects will consist of 5 different types (action types will have sub types)
// 1) Gotchis
// 2) Portals
// 3) Stealth Action Objects (BLUE) - Gotchis can perform a stealth action on these items if dragged into them and player has enough stealth
//      a) Grenade - These can be diffused if gotchi dragged into them
//      b) Galaxy Brain - Gotchi will run to end of nearest available line
// 4) Aggro Action Objects (RED) - Gotchis can perform an aggressive action is dragged into them and player has enough aggro stat
//      a) Cacti - These can be destroyed if gotchis dragged into them
//      b) Coffee - Gotchi will randomly run around like crazy until it finds a new location
// 5) Fun Action Objects (GREEN) - Gotchis can perform a fun action if dragged into them and player has enough fun stat
//      a) Milkshake - These grant bonus points if gotchis dragged into them
//      b) Lil Pump Drank - Grants additional Movement points

// interface Props {
//     scene: Phaser.Scene;
//     gridLevel: GridLevel;
//     gridRow: number;
//     gridCol: number;
//     key: string;
//     frame?: number;
//     gridSize: number;
//     objectType: 'GOTCHI' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' | 'PORTAL',
//   }
  
  export class GO_Portal extends GridObject {
    private status: 'OPEN' | 'CLOSED' = 'CLOSED';

    // define variables for dragging object
    private timer = 0;
    private pointerDownGridPosition: GridPosition = {row: 0, col: 0, };

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'PORTAL'});

        // enable draggable input
        this.setInteractive();

        // set behaviour for pointer click down
        this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log('pointer down');

            // get the time and grid we clicked in
            this.timer = new Date().getTime();
            this.pointerDownGridPosition = this.gridLevel.getGridPositionFromXY(pointer.x, pointer.y);
 
        });

        // set behaviour for pointer up event
        this.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            // see if we're close to a pointer down event for a single click
            const time2 = new Date().getTime();
            const delta = time2 - this.timer;
            if (delta < 200) {
                // this is where we can open a portal if we have enough portal points
                const gameScene = this.scene as GameScene;
                const player = gameScene.getPlayer();

                if (gameScene && player) {
                    if (player.getStat('PORTAL') > 0) {
                        this.setStatus('OPEN');
                        player.adjustStat('PORTAL', -1);
                    }
                }
            }
        });

        

    }

    public getStatus() {
        return this.status;
    }

    public setStatus(status: 'OPEN' | 'CLOSED') {
        this.status = status;
        if (status === 'OPEN') this.setTexture(PORTAL_OPEN);
        return this;
    }
  
    update(): void {
      const a = '';
    }
  }
  