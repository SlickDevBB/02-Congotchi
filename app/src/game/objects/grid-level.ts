// grid-level.ts

import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GridObject, LevelConfig, Player } from 'game/objects';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, GUI_SCORE_PANEL, M67_GRENADE, MILKSHAKE, PORTAL_OPEN, UNCOMMON_CACTI } from 'game/assets';
import '../helpers/constants';
import { DEPTH_GRID_LEVEL, DEPTH_GRID_OBJECTS } from '../helpers/constants';

interface Props {
  scene: Phaser.Scene;
  player: Player;
  levelConfig: LevelConfig;
  x: number,
  y: number,
}

// going to number rows and columns start from 1
export interface GridPosition {
  row: number;
  col: number;
}

// note row and column numbering start from 0
export interface GridCell {
  row: number;
  col: number;
  isActive: boolean;
  gridObject: GridObject | 0;
}

export class GridLevel {
  public x;
  public y;
  private scene: Phaser.Scene;
  private gridRectangles: Phaser.GameObjects.Rectangle[] = [];
  private gridSize;
  private numberRows;
  private numberCols;
  private scorePanel: Phaser.GameObjects.Image;
  private score = 0;
  private scoreText;
  private player?: Player;
  private gridCells: Array<GridCell>[] = [];
  private levelConfig: LevelConfig; 

  constructor({ scene, player, levelConfig, x, y }: Props) {
    // store our scene, player and levelConfig
    this.scene = scene;
    this.player = player;
    this.levelConfig = this.getTransposedLevelConfig(levelConfig);

    // create the grid level
    this.numberRows = levelConfig.gridObjectLayout.length;
    this.numberCols = levelConfig.gridObjectLayout[0].length;
    const padGrid = 0.1;
    this.gridSize = getGameWidth(this.scene)/(this.numberCols + padGrid*2);
    this.x = x+this.gridSize*padGrid;
    this.y = y+3*this.gridSize;
    this.score = 0;

    // fill out the gridCells member based on the config file
    for (let i = 0; i < this.numberRows; i++) {
      this.gridCells[i] = [];
      for (let j = 0; j < this.numberCols; j++) {
        switch (levelConfig.gridObjectLayout[i][j]) {
          case 0: {
            this.gridCells[i][j] = { row: i, col: j, isActive: false, gridObject: 0}
            break;
          }
          case 1: {
            this.gridCells[i][j] = { row: i, col: j, isActive: true, gridObject: 0}
            break;
          }
          case 2: {
            this.gridCells[i][j] = { row: i, col: j, isActive: true, 
              gridObject: new GridObject({
                scene: this.scene,
                gridLevel: this,
                gridRow: i,
                gridCol: j,
                key: GOTCHI_FRONT,
                gridSize: this.gridSize,
                objectType: 'GOTCHI',
              })
              .setDepth(DEPTH_GRID_OBJECTS),
            }
            const rgo = this.gridCells[i][j].gridObject;
            // set random direction, interactive and make draggable.
            if (rgo) {
              rgo.setRandomDirection();
              rgo.setInteractive();
              this.scene.input.setDraggable(rgo);
            }
            break;
          }
          default: break;
        }

        // draw a rectangle for each non 0 element
        if (levelConfig.gridObjectLayout[i][j] !== 0) {
          this.gridRectangles.push(
            this.scene.add.rectangle(
              this.x + this.gridSize*i, this.y + this.gridSize*j, 
              this.gridSize, this.gridSize
              )
              .setStrokeStyle(1, 0xffffff)
              .setFillStyle(0x000000, 0.8)
              .setOrigin(0,0)
              .setDepth(DEPTH_GRID_LEVEL)
          );
        }
      }
    }

    // add the scorePanel
    this.scorePanel = this.scene.add.image(
      this.scene.cameras.main.scrollX + getGameWidth(this.scene)*0.05,
      this.scene.cameras.main.scrollY + getGameWidth(this.scene)*0.05,
      GUI_SCORE_PANEL,
    )
    .setOrigin(0,0)

    // add the scoring text
    this.scoreText = this.scene.add.text(
      this.scene.cameras.main.scrollX + getGameWidth(this.scene)*0.21,
      this.scene.cameras.main.scrollY + getGameWidth(this.scene)*0.095,
        '000000',)
        .setVisible(true)
        .setStyle({
            fontFamily: 'Arial', 
            fontSize: Math.trunc(getGameHeight(this.scene)*0.03).toString() + 'px', 
          })
        .setOrigin(0,0)
        .setStroke('0x000000', 3);

  }

  public getGridSize() {
    return this.gridSize;
  }

  public getNumberRows() {
    return this.numberRows;
  }

  public getNumberCols() {
    return this.numberCols;
  }

  public getTransposedLevelConfig(levelConfig: LevelConfig): LevelConfig {
    for (let i = 0; i < levelConfig.gridObjectLayout.length; i++) {
      for (let j = 0; j < i; j++) {
          const tmp = levelConfig.gridObjectLayout[i][j];
          levelConfig.gridObjectLayout[i][j] = levelConfig.gridObjectLayout[j][i];
          levelConfig.gridObjectLayout[j][i] = tmp;
      }
    }
    return levelConfig;
  }

  public setGridObject(row: number, col: number, gridObj: GridObject) {
    this.gridCells[row][col] = { row: row, col: col, isActive: true, gridObject: gridObj }
  }


  public getGridObject(row: number, col: number) : GridObject | 0 {
    if (this.gridCells[row][col].gridObject) {
      return this.gridCells[row][col].gridObject;
    } else {
      return 0;
    }
  }


  public getRandomEmptyGridPosition(): GridPosition {
    let foundEmpty = false;
    const maxIterations = 1000;
    let i = 0;
    let emptyGridPosition = { row: 1, col: 1 };

    while (!foundEmpty) {
      const randRow = Math.floor(Math.random()*this.numberRows);
      const randCol = Math.floor(Math.random()*this.numberCols);

      if (this.gridCells[randRow][randCol].gridObject === 0) {
        emptyGridPosition = { row: randRow, col: randCol };
        foundEmpty = true;
      }

      // break out with an error if we hit max iteraions
      if (i > maxIterations) {
        alert('Could not find an empty grid!');
        foundEmpty = true;
      }

      i++;
    }

    return emptyGridPosition;
  }

  public isGridPositionEmpty(row: number, col: number) {
    if (this.gridCells[row][col].gridObject === 0) return true;
    else return false;
  }

  public getGridPositionFromXY(x: number, y: number): GridPosition {
    const offsetX = x - this.x;
    const offsetY = y - this.y;

    return { row: Math.floor(offsetY/this.gridSize), col: Math.floor(offsetX/this.gridSize) }
  }

  public isCoordWithinGrid(x: number, y: number) {
    const gp = this.getGridPositionFromXY(x,y);
    if (this.gridCells[gp.row][gp.col]) {
      if (this.gridCells[gp.row][gp.col].isActive) return true;
      else return false;
    } else {
      return false;
    }
  }

  public destroy() {
    this.gridRectangles.map(gr => gr.destroy());
    this.scorePanel.destroy();
    this.scoreText.destroy();

    this.gridCells.map( gc => {
      gc.map( gcc => {
        if (gcc.gridObject) {
          gcc.gridObject.destroy();
        }
      })
    })
  }

  update(): void {
    const a = 0;
  }



}
