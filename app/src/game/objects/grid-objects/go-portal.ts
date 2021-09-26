// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridLevel, GridObject, Player } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, PORTAL_OPEN } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GO_PORTAL } from 'game/helpers/constants';
  
export class GO_Portal extends GridObject {
    private status: 'OPEN' | 'CLOSED' = 'CLOSED';
    private congaGotchis: Array<GO_Gotchi | 0> = [0, 0, 0, 0]; // element 0 is down, 1 is left, 2 is up, 3 is right

    // define variables for dragging object
    private timer = 0;
    private pointerDownGridPosition: GridPosition = {row: 0, col: 0, };

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'PORTAL'});

        // enable draggable input
        this.setInteractive();

        // set a specific depth
        this.setDepth(DEPTH_GO_PORTAL);

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

    public findCongaGotchis() {
        // check each direction to see if there is a gotchi looking at us
        const downGotchi = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col) as GO_Gotchi;
        this.congaGotchis[0] = (downGotchi && downGotchi.getType() === 'GOTCHI' && downGotchi.getDirection() === 'UP') ? 
            downGotchi : 0;

        const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1) as GO_Gotchi;
        this.congaGotchis[1] = (leftGotchi && leftGotchi.getType() === 'GOTCHI' && leftGotchi.getDirection() === 'RIGHT') ? 
            leftGotchi : 0;

        const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col) as GO_Gotchi;
        this.congaGotchis[2] = (upGotchi && upGotchi.getType() === 'GOTCHI' && upGotchi.getDirection() === 'DOWN') ? 
            upGotchi : 0;

        const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1) as GO_Gotchi;
        this.congaGotchis[3] = (rightGotchi && rightGotchi.getType() === 'GOTCHI' && rightGotchi.getDirection() === 'LEFT') ? 
            rightGotchi : 0;
    }

    public startCongaChains() {
        // go through each of our possible conga gotchis and if they're looking at the portal start up conga chains
        this.congaGotchis.map( cg => {
            if (cg) {
                cg.congaIntoPortal(this.gridPosition.row, this.gridPosition.col);
            }
        })
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
  