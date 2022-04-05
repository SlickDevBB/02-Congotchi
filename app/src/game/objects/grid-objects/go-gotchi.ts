// go-gotchi.ts - gotchi class

import { GO_Props, GridObject, GridLevel } from 'game/objects';
import { ARROW_ICON, PARTICLE_CONFETTI, SOUND_BELL, SOUND_POP } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GOTCHI_ICON, DEPTH_GO_GOTCHI, DEPTH_GO_GOTCHI_BLOCK } from 'game/helpers/constants';
import { getGameHeight } from 'game/helpers';
import { GO_Cactii } from './go-cactii';
import { textChangeRangeIsUnchanged } from 'typescript';
import { POINTS_CACTII_SPIKE, POINTS_CONGA_JUMP, POINTS_SAVE_GOTCHI } from 'helpers/constants';

export interface GO_Gotchi_Props extends GO_Props {
    direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT';
}
  
export class GO_Gotchi extends GridObject {
    private direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';
    private leader: GridObject | 0 = 0;
    private followers: Array<GridObject | 0> = [0, 0, 0, 0]; // element 0 is down, 1 is left, 2 is up, 3 is right
    // private gotchi: AavegotchiGameObject;
    
    // a variable to show we're a congaleader aimed at a portal
    private congaLeader = false;

    // create arrows which are used to depict direction changes
    private arrows: Array<Phaser.GameObjects.Image> = [];

    private spiked = false;

    // declare variable for setting visibility of rotate arrows
    private rotateArrowsVisible = false;
    private overArrows = false;
    private overGotchi = false;

    // store the active pointer
    private mousePointer: Phaser.Input.Pointer;

    // conga side is a variable for tracking which side we conga on
    private congaSide: 'LEFT' | 'RIGHT' = 'LEFT';

    // duration variable for conga steps
    private congaStepDuration = 60/140*1000;

    // timer is for click events
    private timer = 0;

    // define variables for dragging object
    private ogDragGridPosition = { row: 0, col: 0 };
    private ogX = 0;
    private ogY = 0;

    // define public variables for conga
    public newRow = 0;
    public newCol = 0;
    public newDir: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';
    public status: 'READY_TO_CONGA' | 'READY_TO_JUMP' | 'CONGOTCHING' | 'JUMPING' | 'FINISHED_CONGA' | 'WAITING' | 'BURNT' | 'TELEPORTING' = 'WAITING';

    // this multiplier should be changed by rofl's
    protected teleportScoreMultiplier = 1;

    // add sound effects
    private soundMove?: Phaser.Sound.HTML5AudioSound;
    private soundInteract?: Phaser.Sound.HTML5AudioSound;
    private soundBell?: Phaser.Sound.HTML5AudioSound;

    // create particle effects
    private particleConfetti?: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private emitterConfetti?: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType = 'GOTCHI', direction = 'DOWN' }: GO_Gotchi_Props) {//gotchi, gridSize, objectType }: GO_Gotchi_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize, objectType});

        // set our block sprite size
        this.blockSprite?.setDisplaySize(this.gridSize*0.7, this.gridSize*0.7);

        // Set our direcction
        this.direction = direction;

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundBell = this.scene.sound.add(SOUND_BELL, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundBell.setVolume(0.5);

        // add particle manager
        this.particleConfetti = this.scene.add.particles(PARTICLE_CONFETTI);
        this.particleConfetti.setDepth(this.depth + 10);

        // create emitter with some slightly randomized attributes for each gotchi
        const angleRand = (Math.random()-0.5)*10;
        const speedRand = (Math.random()-0.5)*50;
        const lifespanRand = (Math.random()-0.5)*100;
        const quantityRand = Math.floor((Math.random()-0.5)*5);

        // add particle emitter
        this.emitterConfetti = this.particleConfetti.createEmitter({
            frame: [ 'red', 'blue', 'green', 'yellow' ],
            x: this.x,
            y: this.y,
            angle: { min: -100+angleRand, max: -80+angleRand },
            gravityY: 2000,
            speed: 500+speedRand,
            lifespan: 750+lifespanRand,
            quantity: 15+quantityRand,
            scale: { start: 0.1, end: 0 },
            blendMode: 'COPY'
        })
        .setScrollFactor(0)
        .stop();

        // save the mouse
        this.mousePointer = this.scene.input.activePointer;

        this.on('pointerover', () => {
            console.log('My status: ' + this.status);
        })

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
                
                const upLimit = aboveEmpty ? this.ogY - this.gridLevel.getGridSize() : this.ogY;
                const downLimit = belowEmpty ? this.ogY + this.gridLevel.getGridSize() : this.ogY;
                const leftLimit = leftEmpty ? this.ogX - this.gridLevel.getGridSize() : this.ogX;
                const rightLimit = rightEmpty ? this.ogX + this.gridLevel.getGridSize() : this.ogX;

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
            this.setGridPosition(finalGridPos.row, finalGridPos.col, () => {
                // adjust the player stat if we're in different grid position from start of drag
                if (!(finalGridPos.row === this.ogDragGridPosition.row && finalGridPos.col === this.ogDragGridPosition.col)) {
                    // let the server know a grid object has been moved
                    (this.scene as GameScene).socket?.emit('gridObjectMoved');

                    // in case we were burnt change status back to 'WAITING'
                    this.status = 'WAITING';

                    // play the move sound
                    this.soundMove?.play();
                }
            });
        })
    }

    public setGotchiSprite(key: string) {
        // set our block texture
        this.blockSprite?.setTexture(key);

        // set depths a bit different
        const currentDepth = this.depth;
        this.setDepth(currentDepth - 1);
        this.blockSprite?.setDepth(currentDepth + 2);

        // // Add animations if we're a gotchi (and not a rofl)
        if (this.objectType === 'GOTCHI') {
            this.blockSprite?.anims.create({
                key: 'down',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 0, end: 0 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'left',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 2, end: 2 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'right',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 4, end: 4 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'up',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 6, end: 6 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'down_happy',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 8, end: 8 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'left_happy',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 10, end: 10 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'right_happy',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 12, end: 12 }),
                frameRate: 2,
                repeat: -1,
            });
            this.blockSprite?.anims.create({
                key: 'up_happy',
                frames: this.blockSprite?.anims.generateFrameNumbers(key || '', { start: 14, end: 14 }),
                frameRate: 2,
                repeat: -1,
            });

            this.blockSprite?.anims.play('down');
        }

        // set our direction
        this.setDirection(this.direction);
    }

    // a function to see if there is a certain status up the chain
    public isUpchainStatus(status: 'READY_TO_CONGA' | 'READY_TO_JUMP' | 'CONGOTCHING' | 'JUMPING' | 'FINISHED_CONGA' | 'WAITING' | 'BURNT' | 'TELEPORTING'): boolean {
        const leader = this.leader as GO_Gotchi;
        if (leader) {
            if (leader.status === status) {
                return true;
            } else {
                return leader.isUpchainStatus(status);
            }
        } else {
            return false;
        }
    }

    public makeCongaLeader(value: boolean) {
        this.congaLeader = value;
    }

    public isCongaLeader() {
        return this.congaLeader;
    }

    public setLeader(leader: GO_Gotchi | 0) {
        this.leader = leader;
        return this;
    }

    public getLeader() {
        return this.leader;
    }

    public hasLeader() {
        if (this.leader) return true;
        else return false;
    }

    public getFollowers() {
        return this.followers;
    }

    public clearFollowers() {
        this.followers = [];
    }

    public hasFollower() {
        let haveFollower = false;
        this.followers.map( follower => { if (follower) haveFollower = true; });
        return haveFollower;
    }

    public getDirection() {
        return this.direction;
    }

    public setDirection(direction: 'DOWN' | 'LEFT' | 'RIGHT' | 'UP') {
        this.direction = direction;
        // check we're not a rofl
        if (this.objectType === 'GOTCHI') {
            switch (direction) {
                case 'DOWN': {
                    this.blockSprite?.anims.play('down');
                    break;
                }
                case 'LEFT': {
                    this.blockSprite?.anims.play('left');
                    break;
                }
                case 'RIGHT': {
                    this.blockSprite?.anims.play('right');
                    break;
                }
                case 'UP': {
                    this.blockSprite?.anims.play('up');
                    break;
                }
                default: {
                    
                    break;
                }
            }
        }
        return this;
    }

    public setRandomDirection() {
        const rand = Math.floor(Math.random()*4);
        if (rand === 0) this.setDirection('DOWN');
        else if (rand === 1) this.setDirection('LEFT');
        else if (rand === 2) this.setDirection('RIGHT');
        else this.setDirection('UP');
        return this;
    }

    // aimAtGridPosition() does the best job of aiming a gotchi at a certain given grid position.
    public aimAtGridPosition(row: number, col: number) {
        // find out the row and column deltas
        const deltaRow = this.gridPosition.row - row;
        const deltaCol = this.gridPosition.col - col;

        // if smaller difference in columns than rows its a left/right direction
        if (Math.abs(deltaRow) < Math.abs(deltaCol)) {
            if (deltaCol > 0) this.setDirection('LEFT');
            else this.setDirection('RIGHT');
        } // or if column delta is less we're up/down (however sometimes we end up with same deltas so just treat up/down as default fallback as well)
        else {
            if (deltaRow > 0) this.setDirection('UP');
            else this.setDirection('DOWN');
        }
    }

    public congaIntoPosition(row: number, col: number, jumpAtEnd: boolean) {
        // update our status
        this.status = 'CONGOTCHING';

        // call our set grid position that moves our gotchi
        this.setGridPosition(
            row,
            col,
            () => {
                if (!jumpAtEnd) {
                    setTimeout( () => {
                        // check we didn't get blown up mid conga
                        if (this.status !== 'BURNT') this.status = 'WAITING';
                    } , this.congaStepDuration*0.5);
                } else {
                    // again check we didn't get blown up mid conga
                    if (this.status !== 'BURNT') this.congaJump();
                }
            },
            false,
            this.congaStepDuration*0.5,
            'Back.easeOut'
        )

        // add another tween for our gotchi which rotates him a bit to look conga'ish
        this.scene.add.tween({
            targets: this.blockSprite,
            angle: this.congaSide === 'LEFT' ? -20 : 20,
            duration: this.congaStepDuration*0.25,
            ease: 'Quint.easeOut',
            yoyo: true,
            onComplete: () => {
                // change conga side
                this.congaSide = this.congaSide === 'LEFT' ? 'RIGHT' : 'LEFT';
            }
        })

        return this;

    }

    public congaStationary(jumpAtEnd: boolean) {
        // add a tween for our gotchi which rotates him a bit to look conga'ish
        this.scene.add.tween({
            targets: this.blockSprite,
            angle: this.congaSide === 'LEFT' ? -20 : 20,
            duration: this.congaStepDuration*0.25,
            ease: 'Quint.easeOut',
            yoyo: true,
            onComplete: () => {
                // change conga side
                this.congaSide = this.congaSide === 'LEFT' ? 'RIGHT' : 'LEFT';
                if (jumpAtEnd) {
                    // Check we didn't get blown up mid conga
                    if (this.status !== 'BURNT') this.congaJump();
                }
            }
        })

        return this;
    }

    public congaJump() {
        // change anim to happy (only if we're a gotchi)
        if (this.objectType === 'GOTCHI') this.blockSprite?.anims.play(this.getDirection().toLowerCase() + '_happy');

        // throw some confetti
        this.emitterConfetti?.start();
        setTimeout( () => {
            this.emitterConfetti?.stop();
        }, 75);

        // change status to jumping
        this.status = 'JUMPING';

        // tell the server and gui we're doing a conga jump
        if (this.player) {
            (this.scene as GameScene).socket?.emit('congaJump');
            this.gui?.animScorePoints(POINTS_CONGA_JUMP, this.x, this.y);
        }

        // tween a jump
        this.scene.add.tween({
            targets: this,
            y: this.y - this.displayHeight*0.5,
            duration: this.congaStepDuration*0.25,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.scene.add.tween({
                    targets: this,
                    y: this.y + this.displayHeight*0.5,
                    duration: this.congaStepDuration*0.25,
                    ease: 'Quad.easeIn',
                    onComplete: () => { 
                        setTimeout( () => {
                            // check we didn't ge burnt mid jump
                            if (this.status !== 'BURNT') this.status = 'WAITING';
                        }, this.congaStepDuration );
                    }
                })
            }
        });
    }

    // milkshakeJump() - an excited jump when a gotchi gets fed a milkshake
    public milkshakeJump() {
        // change anim to happy (only if we're a gotchi)
        if (this.objectType === 'GOTCHI') this.blockSprite?.anims.play(this.getDirection().toLowerCase() + '_happy');

        // tween a jump
        this.scene.add.tween({
            targets: this,
            y: this.y - this.displayHeight*0.35,
            duration: this.congaStepDuration*0.25,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.scene.add.tween({
                    targets: this,
                    y: this.y + this.displayHeight*0.35,
                    duration: this.congaStepDuration*0.25,
                    ease: 'Quad.easeIn',
                    onComplete: () => { 
                        setTimeout( () => {
                            // check we didn't ge burnt mid jump
                            if (this.status !== 'BURNT') this.status = 'WAITING';
                        }, this.congaStepDuration );
                    }
                })
            }
        });
    }

    public congaIntoPortal(row: number, col: number) {
        // tell server and gui to save a gotchi
        if (this.player) {
            (this.scene as GameScene).socket?.emit('saveGotchi');
            this.gui?.animScorePoints(POINTS_SAVE_GOTCHI, this.x, this.y);
        }

        // Let's get in that portal
        this.setGridPosition(
            row,
            col,
            () => {
                // change status to teleporting
                this.status = 'TELEPORTING';

                // hide our bgBlock
                this.setVisible(false);
                this.blockSprite?.setVisible(true);

                // spiral the gotchi into the portal
                this.scene.add.tween({
                    targets: this.blockSprite,
                    scale: 0,
                    angle: 720,
                    duration: 500,
                    onComplete: () => {
                        this.destroy();
                    }
                });
            },
            true,
            this.congaStepDuration*0.5,
        )

        return this;
    }

    // this function checks if we're adjacent a cactii and if TRUE then we lose pointDelta
    public cactiiSpike(pointDelta: number) {
        // get our gotchis grid position
        const pos = this.gridPosition;

        // check down
        const downCactii = this.gridLevel.getGridObject(pos.row, pos.col+1);
        if (downCactii !== 'OUT OF BOUNDS' && downCactii.getType() === 'CACTII') {
            this.spiked = true;
        }

        // check left
        const leftCactii = this.gridLevel.getGridObject(pos.row-1, pos.col);
        if (leftCactii !== 'OUT OF BOUNDS' && leftCactii.getType() === 'CACTII') {
            this.spiked = true;
        }

        // check up
        const upCactii = this.gridLevel.getGridObject(pos.row, pos.col-1);
        if (upCactii !== 'OUT OF BOUNDS' && upCactii.getType() === 'CACTII') {
            this.spiked = true;
        }

        // check right
        const rightCactii = this.gridLevel.getGridObject(pos.row+1, pos.col);
        if (rightCactii !== 'OUT OF BOUNDS' && rightCactii.getType() === 'CACTII') {
            this.spiked = true;
        }

        // // check bottom left
        // const downLeftCactii = this.gridLevel.getGridObject(pos.row-1, pos.col+1);
        // if (downLeftCactii !== 'OUT OF BOUNDS' && downLeftCactii.getType() === 'CACTII') {
        //     this.spiked = true;
        // }

        // // check top left
        // const upLeftCactii = this.gridLevel.getGridObject(pos.row-1, pos.col-1);
        // if (upLeftCactii !== 'OUT OF BOUNDS' && upLeftCactii.getType() === 'CACTII') {
        //     this.spiked = true;
        // }

        // // check top right
        // const upRightCactii = this.gridLevel.getGridObject(pos.row+1, pos.col-1);
        // if (upRightCactii !== 'OUT OF BOUNDS' && upRightCactii.getType() === 'CACTII') {
        //     this.spiked = true;
        // }

        // // check bottom right
        // const downRightCactii = this.gridLevel.getGridObject(pos.row+1, pos.col+1);
        // if (downRightCactii !== 'OUT OF BOUNDS' && downRightCactii.getType() === 'CACTII') {
        //     this.spiked = true;
        // }

        // do stuff if we got spiked
        const dt = {t: 0};
        if (this.spiked) {
            // reduce our total score if spiked
            if (this.player) {
                (this.scene as GameScene).socket?.emit('cactiiSpike');
                this.gui?.animScorePoints(POINTS_CACTII_SPIKE, this.x, this.y);
            }

            // show a quick red tween for "damage"
            this.scene.add.tween({
                targets: dt,
                t: 1,
                duration: 250,
                onUpdate: () => {
                    const colour = Phaser.Display.Color.HexStringToColor(this.lerpColor('#ff0000', '#ffffff', dt.t));
                    this.blockSprite?.setTint(colour.color);
                },
                onComplete: () => { 
                    this.spiked = false; 
                }
            })
        }
    }

    /**
     * A linear interpolator for hexadecimal colors
     * @param {String} a
     * @param {String} b
     * @param {Number} amount
     * @example
     * // returns #7F7F7F
     * lerpColor('#000000', '#ffffff', 0.5)
     * @returns {String}
     */
    private lerpColor(a: string, b: string, amount: number) { 

        const ah = parseInt(a.replace(/#/g, ''), 16),
            ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
            bh = parseInt(b.replace(/#/g, ''), 16),
            br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);

        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }

    destroy() {
        super.destroy();
        this.arrows.map(arrow => arrow.destroy());
        this.blockSprite?.destroy();
    }

    // get conga chain
    public getCongaChain(gotchiChain: Array<GO_Gotchi>) {
        // first establish what followers this gotchi has that do not currently have leaders and are leaders/rofl's

        // check down
        const downGotchi = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col);
        if (downGotchi !== 'OUT OF BOUNDS' && 
            (downGotchi.getType() === 'GOTCHI' || downGotchi.getType() === 'ROFL') &&
            (downGotchi as GO_Gotchi).getLeader() === 0 &&
            !(downGotchi as GO_Gotchi).isCongaLeader() &&
            (downGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
            // give us a new gotchi follower
            this.followers[0] = downGotchi;

            // give that follower a leader
            (downGotchi as GO_Gotchi).setLeader(this);

            // add this gotchi to the gotchi chain
            gotchiChain.push((downGotchi as GO_Gotchi));

            // call get conga chain on this gotchi
            (downGotchi as GO_Gotchi).getCongaChain(gotchiChain);
        }

        // check left
        const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1);
        if (leftGotchi !== 'OUT OF BOUNDS' && 
            (leftGotchi.getType() === 'GOTCHI' || leftGotchi.getType() === 'ROFL') &&
            (leftGotchi as GO_Gotchi).getLeader() === 0 &&
            !(leftGotchi as GO_Gotchi).isCongaLeader() &&
            (leftGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
            // give us a new gotchi follower
            this.followers[1] = leftGotchi;

            // give that follower a leader
            (leftGotchi as GO_Gotchi).setLeader(this);

            // add this gotchi to the gotchi chain
            gotchiChain.push((leftGotchi as GO_Gotchi));

            // call get conga chain on this gotchi
            (leftGotchi as GO_Gotchi).getCongaChain(gotchiChain);
        }

        // check up
        const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col);
        if (upGotchi !== 'OUT OF BOUNDS' && 
            (upGotchi.getType() === 'GOTCHI' || upGotchi.getType() === 'ROFL') &&
            (upGotchi as GO_Gotchi).getLeader() === 0 &&
            !(upGotchi as GO_Gotchi).isCongaLeader() &&
            (upGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
            // give us a new gotchi follower
            this.followers[2] = upGotchi;

            // give that follower a leader
            (upGotchi as GO_Gotchi).setLeader(this);

            // add this gotchi to the gotchi chain
            gotchiChain.push((upGotchi as GO_Gotchi));

            // call get conga chain on this gotchi
            (upGotchi as GO_Gotchi).getCongaChain(gotchiChain);
        }

        // check right
        const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1);
        if (rightGotchi !== 'OUT OF BOUNDS' && 
            (rightGotchi.getType() === 'GOTCHI' || rightGotchi.getType() === 'ROFL') &&
            (rightGotchi as GO_Gotchi).getLeader() === 0 &&
            !(rightGotchi as GO_Gotchi).isCongaLeader() &&
            (rightGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
            // give us a new gotchi follower
            this.followers[3] = rightGotchi;

            // give that follower a leader
            (rightGotchi as GO_Gotchi).setLeader(this);

            // add this gotchi to the gotchi chain
            gotchiChain.push((rightGotchi as GO_Gotchi));

            // call get conga chain on this gotchi
            (rightGotchi as GO_Gotchi).getCongaChain(gotchiChain);
        }
    }   
    
    public setStatus(status: 'READY_TO_CONGA' | 'READY_TO_JUMP' | 'CONGOTCHING' | 'JUMPING' | 'FINISHED_CONGA' | 'WAITING' | 'BURNT' | 'TELEPORTING') {
        this.status = status;
    }

    public getStatus() {
        return this.status;
    }
  
    update(): void {
        super.update(); 

        // make sure particles follow our grid object
        this.emitterConfetti?.setPosition(this.x, this.y);

        // if the gotchi has burnt status set tint to grey/black
        if (this.status === 'BURNT') {
            this.blockSprite?.setTint(0x444444);
        } else if (!this.spiked) {
            this.blockSprite?.setTint(0xffffff);
        }
    }
}
  