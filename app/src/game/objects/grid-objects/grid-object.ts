// grid-object.ts - base class for all grid objects
import { GO_Empty, GridLevel } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GRID_OBJECTS } from 'game/helpers/constants';

export interface GO_Props {
    scene: Phaser.Scene;
    gridLevel: GridLevel;
    gridRow: number;
    gridCol: number;
    key: string;
    frame?: number;
    gridSize: number;
    objectType: 'BASE_CLASS' | 'INACTIVE' | 'EMPTY' | 'GOTCHI' | 'PORTAL' | 'GRENADE' | 'MILKSHAKE' | 'CACTI',
  }
  
  export class GridObject extends Phaser.GameObjects.Sprite {
    public gridPosition: GridPosition;
    protected gridLevel: GridLevel;
    protected gridSize: number;
    protected objectType: 'BASE_CLASS' | 'INACTIVE' | 'EMPTY' | 'GOTCHI' | 'PORTAL' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' = 'BASE_CLASS';
    protected bgSquareColour: 'PINK' | 'RED' | 'GREEN' | 'BLUE' | 'NONE' = 'NONE';
    protected bgSquare: Phaser.GameObjects.Rectangle;

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
      super(scene,
        gridLevel.x + (gridCol)*gridSize + 0.5*gridSize,
        gridLevel.y + (gridRow)*gridSize + 0.5*gridSize, 
        key);

      // save our gridlevel
      this.gridLevel = gridLevel;  
      this.gridSize = gridSize;
      this.objectType = objectType;
      this.setScrollFactor(0);

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

      // set the depth
      this.setDepth(DEPTH_GRID_OBJECTS);

      // create a rectangle background with our base colour
      this.bgSquare = this.scene.add.rectangle(
        this.x, this.y, 
        this.gridSize, this.gridSize
        )
        .setAlpha(0.33)
        .setStrokeStyle(1, 0xffffff)
        .setOrigin(0.5,0.5)
        .setDepth(DEPTH_GRID_OBJECTS - 1)
        .setScrollFactor(0)

      this.setBgSquareColour('NONE');

    }

    public setBgSquareColour(colour: 'PINK' | 'RED' | 'GREEN' | 'BLUE' | 'NONE') {
      this.bgSquare.setVisible(true);
      switch (colour) {
        case 'PINK': this.bgSquare.setFillStyle(0xfe019a); break;
        case 'RED' : this.bgSquare.setFillStyle(0xff0000); break;
        case 'GREEN' : this.bgSquare.setFillStyle(0x00ff00); break;
        case 'BLUE' : this.bgSquare.setFillStyle(0x0000ff); break;
        case 'NONE' : this.bgSquare.setVisible(false); break;
        default: break;
      }
    }

    public setGridPosition(row: number, col: number, customOnComplete?: () => any, keepOldObject = false, tweenDuration = 100) {
      // store our old row and column
      const oldRow = this.gridPosition.row;
      const oldCol = this.gridPosition.col;  

      // now set the position in actual space with a tween
      const newX = this.gridLevel.x + col*this.gridSize + 0.5*this.gridSize;
      const newY = this.gridLevel.y + row*this.gridSize + 0.5*this.gridSize;

      // add tween that moves our object sprite
      this.scene.add.tween({
          targets: this,
          x: newX,
          y: newY,
          duration: tweenDuration,
          ease: 'Quad.easeOut',
          onComplete: () => { 
            // run any custom onComplete code passed to us
            if (customOnComplete) customOnComplete(); 

            // set our new grid position
            this.gridPosition = { row: row, col: col };

            // now set the new gridlevel object
            if (!keepOldObject) this.gridLevel.setGridObject(row, col, this);

            // set our old position to empty if its not the same as our original position
            if (row !== oldRow || col !== oldCol) {
              this.gridLevel.setEmptyGridObject(oldRow, oldCol);
            }
          },
      });

      return this;

    }
  
    public getGridPosition() {
      return this.gridPosition;
    }

    public getType() {
      return this.objectType;
    }

    destroy() {
      super.destroy();
      this.bgSquare.destroy();
    }

  
    update(): void {
      // make sure bg square follows this object
      this.bgSquare.setPosition(this.x, this.y);
    }
  }
  