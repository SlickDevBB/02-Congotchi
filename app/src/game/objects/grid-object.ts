import { GridLevel } from 'game/objects';
import { GridPosition } from './grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT } from 'game/assets';

interface Props {
    scene: Phaser.Scene;
    gridLevel: GridLevel;
    gridRow: number;
    gridCol: number;
    key: string;
    frame?: number;
    gridSize: number;
    objectType: 'GOTCHI' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' | 'PORTAL',
  }
  
  export class GridObject extends Phaser.GameObjects.Sprite {
    private direction: 'FRONT' | 'LEFT' | 'RIGHT' | 'BACK' = 'FRONT';
    public gridPosition: GridPosition;
    private gridLevel: GridLevel;
    private gridSize: number;
    private objectType: 'GOTCHI' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' | 'PORTAL' = 'GOTCHI';
    private leader: GridObject | 0 = 0;
    private follower: GridObject | 0 = 0;

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: Props) {
      super(scene,
        gridLevel.x + (gridCol)*gridSize + 0.5*gridSize,
        gridLevel.y + (gridRow)*gridSize + 0.5*gridSize, 
        key);

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
    }

    public setLeader(leader: GridObject) {
        this.leader = leader;
        return this;
    }

    public getLeader() {
        return this.leader;
    }

    public setFollower(follower: GridObject) {
        this.follower = follower;
        return this;
    }

    public getFollower() {
        return this.follower;
    }

    public setGridPosition(row: number, col: number) {
        if (this.gridLevel.isGridPositionEmpty(row, col) || (this.gridPosition.row === row && this.gridPosition.col === col)) {
            this.gridPosition = { row: row, col: col };

            // now set the position in actual space with a tween
            const newX = this.gridLevel.x + (this.gridPosition.col)*this.gridSize + 0.5*this.gridSize;
            const newY = this.gridLevel.y + (this.gridPosition.row)*this.gridSize + 0.5*this.gridSize;
            this.scene.add.tween({
                targets: this,
                x: newX,
                y: newY,
                duration: 100,
            });
        } 

        return this;

    }
  
    public getGridPosition() {
      return this.gridPosition;
    }

    public getDirection() {
        return this.direction;
    }

    public setDirection(direction: 'FRONT' | 'LEFT' | 'RIGHT' | 'BACK') {
        this.direction = direction;
        switch (direction) {
            case 'FRONT': {
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
            case 'BACK': {
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
        if (this.direction === 'BACK') this.setDirection('RIGHT');
        else if (this.direction === 'RIGHT') this.setDirection('FRONT');
        else if (this.direction === 'FRONT') this.setDirection('LEFT');
        else if (this.direction === 'LEFT') this.setDirection('BACK');
        return this;
    }
    public rotateACW() {
        if (this.direction === 'BACK') this.setDirection('LEFT');
        else if (this.direction === 'LEFT') this.setDirection('FRONT');
        else if (this.direction === 'FRONT') this.setDirection('RIGHT');
        else if (this.direction === 'RIGHT') this.setDirection('BACK');
        return this;
    }

    public setRandomDirection() {
        const rand = Math.floor(Math.random()*4);
        if (rand === 0) this.setDirection('FRONT');
        else if (rand === 1) this.setDirection('LEFT');
        else if (rand === 2) this.setDirection('RIGHT');
        else this.setDirection('BACK');
        return this;
    }
  
    update(): void {
      const a = '';
    }
  }
  