// grid-object-base-class.ts - base class for all grid objects

import { GO_Empty, GO_Props, GridLevel, GridObject } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, CW_ROTATE_MOVE_ICON, ACW_ROTATE_MOVE_ICON, ARROW_ICON } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GOTCHI_ICON, DEPTH_GO_GOTCHI } from 'game/helpers/constants';
import { AavegotchiGameObject } from 'types';
import { timeStamp } from 'console';
import { queryAllByDisplayValue } from '@testing-library/dom';
import { Game } from 'phaser';

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

    // declare icon for rotate and move on hover
    // private rotateMoveIcon: Phaser.GameObjects.Image;

    // declare variable for setting visibility of rotate arrows
    private rotateArrowsVisible = false;
    private overArrows = false;
    private overGotchi = false;

    // declare a shift key variable
    private shiftKey: Phaser.Input.Keyboard.Key;

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
    private mouseTimer = 0;

    // define variables for dragging object
    private ogDragGridPosition = { row: 0, col: 0 };
    private dragAxis: 'X' | 'Y' | 'NOT_ASSIGNED' = 'NOT_ASSIGNED';
    private dragX = 0;
    private dragY = 0;

    // define public variables for conga
    public newRow = 0;
    public newCol = 0;
    public newDir: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';
    public status: 'READY' | 'CONGOTCHING' | 'JUMPING' | 'WAITING' | 'BURNT' = 'READY';

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
    
        // add to the scene
        this.scene.add.existing(this);

        // create the shift key
        this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // save the mouse
        this.mousePointer = this.scene.input.activePointer;

        // create down arrow
        this.arrows.push(
            this.scene.add.image(this.x, this.y+this.displayHeight*.5, ARROW_ICON)
            .setAngle(0)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_GOTCHI') > 0 && this.getDirection() !== 'DOWN') {
                    this.setDirection('DOWN');
                    this.adjustPlayerStat('INTERACT_GOTCHI', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';
                }
            })
        );

        // create left arrow
        this.arrows.push(
            this.scene.add.image(this.x-this.displayWidth*.5, this.y, ARROW_ICON)
            .setAngle(90)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_GOTCHI') > 0 && this.getDirection() !== 'LEFT') {
                    this.setDirection('LEFT');
                    this.adjustPlayerStat('INTERACT_GOTCHI', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';
                }
            })
        );

        // create up arrow
        this.arrows.push(
            this.scene.add.image(this.x, this.y-this.displayHeight*.5, ARROW_ICON)
            .setAngle(180)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_GOTCHI') > 0 && this.getDirection() !== 'UP') {
                    this.setDirection('UP');
                    this.adjustPlayerStat('INTERACT_GOTCHI', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';
                }
            })
        );

        // create right arrow
        this.arrows.push(
            this.scene.add.image(this.x+this.displayWidth, this.y, ARROW_ICON)    
            .setAngle(-90)
            .on('pointerup', () => {
                // check we've got enough interaction points
                const player = (this.scene as GameScene).getPlayer();
                if (player && player.getStat('INTERACT_GOTCHI') > 0 && this.getDirection() !== 'RIGHT') {
                    this.setDirection('RIGHT');
                    this.adjustPlayerStat('INTERACT_GOTCHI', -1)
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';
                }
            })    
        );

        // set some standard arrow values
        this.arrows.map(arrow => {
            arrow.setDisplaySize(this.displayWidth*0.5, this.displayHeight*0.5)
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
                if (player && player.getStat('INTERACT_GOTCHI') > 0) {
                    // we have enough interact points so toggle visible arrow status
                    this.rotateArrowsVisible = !this.rotateArrowsVisible;
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
            this.dragX = this.x;
            this.dragY = this.y;
        })

        // set behaviour for dragging
        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            const gameScene = this.scene as GameScene;
            const player = gameScene.getPlayer();

            if (gameScene && player) {    
                // if we've got movement points left we can drag
                if (player.getStat('MOVE_GOTCHI') > 0) {
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

        this.on('dragend', (pointer: Phaser.Input.Pointer) => {
            // store the grid position dragging finished in
            const finalGridPos = this.gridLevel.getGridPositionFromXY(this.x, this.y);
            this.setGridPosition(finalGridPos.row, finalGridPos.col);
            this.dragAxis = 'NOT_ASSIGNED';

            // adjust the player stat
            if (!(finalGridPos.row === this.ogDragGridPosition.row && finalGridPos.col === this.ogDragGridPosition.col)) {
                    this.adjustPlayerStat('MOVE_GOTCHI', -1);
                    // in case we were burnt change status back to 'ready'
                    this.status = 'READY';
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
    public adjustPlayerStat(stat: 'INTERACT_GOTCHI' | 'MOVE_GOTCHI' | 'MOVE_AGGRO' | 'INTERACT_AGGRO' | 'INTERACT_PORTAL' | 'MOVE_PORTAL' | 'MOVE_BOOSTER' | 'INTERACT_BOOSTER', value: number) {
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
            case 'DOWN': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row+1, this.gridPosition.col) as GridObject; break;
            case 'LEFT': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1) as GridObject; break;
            case 'UP': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col) as GridObject; break;
            case 'RIGHT': potentialLeader = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1) as GridObject; break;
            default: break;
            
        }

        // double check the grid object we found is a gotchi
        if (potentialLeader?.getType() === 'GOTCHI') {
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
        this.followers[0] = (downGotchi && downGotchi.getType() === 'GOTCHI' && (downGotchi as GO_Gotchi).getDirection() === 'UP') ? 
            downGotchi : 0;

        const leftGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col-1);
        this.followers[1] = (leftGotchi && leftGotchi.getType() === 'GOTCHI' && (leftGotchi as GO_Gotchi).getDirection() === 'RIGHT') ? 
            leftGotchi : 0;

        const upGotchi = this.gridLevel.getGridObject(this.gridPosition.row-1, this.gridPosition.col);
        this.followers[2] = (upGotchi && upGotchi.getType() === 'GOTCHI' && (upGotchi as GO_Gotchi).getDirection() === 'DOWN') ? 
            upGotchi : 0;

        const rightGotchi = this.gridLevel.getGridObject(this.gridPosition.row, this.gridPosition.col+1);
        this.followers[3] = (rightGotchi && rightGotchi.getType() === 'GOTCHI' && (rightGotchi as GO_Gotchi).getDirection() === 'LEFT') ? 
            rightGotchi : 0;
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
                (this.scene as GameScene).getGui()?.adjustScore(20);
                this.scene.add.tween({
                    targets: this,
                    scale: 0,
                    angle: 720,
                    duration: 500,
                    onComplete: () => {
                        this.destroy();
                    }
                });
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
    }

    public calcCongaChain(gotchiChain: Array<GO_Gotchi>) {
        // call our recursive function
        this.getCongaChain(gotchiChain);
    }

    // get conga chain
    private getCongaChain(gotchiChain: Array<GO_Gotchi>) {
        // for each follower that is a gotchi add them to the chain and call their followers too
        if (this.followers[0]) {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[0] as GO_Gotchi));
            (this.followers[0] as GO_Gotchi).getCongaChain(gotchiChain);
        }
        if (this.followers[1]) {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[1] as GO_Gotchi));
            (this.followers[1] as GO_Gotchi).getCongaChain(gotchiChain);
        }
        if (this.followers[2]) {
            // add to the gotchi chain and check the follower for followers
            gotchiChain.push((this.followers[2] as GO_Gotchi));
            (this.followers[2] as GO_Gotchi).getCongaChain(gotchiChain);
        }
        if (this.followers[3]) {
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

        // update direction guide position
        switch (this.getDirection()) {
            case 'DOWN': { this.directionGuide.setPosition(this.x, this.y+this.displayHeight/2); break; }
            case 'LEFT': { this.directionGuide.setPosition(this.x-this.displayWidth/2, this.y); break; }
            case 'UP': { this.directionGuide.setPosition(this.x, this.y-this.displayHeight/2); break; }
            case 'RIGHT': { this.directionGuide.setPosition(this.x+this.displayWidth/2, this.y); break; }
        }

        // make sure rotate arrows follow their gotchi
        if (this.arrows.length === 4) {
            this.arrows[0].setPosition(this.x, this.y+this.displayHeight*.65);
            this.arrows[1].setPosition(this.x-this.displayWidth*.65, this.y);
            this.arrows[2].setPosition(this.x, this.y-this.displayHeight*.65);
            this.arrows[3].setPosition(this.x+this.displayWidth*.65, this.y);
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
  