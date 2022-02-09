// grid-object.ts - base class for all grid objects
import { GridLevel } from 'game/objects';
import { GridPosition } from '../grid-level';
import { DEPTH_GO_DEFAULT_BLOCK, DEPTH_GO_PORTAL_BLOCK } from 'game/helpers/constants';
import { Player } from '../player';
import { GameScene } from 'game/scenes/game-scene';
import { Gui } from '../gui';
import { BLUE_BLOCK, GREEN_BLOCK, PINK_BLOCK, QUESTION_MARK_ICON, RED_BLOCK } from 'game/assets';
import { Socket } from 'socket.io-client';

export interface GO_Props {
    scene: Phaser.Scene;
    gridLevel: GridLevel;
    gridRow: number;
    gridCol: number;
    key: string;
    frame?: number;
    gridSize: number;
    objectType: 'BASE_CLASS' | 'INACTIVE' | 'EMPTY' | 'GOTCHI' | 'PORTAL' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' | 'ROFL' | 'CACTII';
  }
  
export class GridObject extends Phaser.GameObjects.Sprite {
    public gridPosition: GridPosition;
    protected gridLevel: GridLevel;
    protected gridSize: number;
    protected objectType: 'BASE_CLASS' | 'INACTIVE' | 'EMPTY' | 'GOTCHI' | 'PORTAL' | 'GRENADE' | 'MILKSHAKE' | 'CACTI' | 'ROFL' | 'CACTII' = 'BASE_CLASS';
    protected bgSquareColour: 'PINK' | 'RED' | 'GREEN' | 'BLUE' | 'NONE' = 'NONE';
    // protected bgSquare: Phaser.GameObjects.Rectangle;
    // protected bgBlock?: Phaser.GameObjects.Image;
    public blockSprite?: Phaser.GameObjects.Sprite;
    protected player?: Player;
    protected gui?: Gui;
    protected socket: Socket | null = null;

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, objectType }: GO_Props) {
      super(scene,
        gridLevel.x + (gridCol)*gridSize + 0.5*gridSize,
        gridLevel.y + (gridRow)*gridSize + 0.5*gridSize, 
        key);

      this.socket = this.scene.game.registry.values.socket;

      // save our gridlevel
      this.gridLevel = gridLevel;  
      this.gridSize = gridSize;
      this.objectType = objectType;
      this.setScrollFactor(0);

      // save our player and gui
      this.player = (scene as GameScene).getPlayer();
      this.gui = (scene as GameScene).getGui();

      // set our grid position
      this.gridPosition = {row: gridRow, col: gridCol };

      // sprite
      this.setOrigin(0.5, 0.5);
  
      // physics
      this.scene.physics.world.enable(this);
  
      // set to size of grids from game
      this.setDisplaySize(gridSize*.95, gridSize*.95);
  
      // add to the scene
      this.scene.add.existing(this);

      // enable draggable input
      this.setInteractive();
      this.scene.input.setDraggable(this);
      
      // add block text. NOTE: Children classes need to overide this in their constructor
      this.blockSprite = this.scene.add.sprite(this.x, this.y, QUESTION_MARK_ICON)
        .setScrollFactor(0)
        .setOrigin(0.5,0.5)
        .setDisplaySize(this.gridSize*.9, this.gridSize*.9);

      // All blocks have same depth except portal blocks which are +1 so gotchi blocks tween below them during portalling
      this.setDepth(DEPTH_GO_DEFAULT_BLOCK);
      this.blockSprite.setDepth(DEPTH_GO_DEFAULT_BLOCK + 1);
    }

    public setGridPosition(row: number, col: number, customOnComplete?: () => any | undefined, keepOldObject = false, tweenDuration = 100, customEase = 'linear') {
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
          ease: customEase,
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
      // this.bgSquare.destroy();
      this.blockSprite?.destroy();
    }

  
    update(): void {
      // make sure bg square follows this object
      this.blockSprite?.setPosition(this.x, this.y);
    }
  }
  