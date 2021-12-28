// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridLevel, GridObject, Player } from 'game/objects';
import { GridPosition } from '../grid-level';
import { PIXEL_EXPLOSION, PORTAL_OPEN, SOUND_EXPLOSION, SOUND_POP } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GO_PORTAL } from 'game/helpers/constants';

interface Congotchi {
    gotchi: GO_Gotchi;
    newRow: number;
    newCol: number;
    newDir: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT';
    status: 'READY' | 'CONGOTCHING';
}
  
export class GO_Grenade extends GridObject {
    private status: 'OPEN' | 'CLOSED' = 'CLOSED';

    // timer is for click events
    private timer = 0;

    // define variables for dragging object
    private ogDragGridPosition = { row: 0, col: 0 };
    private ogX = 0;
    private ogY = 0;

    // add sound effects
    private soundMove?: Phaser.Sound.HTML5AudioSound;
    private soundInteract?: Phaser.Sound.HTML5AudioSound;

    // our constructor
    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'GRENADE'});

        // enable draggable input
        this.setInteractive();
        this.scene.input.setDraggable(this);

        // set our bg colour
        this.setBgSquareColour('RED');

        // set a specific depth
        this.setDepth(DEPTH_GO_PORTAL);

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_EXPLOSION, { loop: false }) as Phaser.Sound.HTML5AudioSound;

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
                // check we've got enough interact points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_RED') > 0) {
                    // we have enough so make bomb explode
                    this.explode();

                    // reduce stat
                    player.adjustStat('INTERACT_RED', -1);

                    // play the interact sound
                    this.soundInteract?.play();
                }
            }
        });

        // dragstart
        this.on('dragstart', () => {
            // store our initial drag positions
            this.ogDragGridPosition = this.getGridPosition();
            this.ogX = this.x;
            this.ogY = this.y;
        })

        // set behaviour for dragging
        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            const gameScene = this.scene as GameScene;
            const player = gameScene.getPlayer();

            if (gameScene && player) {    
                // if we've got movement points left we can drag
                if (player.getStat('MOVE_RED') > 0) {
                    // only drag objects into grids they have space for
                    const gp = this.getGridPosition();
                    const aboveEmpty = gp.row > 0 && this.gridLevel.isGridPositionEmpty(gp.row-1, gp.col);
                    const belowEmpty = gp.row < this.gridLevel.getNumberRows()-1 && this.gridLevel.isGridPositionEmpty(gp.row+1, gp.col);
                    const leftEmpty = gp.col > 0 && this.gridLevel.isGridPositionEmpty(gp.row, gp.col-1);
                    const rightEmpty = gp.col < this.gridLevel.getNumberCols()-1 && this.gridLevel.isGridPositionEmpty(gp.row, gp.col+1);
                    
                    const adoX = this.ogX;
                    const adoY = this.ogY;
                    const upLimit = aboveEmpty ? adoY - this.gridLevel.getGridSize() : adoY;
                    const downLimit = belowEmpty ? adoY + this.gridLevel.getGridSize() : adoY;
                    const leftLimit = leftEmpty ? adoX - this.gridLevel.getGridSize() : adoX;
                    const rightLimit = rightEmpty ? adoX + this.gridLevel.getGridSize() : adoX;

                    // find out if we're further from original X or Y
                    const deltaX = this.ogX - dragX;
                    const deltaY = this.ogY - dragY;

                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        if (dragX > leftLimit && dragX < rightLimit) this.x = dragX;
                        this.y = this.ogY;
                    } else {
                        if (dragY > upLimit && dragY < downLimit) this.y = dragY;
                        this.x = this.ogX;
                    }
                }
            }
        });

        this.on('dragend', () => {
            // store the grid position dragging finished in
            const finalGridPos = this.gridLevel.getGridPositionFromXY(this.x, this.y);
            this.setGridPosition(finalGridPos.row, finalGridPos.col);

            // get the player
            const player = (this.scene as GameScene).getPlayer();
    
            // decrease the players move count
            if (player) {
                // check we didn't just end up back in original position
                if (!(finalGridPos.row === this.ogDragGridPosition.row && finalGridPos.col === this.ogDragGridPosition.col)) {
                    player.adjustStat('MOVE_RED', -1);

                    // play the move sound
                    this.soundMove?.play();
                }
            }
        })
    }

    public explode() {
        // create an explosion tween
        const explosionImage = this.scene.add.image(
            this.x,
            this.y,
            PIXEL_EXPLOSION
        )
        .setDisplaySize(this.displayWidth*3, this.displayHeight*3)
        .setDepth(this.depth+1)
        .setOrigin(0.5, 0.5)
        .setAlpha(1)
        .setScrollFactor(0);

        this.scene.add.tween({
            targets: explosionImage,
            alpha: 0,
            duration: 500,
            onComplete: () => { 
                explosionImage.destroy() 
                this.destroy()
            },
        })

        // go through a 3x3 grid of all objects and set any gotchis to burnt status
        for (let i = this.gridPosition.row-1; i < this.gridPosition.row + 2; i++) {
            for (let j = this.gridPosition.col-1; j < this.gridPosition.col + 2; j++) {
                const go = this.gridLevel.getGridObject(i, j);
                if (go !== 'OUT OF BOUNDS' && go.getType() === 'GOTCHI') {
                    (go as GO_Gotchi).status = 'BURNT';
                }
            }
        }

        // I have no idea but i have to do a weird timeout for this to work properly????
        // instantly setting to empty grid object doesn't seem to be recognized
        setTimeout(() => this.gridLevel.setEmptyGridObject(this.gridPosition.row, this.gridPosition.col),500);

        this.setVisible(false);
    }

    update(): void {
        super.update();
    }
}
  