// go-cactii.ts - the aggro cactii class

import { GO_Props, GridObject, } from 'game/objects';
import { PIXEL_EXPLOSION, SOUND_POP, UNCOMMON_CACTII } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
  
export class GO_Cactii extends GridObject {
    private status: 'LIVE' | 'EXPLODED' = 'LIVE';

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
    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize, objectType: 'CACTII'});

        // set the block texture
        this.blockSprite?.setTexture(UNCOMMON_CACTII);
        this.blockSprite?.setDisplaySize(this.gridSize*0.95, this.gridSize*0.95);

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;

        // set behaviour for pointer click down
        this.on('pointerdown', () => {
            // get the time and grid we clicked in
            this.timer = new Date().getTime();
        });

        // set behaviour for pointer up event
        this.on('pointerup', () => {
            // see if we're close to a pointer down event for a single click
            const delta = new Date().getTime() - this.timer;
            if (delta < 200) {
                // do something on click
                
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
            // if we've got actions remaining we can drag
            if (this.gridLevel.getActionsRemaining() > 0) {
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
            
        });

        this.on('dragend', () => {
            // store the grid position dragging finished in
            const finalGridPos = this.gridLevel.getGridPositionFromXY(this.x, this.y);
            this.setGridPosition(finalGridPos.row, finalGridPos.col);

            // check we didn't just end up back in original position
            if (!(finalGridPos.row === this.ogDragGridPosition.row && finalGridPos.col === this.ogDragGridPosition.col)) {
                // let the server know a grid object has been moved
                (this.scene as GameScene).socket?.emit('gridObjectMoved');

                // play the move sound
                this.soundMove?.play();
            }
        })
    }

    public explode() {
        // check grenade hasn't already exploded
        if (this.status === 'LIVE') {
            // change status
            this.status = 'EXPLODED';

            // create an explosion tween
            const explosionImage = this.scene.add.image(
                this.x,
                this.y,
                PIXEL_EXPLOSION
            )
            .setDisplaySize(this.displayWidth, this.displayHeight)
            .setDepth(this.depth+1)
            .setOrigin(0.5, 0.5)
            .setAlpha(1)
            .setScrollFactor(0);

            // hide the grenade
            this.setVisible(false);
            this.blockSprite?.setVisible(false);

            this.scene.add.tween({
                targets: explosionImage,
                alpha: 0,
                duration: 250,
                onComplete: () => { 
                    this.gridLevel.setEmptyGridObject(this.gridPosition.row, this.gridPosition.col)
                    explosionImage.destroy() 
                    this.destroy()
                },
            })
        }
    }

    update(): void {
        super.update();
    }
}
  