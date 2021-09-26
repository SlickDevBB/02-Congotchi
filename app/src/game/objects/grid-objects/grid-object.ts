// grid-object.ts - base class for all grid objects
import { GO_Empty, GridLevel } from 'game/objects';
import { GridPosition } from '../grid-level';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { DEPTH_GRID_OBJECTS } from 'game/helpers/constants';

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
    }

    public setGridPosition(row: number, col: number, customTween?: () => any) {
        // let the gridlevel know old position needs to be set to empty
        this.gridLevel.setGridObject(
          this.gridPosition.row, 
          this.gridPosition.col, 
          new GO_Empty({scene: this.scene, gridLevel: this.gridLevel, gridRow: this.gridPosition.row, gridCol: this.gridPosition.col, key: '', gridSize: this.gridSize, objectType: 'EMPTY',}));

        // set our new grid position
        this.gridPosition = { row: row, col: col };

        // now set the position in actual space with a tween
        const newX = this.gridLevel.x + (this.gridPosition.col)*this.gridSize + 0.5*this.gridSize;
        const newY = this.gridLevel.y + (this.gridPosition.row)*this.gridSize + 0.5*this.gridSize;
        if (customTween) {
          customTween();
        } else {
          this.scene.add.tween({
              targets: this,
              x: newX,
              y: newY,
              duration: 100,
          });
        }

        // now set the new grilevel object
        this.gridLevel.setGridObject(row, col, this);

        return this;

    }
  
    public getGridPosition() {
      return this.gridPosition;
    }

    public getType() {
      return this.objectType;
    }

  
    update(): void {
      const a = '';
    }
  }
  