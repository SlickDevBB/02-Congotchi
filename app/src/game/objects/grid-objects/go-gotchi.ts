// grid-object-base-class.ts - base class for all grid objects

import { GO_Props, GridLevel, GridObject } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';

// Grid objects will consist of 5 different types (action types will have sub types)
// 1) Gotchis
// 2) Portals
// 3) Stealth Action Objects (BLUE) - Gotchis can perform a stealth action on these items if dragged into them and player has enough stealth
//      a) Grenade - These can be diffused if gotchi dragged into them
//      b) Galaxy Brain - Gotchi will run to end of nearest available line
// 4) Aggro Action Objects (RED) - Gotchis can perform an aggressive action is dragged into them and player has enough aggro stat
//      a) Cacti - These can be destroyed if gotchis dragged into them
//      b) Coffee - Gotchi will randomly run around like crazy until it finds a new location
// 5) Fun Action Objects (GREEN) - Gotchis can perform a fun action if dragged into them and player has enough fun stat
//      a) Milkshake - These grant bonus points if gotchis dragged into them
//      b) Lil Pump Drank - Grants additional Movement points

// interface Props {
//     scene: Phaser.Scene;
//     gridLevel: GridLevel;
//     gridRow: number;
//     gridCol: number;
//     key: string;
//     frame?: number;
//     gridSize: number;
//     objectType: 'GOTCHI' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' | 'PORTAL',
//   }
  
  export class GO_Gotchi extends GridObject {
    private direction: 'DOWN' | 'LEFT' | 'RIGHT' | 'UP' = 'DOWN';
    private leader: GridObject | 0 = 0;
    private follower: GridObject | 0 = 0;

    // define variables for dragging object
    private timer = 0;
    private pointerDownGridPosition: GridPosition = {row: 0, col: 0, };
    private dragGridPosition = { row: 0, col: 0 };
    private dragAxis: 'X' | 'Y' | 'NOT_ASSIGNED' = 'NOT_ASSIGNED';
    private dragX = 0;
    private dragY = 0;

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize,objectType: 'GOTCHI'});

        // save our gridlevel
        this.gridLevel = gridLevel;  
        this.gridSize = gridSize;
        this.objectType = objectType;
        
        // set our grid position
        this.gridPosition = {row: gridRow, col: gridCol };

        // sprite
        this.setOrigin(0.5, 0.5);
    
        // physics
        this.scene.physics.world.enable(this);
  
        // set to size of grids from game
        this.setDisplaySize(gridSize, gridSize);
    
        // add to the scene
        this.scene.add.existing(this);

        // enable draggable input
        this.setInteractive();
        this.scene.input.setDraggable(this);

        // set behaviour for pointer click down
        this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log('pointer down');

            // get the time and grid we clicked in
            this.timer = new Date().getTime();
            this.pointerDownGridPosition = this.gridLevel.getGridPositionFromXY(pointer.x, pointer.y);

            
        });

        // set behaviour for pointer up event
        this.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            // get the new grid we've lifted the mouse pointer in
            const gp = this.gridLevel.getGridPositionFromXY(pointer.x, pointer.y);

            // see if we're close to a pointer down event for a single click
            const time2 = new Date().getTime();
            const delta = time2 - this.timer;
            if (delta < 200) {
                // this is where we bring up a gotchis rotate menu
            }
        });

        this.on('dragstart', () => {
            // store our initial drag positions
            this.dragGridPosition = this.getGridPosition();
            this.dragX = this.x;
            this.dragY = this.y;
        })

        // set behaviour for dragging
        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            const gameScene = this.scene as GameScene;
            const player = gameScene.getPlayer();

            if (gameScene && player) {    
                // if we've got movement points left we can drag
                if (player.getStat('MOVE') > 0) {
                    // only drag objects into grids they have space for
                    const gp = this.getGridPosition();
                    const aboveEmpty = gp.row > 0 && this.gridLevel.isGridPositionEmpty(gp.row-1, gp.col);
                    console.log(aboveEmpty);
                    console.log(gp.row);
                    console.log(gp.col);
                    console.log(this.gridLevel.getGridObject(gp.row-1, gp.col));
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
            const finalGridPos = this.gridLevel.getGridPositionFromXY(this.x, this.y);
            const ogGridPos = this.dragGridPosition;
            this.setGridPosition(finalGridPos.row, finalGridPos.col);
            this.dragAxis = 'NOT_ASSIGNED';

            const gameScene = this.scene as GameScene;
            const player = gameScene.getPlayer();
    
            // decrease the players move count
            if (player) {
                // check we didn't just end up back in original position
                if (!(finalGridPos.row === ogGridPos.row && finalGridPos.col === ogGridPos.col)) {
                    player.adjustStat('MOVE', -1);
                }
            }
        })

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
            if (!lookingAtUs) this.setLeader(potentialLeader);
            else this.setLeader(0);
        } else if (potentialLeader?.getType() === 'PORTAL') {
            this.setLeader(potentialLeader);
        } else {
            this.setLeader(0);
        }
    }

    public setLeader(leader: GridObject | 0) {
        this.leader = leader;
        if (leader && leader.getType() === 'GOTCHI') (leader as GO_Gotchi).follower = this;
        return this;
    }

    public getLeader() {
        return this.leader;
    }

    public hasLeader() {
        if (this.leader) return true;
        else return false;
    }

    // to avoid confusion we never allow an external class to set the follower
    // public setFollower(follower: GridObject) {
    //     this.follower = follower;
    //     return this;
    // }

    public getFollower() {
        return this.follower;
    }

    public hasFollower() {
        if (this.follower) return true;
        else return false;
    }

    public getDirection() {
        return this.direction;
    }

    public setDirection(direction: 'DOWN' | 'LEFT' | 'RIGHT' | 'UP') {
        this.direction = direction;
        switch (direction) {
            case 'DOWN': {
                this.setTexture(GOTCHI_FRONT);
                break;
            }
            case 'LEFT': {
                this.setTexture(GOTCHI_LEFT);
                break;
            }
            case 'RIGHT': {
                this.setTexture(GOTCHI_RIGHT);
                break;
            }
            case 'UP': {
                this.setTexture(GOTCHI_BACK);
                break;
            }
            default: {
                
                break;
            }
        }
        return this;
    }

    public rotateCW() {
        if (this.direction === 'UP') this.setDirection('RIGHT');
        else if (this.direction === 'RIGHT') this.setDirection('DOWN');
        else if (this.direction === 'DOWN') this.setDirection('LEFT');
        else if (this.direction === 'LEFT') this.setDirection('UP');
        return this;
    }
    public rotateACW() {
        if (this.direction === 'UP') this.setDirection('LEFT');
        else if (this.direction === 'LEFT') this.setDirection('DOWN');
        else if (this.direction === 'DOWN') this.setDirection('RIGHT');
        else if (this.direction === 'RIGHT') this.setDirection('UP');
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
  
    update(): void {
      const a = '';
    }
  }
  