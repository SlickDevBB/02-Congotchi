// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridObject, } from 'game/objects';
import { M67_GRENADE, PIXEL_EXPLOSION, SOUND_EXPLOSION, SOUND_POP } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { GO_Milkshake } from './go-milkshake';
import { GO_Cactii } from './go-cactii';
import { getGameHeight, getGameWidth } from 'game/helpers';
  
export class GO_Grenade extends GridObject {
    // our bomb status
    private status: 'LIVE' | 'TRIGGERED' | 'EXPLODED' = 'LIVE';

    // some phaser text for countdown
    private countdownText?: Phaser.GameObjects.Text;
    private countdown = 3;

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
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'GRENADE'});

        // set our block sprite
        this.blockSprite?.setTexture(M67_GRENADE);
        this.blockSprite?.setDisplaySize(this.gridSize, this.gridSize);

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_EXPLOSION, { loop: false }) as Phaser.Sound.HTML5AudioSound;

        // create countdown text
        const fontHeight = this.displayHeight*0.75;
        this.countdownText = this.scene.add.text(
            this.x, 
            this.y,
            this.countdown.toString(),
            { font: fontHeight+'px Courier', color: '#ffcc14' })
            .setAlign('center')
            .setStroke('#5e2c00', this.displayHeight*0.1)
            .setDepth(this.depth+10)
            .setOrigin(0.5,0.5)
            .setScrollFactor(0)
            .setVisible(false);

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

                // trigger the bomb!
                this.trigger();
            }
        })
    }

    // trigger() - use this function to start 3 second countdown on grenade after which time it will explode()
    public trigger() {
        // trigger only works with live grenades...
        if (this.status === 'LIVE') {
            // change status
            this.status = 'TRIGGERED';

            // declare duration between 3, 2 and 1
            const deltaTime = 750;
            const easeType = 'Quad.easeIn';

            // make text visible and set to 3
            this.countdownText?.setVisible(true);
            this.countdownText?.setText('3');

            // Use 3 tweens to show countdown
            this.scene.add.tween({
                targets: this.countdownText,
                alpha: 0,
                ease: easeType,
                duration: deltaTime,
                onComplete: () => {
                    // reset alpha to 1, set text to 2 and tween fade out
                    this.countdownText?.setAlpha(1);
                    this.countdownText?.setText('2');
                    this.scene.add.tween({
                        targets: this.countdownText,
                        alpha: 0,
                        ease: easeType,
                        duration: deltaTime,
                        onComplete: () => {
                            // reset alpha to 1, set text to 1 and tween fade out again
                            this.countdownText?.setAlpha(1);
                            this.countdownText?.setText('1');
                            this.scene.add.tween({
                                targets: this.countdownText,
                                alpha: 0,
                                ease: easeType,
                                duration: deltaTime,
                                onComplete: () => {
                                    // explode
                                    this.explode();
                                }
                            })
                        }
                    })
                }
            })
        }
    }

    public explode() {
        // check grenade hasn't already exploded
        if (this.status !== 'EXPLODED') {
            // change status
            this.status = 'EXPLODED';

            // score some points for exploding grenade
            if (this.player) {
                this.gui?.adjustScoreWithAnim(this.player.getStat('RED_ACTIVATE'), this.x, this.y);
                this.player.animStat('RED_ACTIVATE');
            }

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

            // go through a 3x3 grid of all objects and set any gotchis to burnt status and explode any other bombs and destroy milkshakes
            for (let i = this.gridPosition.row-1; i < this.gridPosition.row + 2; i++) {
                for (let j = this.gridPosition.col-1; j < this.gridPosition.col + 2; j++) {
                    const go = this.gridLevel.getGridObject(i, j);
                    if (go !== 'OUT OF BOUNDS') {
                        if (go.getType() === 'GOTCHI' || go.getType() === 'ROFL') {
                            (go as GO_Gotchi).status = 'BURNT';
                        }
                        else if (go.getType() === 'GRENADE') {
                            setTimeout(() => (go as GO_Grenade).explode(), 300);
                        }
                        else if (go.getType() === 'MILKSHAKE') {
                            // empty out the grid position with the milkshake ini it
                            this.gridLevel.setEmptyGridObject(go.getGridPosition().row, go.getGridPosition().col);

                            // destroy the milkshake
                            (go as GO_Milkshake).destroy();
                        }
                        else if (go.getType() === 'CACTII') {
                            // empty out the grid position with the cactii ini it
                            this.gridLevel.setEmptyGridObject(go.getGridPosition().row, go.getGridPosition().col);

                            // destroy the cactii
                            (go as GO_Cactii).destroy();
                        }
                    } 
                }
            }
        }
    }

    update(): void {
        super.update();

        // update position of the countdown text
        this.countdownText?.setPosition(this.x, this.y);
    }
}
  