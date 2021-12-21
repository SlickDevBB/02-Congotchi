// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridLevel, GridObject, Player } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, PIXEL_PINK_SPLASH, PORTAL_OPEN } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GO_PORTAL } from 'game/helpers/constants';

interface Congotchi {
    gotchi: GO_Gotchi;
    newRow: number;
    newCol: number;
    newDir: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT';
    status: 'READY' | 'CONGOTCHING';
}
  
export class GO_Milkshake extends GridObject {
    private status: 'OPEN' | 'CLOSED' = 'CLOSED';

    // timer is for click events
    private timer = 0;

    // define variables for dragging object
    private ogDragGridPosition = { row: 0, col: 0 };
    private dragAxis: 'X' | 'Y' | 'NOT_ASSIGNED' = 'NOT_ASSIGNED';
    private dragX = 0;
    private dragY = 0;

    // our constructor
    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'MILKSHAKE'});

        console.log('MILKHAKE CREATED');

        // enable draggable input
        this.setInteractive();
        this.scene.input.setDraggable(this);

        // set our bg colour
        this.setBgSquareColour('GREEN');

        // set a specific depth
        this.setDepth(DEPTH_GO_PORTAL);

        // set behaviour for pointer click down
        this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // get the time and grid we clicked in
            this.timer = new Date().getTime();
        });

        // set behaviour for pointer up event
        this.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            // see if we're close to a pointer down event for a single click
            const delta = new Date().getTime() - this.timer;
            if (delta < 200) {
                // activate the milkshake
                this.quenchThirst();

                // destroy the milkshake
                // this.gridLevel.destroyAndMakeEmptyGridObject(this.gridPosition.row, this.gridPosition.col);
            }
        });

        // dragstart
        this.on('dragstart', () => {
            // store our initial drag positions
            this.ogDragGridPosition = this.getGridPosition();
            this.dragX = this.x;
            this.dragY = this.y;
        })

        // set behaviour for dragging
        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            const gameScene = this.scene as GameScene;
            const player = gameScene.getPlayer();

            if (gameScene && player) {    
                // if we've got movement points left we can drag
                if (player.getStat('MOVE_AGGRO') > 0) {
                    // only drag objects into grids they have space for
                    const gp = this.getGridPosition();
                    const aboveEmpty = gp.row > 0 && this.gridLevel.isGridPositionEmpty(gp.row-1, gp.col);
                    const belowEmpty = gp.row < this.gridLevel.getNumberRows()-1 && this.gridLevel.isGridPositionEmpty(gp.row+1, gp.col);
                    const leftEmpty = gp.col > 0 && this.gridLevel.isGridPositionEmpty(gp.row, gp.col-1);
                    const rightEmpty = gp.col < this.gridLevel.getNumberCols()-1 && this.gridLevel.isGridPositionEmpty(gp.row, gp.col+1);
                    
                    const adoX = this.dragX;
                    const adoY = this.dragY;
                    const upLimit = aboveEmpty ? adoY - this.gridLevel.getGridSize() : adoY;
                    const downLimit = belowEmpty ? adoY + this.gridLevel.getGridSize() : adoY;
                    const leftLimit = leftEmpty ? adoX - this.gridLevel.getGridSize() : adoX;
                    const rightLimit = rightEmpty ? adoX + this.gridLevel.getGridSize() : adoX;
            
                    if (this.dragAxis === 'NOT_ASSIGNED') {
                        // find the predominant drag axis
                        this.dragAxis = Math.abs(dragX-this.dragX) > Math.abs(dragY-this.dragY) ? 'X' : 'Y';
                    }
            
                    // move along the dominant axis
                    if (this.dragAxis === 'X') {
                        if (dragX > leftLimit && dragX < rightLimit) this.x = dragX;
                    } else if (this.dragAxis === 'Y') {
                        if (dragY > upLimit && dragY < downLimit) this.y = dragY;
                    }
                }
            }
        });

        this.on('dragend', () => {
            // store the grid position dragging finished in
            const finalGridPos = this.gridLevel.getGridPositionFromXY(this.x, this.y);
            this.setGridPosition(finalGridPos.row, finalGridPos.col);
            this.dragAxis = 'NOT_ASSIGNED';

            // get the player
            const player = (this.scene as GameScene).getPlayer();
    
            // decrease the players move count
            if (player) {
                // check we didn't just end up back in original position
                if (!(finalGridPos.row === this.ogDragGridPosition.row && finalGridPos.col === this.ogDragGridPosition.col)) {
                    player.adjustStat('MOVE_BOOSTER', -1);
                }
            }
        })
    }

    public quenchThirst() {
        // go through a 3x3 grid of all objects and find gotchis
        for (let i = this.gridPosition.row-1; i < this.gridPosition.row + 2; i++) {
            for (let j = this.gridPosition.col-1; j < this.gridPosition.col + 2; j++) {
                const go = this.gridLevel.getGridObject(i, j);
                if (go && go.getType() === 'GOTCHI') {

                    const gotchi = (go as GO_Gotchi);
                    // increase the gotchis score bonus
                    gotchi.scoreBonus += 10;

                    // generate a pink splash image
                    const explosionImage = this.scene.add.image(
                        gotchi.x,
                        gotchi.y,
                        PIXEL_PINK_SPLASH
                    )
                    .setDisplaySize(gotchi.displayWidth, gotchi.displayHeight)
                    .setDepth(gotchi.depth+1)
                    .setOrigin(0.5, 0.5)
                    .setAlpha(1)
                    .setScrollFactor(0);
            
                    this.scene.add.tween({
                        targets: [explosionImage, this],
                        alpha: 0,
                        duration: 500,
                        onComplete: () => { 
                            explosionImage.destroy() 
                            this.destroy()
                        },
                    })
                }
            }
        }

        // I have no idea but i have to do a weird timeout for this to work properly????
        // instantly setting to empty grid object doesn't seem to be recognized
        setTimeout(() => this.gridLevel.setEmptyGridObject(this.gridPosition.row, this.gridPosition.col),500);
    }

    destroy() {
        super.destroy();
    }

    update(): void {
        super.update();
    }
}
  