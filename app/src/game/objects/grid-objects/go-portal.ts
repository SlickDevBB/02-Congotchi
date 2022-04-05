// grid-object-base-class.ts - base class for all grid objects

import { GO_Gotchi, GO_Props, GridObject, } from 'game/objects';
import { PORTAL_CLOSED, PORTAL_OPEN, SOUND_CONGA, SOUND_POP, SOUND_PORTAL_OPEN } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
  
export class GO_Portal extends GridObject {
    private status: 'OPEN' | 'CLOSED' = 'OPEN';
    private congaLeaders: Array<GO_Gotchi | 0> = [0, 0, 0, 0]; // element 0 is down, 1 is left, 2 is up, 3 is right
    private gotchiChains: Array<GO_Gotchi>[] = [];

    private musicConga?: Phaser.Sound.HTML5AudioSound;

    private congaCounter = 0;
    private jumpCounter = 0;

    private newConga = true;
    private sumCongaGotchis = 0;

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
        super({scene, gridLevel, gridRow, gridCol, key, gridSize, objectType: 'PORTAL'});

        // Set the block sprite
        this.blockSprite?.setTexture(PORTAL_OPEN);
        this.blockSprite?.setDisplaySize(this.gridSize*0.8, this.gridSize*0.8);

        // add sound and conga music
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_PORTAL_OPEN, {loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract.setVolume(0.2);
        this.musicConga = this.scene.sound.add(SOUND_CONGA, {loop: false}) as Phaser.Sound.HTML5AudioSound;

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

    public findCongaLeaders() {
        // first clear out our congaleaders array
        this.congaLeaders = [];

        // check each direction for adjacent ggotchis to make a leader
        const downGotchi = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col);
        if (downGotchi !== 'OUT OF BOUNDS') {
            if ( (downGotchi.getType() === 'GOTCHI' || downGotchi.getType() === 'ROFL') && 
                (downGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
                this.congaLeaders[0] = downGotchi as GO_Gotchi;
                this.congaLeaders[0].makeCongaLeader(true);
            }
        }

        const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1);
        if (leftGotchi !== 'OUT OF BOUNDS') {
            if ( (leftGotchi.getType() === 'GOTCHI' || leftGotchi.getType() === 'ROFL') && 
                (leftGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
                this.congaLeaders[1] = leftGotchi as GO_Gotchi;
                this.congaLeaders[1].makeCongaLeader(true);
            }
        }

        const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col);
        if (upGotchi !== 'OUT OF BOUNDS') {
            if ( (upGotchi.getType() === 'GOTCHI' || upGotchi.getType() === 'ROFL') && 
                (upGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
                this.congaLeaders[2] = upGotchi as GO_Gotchi;
                this.congaLeaders[2].makeCongaLeader(true);
            }
        }

        const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1);
        if (rightGotchi !== 'OUT OF BOUNDS') {
            if ( (rightGotchi.getType() === 'GOTCHI' || rightGotchi.getType() === 'ROFL') && 
                (rightGotchi as GO_Gotchi).getStatus() !== 'BURNT' ) {
                this.congaLeaders[3] = rightGotchi as GO_Gotchi;
                this.congaLeaders[3].makeCongaLeader(true);
            }
        }

        return this.congaLeaders;
    }

    // getFollowerPriority() tells us the priority number of the follower passed ot the function
    public getFollowerPriority(leader: GO_Gotchi, follower: GO_Gotchi): string {
        if (leader && follower) {
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
        } else {
            return 'ERROR';
        }
    }

    public consoleGotchiChain(chain: Array<GO_Gotchi[]>) {
        for (let j = 0; j < 4; j++) {
            let i = 0;
            if (chain[j]) {
                chain[j].map( g => {
                    console.log('Gotchi ' + i + ' status: ' + g.status);
                    i++;
                })
            }
        }
    }

    // function to clear leaders of all gotchis
    public clearLeaders() {
        // for every gotchi in level check what's around it and also ensure its not longer a conga leader
        this.gridLevel.getGridCells().map(row => row.map( cell => {
          if (cell.gridObject.getType() === 'GOTCHI' || cell.gridObject.getType() === 'ROFL') {
            (cell.gridObject as GO_Gotchi).setLeader(0);
            (cell.gridObject as GO_Gotchi).makeCongaLeader(false);
          }
        }));
    }

    // function to clear followers
    public clearFollowers() {
        // for every gotchi in level call clear followers
        this.gridLevel.getGridCells().map(row => row.map( cell => {
            if (cell.gridObject.getType() === 'GOTCHI' || cell.gridObject.getType() === 'ROFL') {
              (cell.gridObject as GO_Gotchi).clearFollowers();
            }
          }));
    }

    // this runs whenever a conga isn't happening
    public runCongaChains() {
        ////////////////////////////////////////////////////////////////////////////////////////
        // FIRST PASS - determine which gotchis are READY_TO_CONGA (don't worry about line waiting yet)
        ////////////////////////////////////////////////////////////////////////////////////////

        // clear all the leaders and followers of all gotchis
        this.clearLeaders();
        this.clearFollowers();

        // find all gotchis adjacent this portal
        this.findCongaLeaders();

        // go through each possible conga leader
        for (let i = 0; i < 4; i++) {
            // create a local conga leader const
            const congaLeader = this.congaLeaders[i] as GO_Gotchi;

            // create empty array
            this.gotchiChains[i] = [];

            // see if we have a conga leader and they're not burnt
            if (congaLeader &&  congaLeader.status !== 'BURNT') {
                // First set leader status to ready
                congaLeader.status = 'READY_TO_CONGA';

                // for this pass lets aim at the portal
                congaLeader.aimAtGridPosition(this.gridPosition.row, this.gridPosition.col);

                // calc up gotchi chain
                congaLeader.getCongaChain(this.gotchiChains[i]);

                // go through conga chain and assign the congotchis new positions to target.
                this.gotchiChains[i].map( g => {
                    const leader = g.getLeader() as GO_Gotchi;
                    if (leader && leader.status !== 'BURNT') {
                        g.newRow = leader.getGridPosition().row;
                        g.newCol = leader.getGridPosition().col;

                        // aim in new direction
                        g.aimAtGridPosition(g.newRow, g.newCol);

                        // if gotchi is top priority and not burnt, set status to ready
                        if (this.getFollowerPriority(leader, g) === 'TOP_PRIORITY' && g.status !== 'BURNT') {
                            g.status = 'READY_TO_CONGA';
                        }
                    } 
                });
                console.log(this.gotchiChains[i]);
            }
        }

        // As we now know which gotchis are READY_TO_CONGA, detonate any adjacent grenades
        this.gridLevel.triggerGrenadesNearCongotchis();

        ///////////////////////////////////////////////////////////////////////////////////////
        // SECOND PASS - Re-evaluate gotchi chains and set any gotchis behind burnt ones to waiting
        ////////////////////////////////////////////////////////////////////////////////////

        // go through each possible conga leader
        for (let i = 0; i < 4; i++) {
            // create a local conga leader const
            const congaLeader = this.congaLeaders[i] as GO_Gotchi;

            // see if we have a conga leader
            if (congaLeader) {
                // go through each gotchi and if it has an upchain state of 'burnt' set current gotchi to WAITING
                this.gotchiChains[i].map( (g) => {
                    if (g.isUpchainStatus('BURNT')) {
                        if (g.status !== 'BURNT') {
                            g.status = 'WAITING';
                        }
                    }
                })  
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////
        // THIRD PASS - Re-evaluate the gotchi chains taking into account burnt ones
        ////////////////////////////////////////////////////////////////////////////////////

        // clear all the leaders and followers of all gotchis
        this.clearLeaders();
        this.clearFollowers();

        // find all gotchis adjacent this portal
        this.findCongaLeaders();

        // go through each possible conga leader
        for (let i = 0; i < 4; i++) {
            // create a local conga leader const
            const congaLeader = this.congaLeaders[i] as GO_Gotchi;

            // make gotchi chain array empty again
            this.gotchiChains[i] = [];

            // see if we have a conga leader and they're not burnt
            if (congaLeader &&  congaLeader.status !== 'BURNT') {
                // First set leader status to ready
                congaLeader.status = 'READY_TO_CONGA';

                // calc up gotchi chain
                congaLeader.getCongaChain(this.gotchiChains[i]);

                // go through conga chain and assign the congotchis new positions to target.
                this.gotchiChains[i].map( g => {
                    const leader = g.getLeader() as GO_Gotchi;
                    if (leader && leader.status !== 'BURNT') {
                        // if gotchi is top priority and not burnt, set status to ready
                        if (this.getFollowerPriority(leader, g) === 'TOP_PRIORITY' && g.status !== 'BURNT') {
                            g.status = 'READY_TO_CONGA';
                        } else if (g.status !== 'BURNT') {
                            g.status = 'WAITING';
                        }

                    } 
                });
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////
        // FOURTH PASS - Move gotchis based on their final status
        ////////////////////////////////////////////////////////////////////////////////////

        // create a variable to tell us if a gotchi went into a portal (for counting)
        let gotchiSentToPortal = false;

        // go through each possible conga leader
        for (let i = 0; i < 4; i++) {

            // create a local conga leader const
            const congaLeader = this.congaLeaders[i] as GO_Gotchi;

            // see if we have a conga leader
            if (congaLeader) {
                // check our count to see if it is time to jump
                const jumpAtEnd = this.jumpCounter !== 0 && (this.jumpCounter+1) % 3 == 0;

                // we can now move our conga leader into the portal if he's not burnt
                if (congaLeader.status === 'READY_TO_CONGA') {
                    congaLeader.cactiiSpike(-5);

                    congaLeader.congaIntoPortal(this.gridPosition.row, this.gridPosition.col);
                    congaLeader.status = 'CONGOTCHING';

                    // make a note we sent a gotchi to the portal
                    gotchiSentToPortal = true;
                    this.congaCounter++;

                    // increment the conga-able gotchis
                    if (this.newConga) this.sumCongaGotchis++;
                }    

                // go through each congotchi in the gotchi chain and call the congaIntoPosition() function if possible
                this.gotchiChains[i].map( (g) => {
                    // get the current gotchis leader
                    const leader = this.gridLevel.getGridObject(g.newRow, g.newCol) as GO_Gotchi;

                    // if leader congotching, we should be too unless we got burnt
                    if (leader.status === 'CONGOTCHING') {
                        if (g.status === 'READY_TO_CONGA') {
                            g.cactiiSpike(-5);    
                            // conga our gotchi into position
                            g.congaIntoPosition(g.newRow, g.newCol, jumpAtEnd);               
                        } else if (g.status === 'WAITING') {
                            g.cactiiSpike(-5);  
                            g.congaStationary(jumpAtEnd);
                            
                        }
                    } else {
                        g.cactiiSpike(-5); 
                        g.status = 'WAITING';
                        g.congaStationary(jumpAtEnd);
                         
                        
                    }
                    if (this.newConga) this.sumCongaGotchis++;
                })
            } 
        }

        // if at least one gotchi entered a portal increment the conga counter
        if (gotchiSentToPortal) {
            // if our conga counter is at 0 we've started to conga!
            if (this.jumpCounter === 0) {
                this.gridLevel.congaLineStarted();
            }

            // if this is first gotchi into the portal crank that conga music
            if (this.jumpCounter === 0 || this.jumpCounter % 3 === 0) {
                this.musicConga?.play();
            } 

            // increment jump counter
            this.jumpCounter++;
        } 

        // if conga counter equals sum of gotchis we've finished
        if (this.congaCounter > 0 && this.congaCounter === this.sumCongaGotchis) {
            // call the grid levels line finished function
            this.gridLevel.congaLineFinished();

            // our line finished! lets reset conga counting variables
            this.congaCounter = 0;
            this.sumCongaGotchis = 0;
            this.jumpCounter = 0;
            this.newConga = true;

            // fade out the conga music
            this.scene.add.tween({
                targets: this.musicConga,
                volume: 0,
                duration: 2000,
                onComplete: () => {
                    this.musicConga?.stop();
                    this.musicConga?.setVolume(1);
                }
            });            
        } else if (this.congaCounter > 0 || this.sumCongaGotchis > 0) {
            this.newConga = false;
        }
    }

    public getStatus() {
        return this.status;
    }

    public setStatus(status: 'OPEN' | 'CLOSED') {
        this.status = status;
        if (status === 'OPEN') this.blockSprite?.setTexture(PORTAL_OPEN);
        return this;
    }

    update(): void {
        super.update();
    }
}
  