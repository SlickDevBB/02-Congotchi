// grid-object-base-class.ts - base class for all grid objects

import { GO_Empty, GO_Props, GridLevel, GridObject } from 'game/objects';
import { GridPosition } from '../grid-level';
import { ARROW_ICON, SOUND_BELL, SOUND_POP } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GOTCHI_ICON, DEPTH_GO_GOTCHI } from 'game/helpers/constants';
import { AavegotchiGameObject } from 'types';
import { timeStamp } from 'console';
import { queryAllByDisplayValue } from '@testing-library/dom';
import { Game } from 'phaser';
import { getGameHeight } from 'game/helpers';

export interface GO_Gotchi_Props {
    scene: Phaser.Scene;
    gridLevel: GridLevel;
    gridRow: number;
    gridCol: number;
    key: string;
    gotchi: AavegotchiGameObject;
    frame?: number;
    gridSize: number;
    objectType: 'BASE_CLASS' | 'INACTIVE' | 'EMPTY' | 'GOTCHI' | 'PORTAL' | 'GRENADE' | 'MILKSHAKE' | 'CACTI',
  }

interface CountGotchi {
    count: number,
    gotchi: GO_Gotchi | 0,
}
  
  export class GO_Gotchi extends GridObject {
    private direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';
    private leader: GridObject | 0 = 0;
    private followers: Array<GridObject | 0> = [0, 0, 0, 0]; // element 0 is down, 1 is left, 2 is up, 3 is right
    private gotchi: AavegotchiGameObject;

    // create arrows which are used to depict direction changes
    private arrows: Array<Phaser.GameObjects.Image> = [];

    // score bonus is how many points you get for getting this gotchi into a portal
    public scoreBonus = 5;
    private scoreBonusText;

    // declare variable for setting visibility of rotate arrows
    private rotateArrowsVisible = false;
    private overArrows = false;
    private overGotchi = false;

    // store the active pointer
    private mousePointer: Phaser.Input.Pointer;

    // need a little circle to use as a direction guide
    private directionGuide: Phaser.GameObjects.Ellipse;

    // conga side is a variable for tracking which side we conga on
    private congaSide: 'LEFT' | 'RIGHT' = Math.round(Math.random()) === 1 ? 'LEFT' : 'RIGHT';

    // duration variable for conga steps
    private congaStepDuration = 200;

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
    public status: 'READY' | 'CONGOTCHING' | 'JUMPING' | 'WAITING' | 'BURNT' = 'READY';

    // add sound effects
    private soundMove?: Phaser.Sound.HTML5AudioSound;
    private soundInteract?: Phaser.Sound.HTML5AudioSound;
    private soundBell?: Phaser.Sound.HTML5AudioSound;

    constructor({ scene, gridLevel, gridRow, gridCol, key, gotchi, gridSize, objectType }: GO_Gotchi_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'GOTCHI'});

        // save our gridlevel
        this.gridLevel = gridLevel;  
        this.gridSize = gridSize;
        this.objectType = objectType;
        this.gotchi = gotchi;

        // set our background colour
        this.setBgSquareColour('PINK');
        
        // set our grid position
        this.gridPosition = {row: gridRow, col: gridCol };

        // lets set our origin about our base point
        this.setOrigin(0.5, 0.5);

        // physics
        this.scene.physics.world.enable(this);
  
        // set to size of grids from game
        this.setDisplaySize(gridSize, gridSize);

        // set a specific depth
        this.setDepth(DEPTH_GO_GOTCHI);

        // add sound
        this.soundMove = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundInteract = this.scene.sound.add(SOUND_POP, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundBell = this.scene.sound.add(SOUND_BELL, { loop: false }) as Phaser.Sound.HTML5AudioSound;
        this.soundBell.setVolume(0.5);
    
        // add to the scene
        this.scene.add.existing(this);

        // save the mouse
        this.mousePointer = this.scene.input.activePointer;
        
        // create scorebonus text
        this.scoreBonusText = this.scene.add.text(
            this.x-this.gridSize*.475,
            this.y-this.gridSize*.5,
            this.scoreBonus.toString(),)
            .setVisible(true)
            .setStyle({
                fontFamily: 'Arial', 
                fontSize: Math.trunc(getGameHeight(this.scene)*0.02).toString() + 'px', 
                })
            .setOrigin(0,0)
            .setScrollFactor(0)
            .setDepth(this.depth+1);

        // create down arrow
        this.arrows.push(
            this.scene.add.image(this.x, this.y+this.gridSize, ARROW_ICON)
            .setAngle(0)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_PINK') > 0 && this.getDirection() !== 'DOWN') {
                    this.setDirection('DOWN');
                    this.adjustPlayerStat('INTERACT_PINK', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';

                    // play the interact sound
                    this.soundInteract?.play();

                    // hide arrows
                    this.setRotateArrowsVisible(false);
                }
            })
        );

        // create left arrow
        this.arrows.push(
            this.scene.add.image(this.x-this.gridSize, this.y, ARROW_ICON)
            .setAngle(90)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_PINK') > 0 && this.getDirection() !== 'LEFT') {
                    this.setDirection('LEFT');
                    this.adjustPlayerStat('INTERACT_PINK', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';

                    // play the interact sound
                    this.soundInteract?.play();

                    // hide arrows
                    this.setRotateArrowsVisible(false);
                }
            })
        );

        // create up arrow
        this.arrows.push(
            this.scene.add.image(this.x, this.y-this.gridSize, ARROW_ICON)
            .setAngle(180)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_PINK') > 0 && this.getDirection() !== 'UP') {
                    this.setDirection('UP');
                    this.adjustPlayerStat('INTERACT_PINK', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';

                    // play the interact sound
                    this.soundInteract?.play();

                    // hide arrows
                    this.setRotateArrowsVisible(false);
                }
            })
        );

        // create right arrow
        this.arrows.push(
            this.scene.add.image(this.x+this.gridSize, this.y, ARROW_ICON)    
            .setAngle(-90)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_PINK') > 0 && this.getDirection() !== 'RIGHT') {
                    this.setDirection('RIGHT');
                    this.adjustPlayerStat('INTERACT_PINK', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';

                    // play the interact sound
                    this.soundInteract?.play();

                    // hide arrows
                    this.setRotateArrowsVisible(false);
                }
            })    
        );

        // set some standard arrow values
        this.arrows.map(arrow => {
            arrow.setDisplaySize(this.gridSize, this.gridSize)
            .setDepth(DEPTH_GOTCHI_ICON)
            .setScrollFactor(0)
            .setVisible(false)
            .setInteractive()
            .on('pointerover', () => this.overArrows = true)
            .on('pointerout', () => this.overArrows = false)
        })

        // create our direction guide
        this.directionGuide = this.scene.add.ellipse(this.x, this.y,
            this.displayWidth*0.12, this.displayWidth*0.12, 0xff00ff)
            .setDepth(1000)
            .setAlpha(0.9)
            .setScrollFactor(0);

        // enable draggable input
        this.setInteractive();
        this.scene.input.setDraggable(this);

        // set behaviour for pointer click down
        this.on('pointerdown', () => {
            // get the time at which we clicked
            this.timer = new Date().getTime();

            console.log(this);
        });

        // set behaviour for pointer up event
        this.on('pointerup', () => {
            // See if we're close to a pointer down event (i.e. a single click occurred)
            const delta = new Date().getTime() - this.timer;
            if (delta < 200) {
                // check we've got enough interact points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_PINK') > 0) {
                    // we have enough interact points so toggle visible arrow status
                    this.rotateArrowsVisible = !this.rotateArrowsVisible;

                    // play the interact sound
                    // this.soundInteract?.play();
                }
            }
        });

        // set behaviour when over gotchi
        this.on('pointerover', () => { this.overGotchi = true;})
        this.on('pointerout', () => { this.overGotchi = false;})

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
                if (player.getStat('MOVE_PINK') > 0) {
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

        this.on('dragend', (pointer: Phaser.Input.Pointer) => {
            // store the grid position dragging finished in
            const finalGridPos = this.gridLevel.getGridPositionFromXY(this.x, this.y);
            this.setGridPosition(finalGridPos.row, finalGridPos.col);

            // adjust the player stat if we're in different grid position from start of drag
            if (!(finalGridPos.row === this.ogDragGridPosition.row && finalGridPos.col === this.ogDragGridPosition.col)) {
                    this.adjustPlayerStat('MOVE_PINK', -1);
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';

                    // play the move sound
                    this.soundMove?.play();
            }
        })

        // // Add animations
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(key || '', { start: 0, end: 0 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(key || '', { start: 2, end: 2 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(key || '', { start: 4, end: 4 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(key || '', { start: 6, end: 6 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'down_happy',
            frames: this.anims.generateFrameNumbers(key || '', { start: 8, end: 8 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'left_happy',
            frames: this.anims.generateFrameNumbers(key || '', { start: 10, end: 10 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'right_happy',
            frames: this.anims.generateFrameNumbers(key || '', { start: 12, end: 12 }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: 'up_happy',
            frames: this.anims.generateFrameNumbers(key || '', { start: 14, end: 14 }),
            frameRate: 2,
            repeat: -1,
        });
    
        this.anims.play('down');

    }

    // create stat adjustment
    public adjustPlayerStat(stat: 'INTERACT_PINK' | 'MOVE_PINK' | 'MOVE_RED' | 'INTERACT_RED' | 
    'INTERACT_BLUE' | 'MOVE_BLUE' | 'MOVE_GREEN' | 'INTERACT_GREEN', value: number) {
        // get the player
        const player = (this.scene as GameScene).getPlayer();
    
        // decrease the players move count
        if (player) player.adjustStat(stat, -1);
    }

    public findLeader() {
        // start by setting leader to 0
        this.leader = 0;

        // go to the cell our gotchi is facing and see if there's a gotchi in it
        let potentialLeader;
        switch (this.getDirection()) {
            case 'DOWN': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col); break;
            case 'LEFT': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1); break;
            case 'UP': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col); break;
            case 'RIGHT': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1); break;
            default: break;
        }

        // double check the grid object we found is a gotchi
        if (potentialLeader !== 'OUT OF BOUNDS' && potentialLeader?.getType() === 'GOTCHI') {
            // check the gotchi isn't looking straight back at us
            let lookingAtUs = false;
            switch (this.getDirection()) {
                case 'DOWN': if ( (potentialLeader as GO_Gotchi).getDirection() === 'UP') lookingAtUs = true; break;
                case 'LEFT': if ( (potentialLeader as GO_Gotchi).getDirection() === 'RIGHT') lookingAtUs = true; break;
                case 'UP': if ( (potentialLeader as GO_Gotchi).getDirection() === 'DOWN') lookingAtUs = true; break;
                case 'RIGHT': if ( (potentialLeader as GO_Gotchi).getDirection() === 'LEFT') lookingAtUs = true; break;
                default: break;
            }
            if (!lookingAtUs) this.setLeader(potentialLeader as GO_Gotchi);
            else this.setLeader(0);
        } else {
            this.setLeader(0);
        }
    }

    public findFollowers() {
        // check each direction to see if there is a gotchi looking at us
        const downGotchi = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col);
        if (downGotchi !== 'OUT OF BOUNDS' &&
            downGotchi.getType() === 'GOTCHI' &&
            (downGotchi as GO_Gotchi).getDirection() === 'UP') {
                this.followers[0] = downGotchi;
        } else this.followers[0] = 0;

        const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1);
        if (leftGotchi !== 'OUT OF BOUNDS' &&
            leftGotchi.getType() === 'GOTCHI' &&
            (leftGotchi as GO_Gotchi).getDirection() === 'RIGHT') {
                this.followers[1] = leftGotchi;
        } else this.followers[1] = 0;

        const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col);
        if (upGotchi !== 'OUT OF BOUNDS' &&
            upGotchi.getType() === 'GOTCHI' &&
            (upGotchi as GO_Gotchi).getDirection() === 'DOWN') {
                this.followers[2] = upGotchi;
        } else this.followers[2] = 0;

        const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1);
        if (rightGotchi !== 'OUT OF BOUNDS' &&
            rightGotchi.getType() === 'GOTCHI' &&
            (rightGotchi as GO_Gotchi).getDirection() === 'LEFT') {
                this.followers[3] = rightGotchi;
        } else this.followers[3] = 0; 
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
        switch (direction) {
            case 'DOWN': {
                this.anims.play('down');
                break;
            }
            case 'LEFT': {
                this.anims.play('left');
                break;
            }
            case 'RIGHT': {
                this.anims.play('right');
                break;
            }
            case 'UP': {
                this.anims.play('up');
                break;
            }
            default: {
                
                break;
            }
        }
        return this;
    }

    public setRotateArrowsVisible(visible: boolean) {
        this.arrows.map(arrow => arrow.setVisible(visible));
        this.rotateArrowsVisible = visible;
    }

    public setRandomDirection() {
        const rand = Math.floor(Math.random()*4);
        if (rand === 0) this.setDirection('DOWN');
        else if (rand === 1) this.setDirection('LEFT');
        else if (rand === 2) this.setDirection('RIGHT');
        else this.setDirection('UP');
        return this;
    }

    public congaIntoPosition(row: number, col: number) {
        // call our set grid position that moves our gotchi
        this.setGridPosition(
            row,
            col,
            () => {
                this.setDirection(this.newDir);
                this.status = 'READY';
            },
            false,
            this.congaStepDuration,
        )

        // add another tween for our gotchi which rotates him a bit to look conga'ish
        this.scene.add.tween({
            targets: this,
            angle: this.congaSide === 'LEFT' ? -10 : 10,
            duration: this.congaStepDuration,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // change conga side
                this.congaSide = this.congaSide === 'LEFT' ? 'RIGHT' : 'LEFT';
            }
        })

        return this;

    }

    public congaJump() {
        // get the gui and display some action text
        (this.scene as GameScene).getGui()?.showActionText('CONGOTCHI!!!');

        // change anim to happy
        this.anims.play(this.getDirection().toLowerCase() + '_happy');

        const prevStatus = this.status;

        this.status = 'JUMPING';

        this.scene.add.tween({
            targets: this,
            y: this.y - this.displayHeight*0.3,
            duration: this.congaStepDuration*0.5,
            ease: 'Quad.easeOut',
            yoyo: true,
            onComplete: () => {
                this.status = prevStatus;
            }
        })

        this.scene.add.tween({
            targets: this,
            angle: 0,
            duration: this.congaStepDuration*0.5,
        })
    }

    public congaIntoPortal(row: number, col: number) {
        this.setGridPosition(
            row,
            col,
            () => {
                // adjust the score
                (this.scene as GameScene).getGui()?.adjustScore(this.scoreBonus);
                // spiral the gotchi into the portal
                this.scene.add.tween({
                    targets: this,
                    scale: 0,
                    angle: 720,
                    duration: 500,
                    onComplete: () => {
                        this.destroy();
                    }
                });

                // create a temporary score text
                const score = this.scene.add.text(this.x, this.y,
                    this.scoreBonus.toString(),
                    {fontFamily: 'Arial', fontSize: (getGameHeight(this.scene)*0.05).toString()+'px'})
                    .setDepth(this.depth+100)
                    .setStroke('0x000000',2)
                    .setScrollFactor(0)
                    .setOrigin(0.5,0.5);

                // grab the gui scoreboard and tween our temp text over to it
                const guiScoreboard = (this.scene as GameScene).getGui()?.getScoreboard();
                this.scene.tweens.add({
                    targets: score,
                    // alpha: 0,
                    x: guiScoreboard?.x,
                    y: guiScoreboard?.y,
                    duration: 250,
                    onComplete: () => { score.destroy() }
                })
                
                // play a bell sound
                this.soundBell?.play();
            },
            true,
            this.congaStepDuration,
        )

        return this;
    }

    destroy() {
        super.destroy();
        this.directionGuide.destroy();
        this.arrows.map(arrow => arrow.destroy());
        this.scoreBonusText.destroy();
    }

    public calcCongaChain(gotchiChain: Array<GO_Gotchi>) {
        // call our recursive function
        this.getCongaChain(gotchiChain);
    }

    // get conga chain
    private getCongaChain(gotchiChain: Array<GO_Gotchi>) {
        // for each follower that is a gotchi add them to the chain and call their followers too
        if (this.followers[0] && (this.followers[0] as GO_Gotchi).status !== 'BURNT') {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[0] as GO_Gotchi));
            (this.followers[0] as GO_Gotchi).getCongaChain(gotchiChain);
        }
        if (this.followers[1] && (this.followers[1] as GO_Gotchi).status !== 'BURNT') {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[1] as GO_Gotchi));
            (this.followers[1] as GO_Gotchi).getCongaChain(gotchiChain);
        }
        if (this.followers[2] && (this.followers[2] as GO_Gotchi).status !== 'BURNT') {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[2] as GO_Gotchi));
            (this.followers[2] as GO_Gotchi).getCongaChain(gotchiChain);
        }
        if (this.followers[3] && (this.followers[3] as GO_Gotchi).status !== 'BURNT') {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[3] as GO_Gotchi));
            (this.followers[3] as GO_Gotchi).getCongaChain(gotchiChain);
        }

    }        

   public getStatus() {
       return this.status;
   }
  
    update(): void {
        super.update(); 

        // update score bonus text position and make sure it stays the same as the scorebonus
        this.scoreBonusText.setPosition(
            this.x-this.gridSize*.475,
            this.y-this.gridSize*.5,);
        this.scoreBonusText.text = this.scoreBonus.toString();

        // update direction guide position
        switch (this.getDirection()) {
            case 'DOWN': { this.directionGuide.setPosition(this.x, this.y+this.displayHeight/2); break; }
            case 'LEFT': { this.directionGuide.setPosition(this.x-this.displayWidth/2, this.y); break; }
            case 'UP': { this.directionGuide.setPosition(this.x, this.y-this.displayHeight/2); break; }
            case 'RIGHT': { this.directionGuide.setPosition(this.x+this.displayWidth/2, this.y); break; }
        }

        // make sure rotate arrows follow their gotchi
        if (this.arrows.length === 4) {
            this.arrows[0].setPosition(this.x, this.y+this.gridSize);
            this.arrows[1].setPosition(this.x-this.gridSize, this.y);
            this.arrows[2].setPosition(this.x, this.y-this.gridSize);
            this.arrows[3].setPosition(this.x+this.gridSize, this.y);
        }

        // update visibility of all arrows
        this.arrows.map(arrow => {
            arrow.setVisible(this.rotateArrowsVisible);
        })

        // if there is a click hide the arrows of the gotchi
        if (this.mousePointer.isDown && !this.overArrows && !this.overGotchi) {
            this.rotateArrowsVisible = false;
        }

        // if the gotchi has burnt status set tint to grey/black
        if (this.status === 'BURNT') {
            this.setTint(0x444444);
        } else {
            this.setTint(0xffffff);
        }
    }
  }
  