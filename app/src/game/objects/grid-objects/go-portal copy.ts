// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridLevel, GridObject, Player } from 'game/objects';
import { GridPosition } from '../grid-level';
import { PORTAL_OPEN, SOUND_POP, SOUND_PORTAL_OPEN } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GO_PORTAL } from 'game/helpers/constants';

interface Congotchi {
    gotchi: GO_Gotchi;
    newRow: number;
    newCol: number;
    newDir: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT';
    status: 'READY' | 'CONGOTCHING';
}
  
export class GO_Portal extends GridObject {
    private status: 'OPEN' | 'CLOSED' = 'CLOSED';
    private congaLeaders: Array<GO_Gotchi | 0> = [0, 0, 0, 0]; // element 0 is down, 1 is left, 2 is up, 3 is right
    private gotchiChains: Array<GO_Gotchi>[] = [];
    
    // need a boolean while gotchis in motion during a conga
    private gotchiChainRunning = [false, false, false, false];

    // these variables used for pausing the conga line after each step
    private congaPauseDuration = 50;
    private congaPauseTimer = 0;

    // variables for controlling conga logic
    private numReadyGotchis: number[] = [0, 0, 0, 0];
    private numSubchainGotchis: number[] = [0, 0, 0, 0];
    private congaJumpCounter = [0, 0, 0, 0];

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
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'PORTAL'});

        // enable draggable input
        this.setInteractive();
        this.scene.input.setDraggable(this);

        // set our bg colour
        this.setBgSquareColour('BLUE');

        // set a specific depth
        this.setDepth(DEPTH_GO_PORTAL);

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_PORTAL_OPEN, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract.setVolume(0.5);

        // set behaviour for pointer click down
        this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // get the time and grid we clicked in
            this.timer = new Date().getTime();
            
            console.log(this);
        });

        // set behaviour for pointer up event
        this.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            // see if we're close to a pointer down event for a single click
            const delta = new Date().getTime() - this.timer;
            if (delta < 200) {
                // this is where we can open a portal if we have enough portal points
                const gameScene = this.scene as GameScene;
                const player = gameScene.getPlayer();

                if (gameScene && player) {
                    if (player.getStat('INTERACT_BLUE') > 0) {
                        // check the status and set to opposite
                        this.setStatus(this.status === 'CLOSED' ? 'OPEN' : 'CLOSED');

                        // adjust blue interact stat
                        player.adjustStat('INTERACT_BLUE', -1);

                        // play sound based on status
                        if (this.status === 'OPEN') this.soundInteract?.play();
                        else this.soundInteract?.stop();
                    }
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
                if (player.getStat('MOVE_BLUE') > 0) {
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
                    player.adjustStat('MOVE_BLUE', -1);

                    // play the move sound
                    this.soundMove?.play();
                }
            }
        })
    }

    public findCongaLeaders() {
        // check each direction to see if there is a gotchi looking at us
        const downGotchi = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col) as GO_Gotchi;
        this.congaLeaders[0] = (downGotchi && downGotchi.getType() === 'GOTCHI' && downGotchi.getDirection() === 'UP') ? 
            downGotchi : 0;

        const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1) as GO_Gotchi;
        this.congaLeaders[1] = (leftGotchi && leftGotchi.getType() === 'GOTCHI' && leftGotchi.getDirection() === 'RIGHT') ? 
            leftGotchi : 0;

        const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col) as GO_Gotchi;
        this.congaLeaders[2] = (upGotchi && upGotchi.getType() === 'GOTCHI' && upGotchi.getDirection() === 'DOWN') ? 
            upGotchi : 0;

        const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1) as GO_Gotchi;
        this.congaLeaders[3] = (rightGotchi && rightGotchi.getType() === 'GOTCHI' && rightGotchi.getDirection() === 'LEFT') ? 
            rightGotchi : 0;

        return this.congaLeaders;
    }

    // getFollowerPriority() tells us the priority number of the follower passed ot the function
    public getFollowerPriority(leader: GO_Gotchi, follower: GO_Gotchi): string {
        // first find out if the follower is a down, left, up or right
        let priority: 'TOP_PRIORITY' | 'LOW_PRIORITY' | 'ERROR' = 'TOP_PRIORITY';
        const leaderFollowers = leader.getFollowers();
        if (leaderFollowers[0] === follower) {
            // we are the down gotchi and have priority
            priority = 'TOP_PRIORITY';
        }
        else if (leaderFollowers[1] === follower) {
            if (leaderFollowers[0]) priority = 'LOW_PRIORITY';
        }
        else if (leaderFollowers[2] === follower) {
            if (leaderFollowers[0] || leaderFollowers[1]) priority = 'LOW_PRIORITY'
        }
        else if (leaderFollowers[3] === follower) {
            if (leaderFollowers[0] || leaderFollowers[1] || leaderFollowers[2]) priority = 'LOW_PRIORITY';
        }
        else {
            priority = 'ERROR';
        }

        return priority;
    }

    // this code should run every single update loop of the grid level
    public runCongaChains() {

        // find all gotchis adjacent the portal
        this.findCongaLeaders();

        // go through each possible conga leader
        for (let i = 0; i < 4; i++) {

            // see if we have a conga leader
            if (this.congaLeaders[i]) {
                // create a local conga leader const
                const congaLeader = this.congaLeaders[i] as GO_Gotchi;

                // create a blank gotchi chain and populate it
                this.gotchiChains[i] = [];
                congaLeader.calcCongaChain(this.gotchiChains[i]);

                // go through conga chain and assign the congotchis new positions to target.
                this.gotchiChains[i].map( g => {
                    const leader = g.getLeader() as GO_Gotchi;
                    if (leader) {
                        g.newRow = leader.getGridPosition().row;
                        g.newCol = leader.getGridPosition().col;
                        g.newDir = leader.getDirection();
                    }
                });

                ////////////////////////////////////////////////////////////////////////////////////////
                // FIRST PASS - establishing the gotchi chain CONGOTCHING vs. WAIT status //
                ////////////////////////////////////////////////////////////////////////////////////////

                // if our leader isn't burnt we can set his status to congotching
                if (congaLeader.status !== 'BURNT') {
                    congaLeader.status = 'CONGOTCHING';
                }

                // go through each congotchi in the gotchi chain and set status to CONGOTCHING if the gotchi is top priority
                this.gotchiChains[i].map( (g) => {
                    // if this gotchi has top priority and the leader isn't waiting, set them to congotching 
                    const leader = this.gridLevel.getGridObject(g.newRow, g.newCol) as GO_Gotchi;
                    if (this.getFollowerPriority(leader, g) === 'TOP_PRIORITY' && leader.status !== 'WAITING') {
                        // set our gotchi status to 'CONGOTCHING'
                        g.status = 'CONGOTCHING';
                    } else {
                        g.status = 'WAITING';
                    }
                })

                // As we now know which gotchis are congotching, detonate any adjacent grenades
                this.gridLevel.explodeGrenadesNearCongotchis();

                ///////////////////////////////////////////////////////////////////////////////////////
                // SECOND PASS - Moving gotchis taking into account their burnt status
                ////////////////////////////////////////////////////////////////////////////////////

                // we can now move our conga leader into the portal if he's not burnt
                if (congaLeader.status !== 'BURNT') {
                    congaLeader.congaIntoPortal(this.gridPosition.row, this.gridPosition.col);
                }

                // go through each congotchi in the gotchi chain and call the congaIntoPosition() function if possible
                this.gotchiChains[i].map( (g) => {
                    // if this gotchi has priority, isn't burnt, leader isn't waiting OR burnt, conga, 
                    const leader = this.gridLevel.getGridObject(g.newRow, g.newCol) as GO_Gotchi;
                    const priority = this.getFollowerPriority(leader, g);

                    if ( priority === 'TOP_PRIORITY' && g.status !== 'BURNT' && 
                    leader.status !== 'WAITING' && leader.status !== 'BURNT' ) {
                        // conga our gotchi into position
                        g.congaIntoPosition(g.newRow, g.newCol);

                        // set our gotchi status to 'CONGOTCHING'
                        // g.status = 'CONGOTCHING';
                    } else {
                        g.status = 'WAITING';
                    }
                })
            }
        }
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
        super.update();
    }
}
  