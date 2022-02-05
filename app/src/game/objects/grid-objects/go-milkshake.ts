// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridObject, } from 'game/objects';
import { MILKSHAKE, PIXEL_PINK_SPLASH, SOUND_POP, SOUND_SLURP } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
  
export class GO_Milkshake extends GridObject {
    // status of milkshake
    private status: 'ACTIVE' | 'DRANK' = 'ACTIVE';

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
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'MILKSHAKE'});

        // Set the block sprite
        this.blockSprite?.setTexture(MILKSHAKE);
        this.blockSprite?.setDisplaySize(this.gridSize, this.gridSize);

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_SLURP, { loop: false }) as Phaser.Sound.HTML5AudioSound;

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
            // if we've got movement points left we can drag
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
                // reduce actions remaining
                this.gridLevel.adjustActionsRemaining(-1);

                // play the move sound
                this.soundMove?.play();
            }
        })
    }

    public quenchThirst(thirstyGotchis: Array<GO_Gotchi>) {
        // Set milkshake to drank
        this.status = 'DRANK';

        // play slurp
        this.soundInteract?.play();

        // score some points for activating a milkshake
        if (this.player) {
            this.gui?.adjustScoreWithAnim(this.player.getStat('GREEN_ACTIVATE'), this.x, this.y);
            this.player.animStat('GREEN_ACTIVATE');
        }

        // Go through thirstY gotchis and give them all a drink
        thirstyGotchis.map( gotchi => {
            // score some points for feeding a gotchi or rofl
            if (this.player) {
                this.gui?.adjustScoreWithAnim(this.player.getStat('GREEN_BUFF'), gotchi.x, gotchi.y);
                this.player.animStat('GREEN_BUFF');
            }

            // do a milkshake jump for the gotchi
            gotchi.milkshakeJump();

            // generate a pink splash image
            const explosionImage = this.scene.add.image(
                gotchi.x,
                gotchi.y,
                PIXEL_PINK_SPLASH
            )
            .setDisplaySize(gotchi.displayWidth, gotchi.displayHeight)
            .setDepth(gotchi.depth+10000)
            .setOrigin(0.5, 0.5)
            .setAlpha(1)
            .setScrollFactor(0);
    
            this.scene.add.tween({
                targets: [explosionImage, this, this.blockSprite],
                alpha: 0,
                duration: 500,
                onComplete: () => { 
                    explosionImage.destroy() 
                },
            })
        });

        // I have no idea but i have to do a weird timeout for this to work properly????
        // instantly setting to empty grid object doesn't seem to be recognized
        setTimeout(() => this.gridLevel.setEmptyGridObject(this.gridPosition.row, this.gridPosition.col),500);
    }

    destroy() {
        super.destroy();
    }

    update(): void {
        super.update();

        if (this.status === 'ACTIVE') {

            let drinkTime = false;

            const thirstyGotchis: Array<GO_Gotchi> = [];

            // anytime a milkshake is near a gotchi activate quench thirst
            const downGotchi = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col);
            if (downGotchi !== 'OUT OF BOUNDS' && (downGotchi.getType() === 'GOTCHI' || downGotchi.getType() === 'ROFL')) {
                drinkTime = true;
                thirstyGotchis.push(downGotchi as GO_Gotchi);
                (downGotchi as GO_Gotchi).aimAtGridPosition(this.gridPosition.row, this.gridPosition.col);
            }

            const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1);
            if (leftGotchi !== 'OUT OF BOUNDS' && (leftGotchi.getType() === 'GOTCHI' || leftGotchi.getType() === 'ROFL')) {
                drinkTime = true;
                thirstyGotchis.push(leftGotchi as GO_Gotchi);
                (leftGotchi as GO_Gotchi).aimAtGridPosition(this.gridPosition.row, this.gridPosition.col);
            }

            const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col);
            if (upGotchi !== 'OUT OF BOUNDS' && (upGotchi.getType() === 'GOTCHI' || upGotchi.getType() === 'ROFL')) {
                drinkTime = true;
                thirstyGotchis.push(upGotchi as GO_Gotchi);
                (upGotchi as GO_Gotchi).aimAtGridPosition(this.gridPosition.row, this.gridPosition.col);
            }

            const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1);
            if (rightGotchi !== 'OUT OF BOUNDS' && (rightGotchi.getType() === 'GOTCHI' || rightGotchi.getType() === 'ROFL')) {
                drinkTime = true;
                thirstyGotchis.push(rightGotchi as GO_Gotchi);
                (rightGotchi as GO_Gotchi).aimAtGridPosition(this.gridPosition.row, this.gridPosition.col);
            }

            // if drink time quench thirst
            if (drinkTime) this.quenchThirst(thirstyGotchis);
        }

    }
}
  