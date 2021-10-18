// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridLevel, GridObject, Player } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, PORTAL_OPEN } from 'game/assets';
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
    private congaPauseDuration = 500;
    private congaPauseTimer = 0;

    // variables for controlling conga logic
    private numReadyGotchis: number[] = [0, 0, 0, 0];
    private numSubchainGotchis: number[] = [0, 0, 0, 0];
    private congaJumpCounter = [0, 0, 0, 0];

    // timer is for click events
    private timer = 0;

    // define variables for dragging object
    private ogDragGridPosition = { row: 0, col: 0 };
    private dragAxis: 'X' | 'Y' | 'NOT_ASSIGNED' = 'NOT_ASSIGNED';
    private dragX = 0;
    private dragY = 0;

    // our constructor
    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'PORTAL'});

        // enable draggable input
        this.setInteractive();
        this.scene.input.setDraggable(this);

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
                // this is where we can open a portal if we have enough portal points
                const gameScene = this.scene as GameScene;
                const player = gameScene.getPlayer();

                if (gameScene && player) {
                    if (player.getStat('INTERACT_PORTAL') > 0) {
                        this.setStatus('OPEN');
                        player.adjustStat('INTERACT_PORTAL', -1);
                    }
                }
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
                if (player.getStat('MOVE_PORTAL') > 0) {
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
                    player.adjustStat('MOVE_PORTAL', -1);
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

        // go through each congachain
        for (let i = 0; i < 4; i++) {

            // see if we have a conga leader
            if (this.congaLeaders[i]) {
                // create a local conga leader const
                const congaLeader = this.congaLeaders[i] as GO_Gotchi;
        
                // count the number of gotchis that are ready
                this.numReadyGotchis[i] = 0;
                if (this.gotchiChains[i]) {
                    this.gotchiChains[i].map( g => { if (g.status === 'READY') this.numReadyGotchis[i]++; });
                }

                console.log('ready gotchi num: ' + this.numReadyGotchis[i]);
                console.log('subchain gotchi num: ' + this.numSubchainGotchis[i]);

                // if our number of ready gotchis === number of gotchis in subchain of particular follower we can find followers/leaders and run set pos/dir functions
                if (this.numReadyGotchis[i] === this.numSubchainGotchis[i]) {
                    // check to see if our conga line should be paused
                    const congaPauseDelta = new Date().getTime() - this.congaPauseTimer;

                    if (congaPauseDelta > this.congaPauseDuration) {
                        // reset timer
                        this.congaPauseTimer = new Date().getTime();

                        // reset our gotchi chain to empty
                        this.gotchiChains[i] = [];

                        // calculate congotchi chain
                        congaLeader.calcCongaChain(this.gotchiChains[i]);

                        if (this.congaJumpCounter[i] > 2) {
                            // zero the jump counter
                            this.congaJumpCounter[i] = 0;

                            // if we've got a conga chain go through it and make each gotchi jump including the leader
                            congaLeader.congaJump();
                            this.gotchiChains[i].map( g => g.congaJump());
                            
                            this.numSubchainGotchis[i]--;
                        }
                        else {
                            // if we've got a congachain go through it and assign the congotchis new positions.
                            this.gotchiChains[i].map( g => {
                                // get the leader
                                const leader = g.getLeader() as GO_Gotchi;
                                if (leader) {
                                    // set gotchi positions and rows to go to
                                    g.newRow = leader.getGridPosition().row;
                                    g.newCol = leader.getGridPosition().col;
                                    g.newDir = leader.getDirection();
                                }
                            })

                            // we can now move our conga leader into the portal 
                            congaLeader.congaIntoPortal(this.gridPosition.row, this.gridPosition.col);
                            congaLeader.status = 'CONGOTCHING';

                            // reset number sub chain gotchis
                            this.numSubchainGotchis[i] = 0;
                            
                            // go through each congotchi and call the congaIntoPosition() function if the gotchi is top priority
                            this.gotchiChains[i].map( (g) => {
                                // check our leader is congotching and there are no followers with preference over us
                                const leader = this.gridLevel.getGridObject(g.newRow, g.newCol) as GO_Gotchi;
                                if (leader.getType() === 'GOTCHI' 
                                && leader.status === 'CONGOTCHING' 
                                && this.getFollowerPriority(leader, g) === 'TOP_PRIORITY') {
                                    // conga our gotchi into position
                                    g.congaIntoPosition(g.newRow, g.newCol);

                                    // set our gotchi status to 'CONGOTCHING'
                                    g.status = 'CONGOTCHING';

                                    // increment our number of sub chain gotchis
                                    this.numSubchainGotchis[i]++;

                                } else {
                                    g.status = 'WAITING';
                                }
                            })
                            
                            // increment the jump counter
                            this.congaJumpCounter[i]++;
                            
                        }

                        
                    }
                }
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
        // do stuff
    }
}
  