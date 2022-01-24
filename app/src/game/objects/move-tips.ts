// move-tips.ts - object that inserts tips into specific levels and called by the grid level object

import { ICON_HAND_CLOSED, ICON_HAND_POINTING } from "game/assets";
import { getGameHeight, getGameWidth, } from "game/helpers";
import { DEPTH_MOVE_TIPS } from "game/helpers/constants";
import { GridLevel } from ".";

export class MoveTips {
    // basic vars to store
    private scene?: Phaser.Scene;
    private gridLevel?: GridLevel;

    // need our main point and click image
    private hand?: Phaser.GameObjects.Image;

    // need a variable to track if the tool tip is still active
    private active = true;
    
    constructor(scene: Phaser.Scene, gridLevel: GridLevel, levelNumber: number) {
        // save our basic vars
        this.scene = scene;
        this.gridLevel = gridLevel;

        // create a standard hand image starting with pointing icon
        this.hand = this.scene.add.image(getGameWidth(this.scene)*0.5, getGameHeight(this.scene)*0.5, ICON_HAND_POINTING)
            .setScrollFactor(0)
            .setDisplaySize(this.gridLevel.getGridSize(), this.gridLevel.getGridSize())
            .setOrigin(0.5,0.5)
            .setDepth(DEPTH_MOVE_TIPS)
            .setVisible(false)
            .setInteractive();

        // position tool tip based on the level number we've been given
        switch (levelNumber) {
            case 1: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(5, 3, 5, 4), 250);
                break;
            }
            case 2: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(3, 2, 3, 3), 250);
                break;
            }
            case 4: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(3, 4, 3, 3), 250);
                break;
            }
            case 5: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(1, 3, 1, 2), 250);
                break;
            }
            case 6: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(3, 3, 3, 2), 250);
                break;
            }
            case 7: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(4, 5, 3, 5), 250);
                break;
            }
            case 9: {
                // set position of our hand
                setTimeout( () => this.clickDragAcrossLoop(4, 3, 3, 3), 250);
                break;
            }
        
        }
        
        // for simplicity we will disable the tooltip after a hover event
        this.hand?.on('pointerover', () => {
            this.active = false;
            this.hand?.destroy();
        });

    }

    public clickDragAcrossLoop(rowStart: number, colStart: number, rowEnd: number, colEnd: number) {
        // first tween is the open hand scaling down in size slightly at starting grid
        if (this.gridLevel && this.active && this.hand) {
            this.hand?.setTexture(ICON_HAND_POINTING);
            this.hand?.setDisplaySize(this.gridLevel?.getGridSize(), this.gridLevel?.getGridSize());
            this.hand?.setPosition(this.gridLevel.getXFromCol(colStart), this.gridLevel.getYFromRow(rowStart));
            this.hand?.setVisible(true);

            this.scene?.tweens.add({
                targets: this.hand,
                displayWidth: this.gridLevel.getGridSize() * 0.8,
                displayHeight: this.gridLevel.getGridSize() * 0.8,
                duration: 250,
                onComplete: () => {
                    if (this.gridLevel && this.active && this.hand) {
                        this.hand?.setTexture(ICON_HAND_CLOSED);

                        this.scene?.tweens.add({
                            targets: this.hand,
                            duration: 500,
                            x: this.gridLevel.getXFromCol(colEnd),
                            y: this.gridLevel.getYFromRow(rowEnd),
                            onComplete: () => {
                                setTimeout(() => this.clickDragAcrossLoop(rowStart, colStart, rowEnd, colEnd), 250);
                            }
                        })
                    }
                }
            })
        } else {
            this.hand?.destroy();
        }
    }

    public update() {
        //
    }

    public destroy() {
        // delete our hand image
        this.hand?.destroy();
        this.active = false;
    }
}