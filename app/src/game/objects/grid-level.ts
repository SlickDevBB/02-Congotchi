// grid-level.ts
// this object should focus solely on creating and handling input on a grid game board


import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GO_Empty, GO_Gotchi, GO_Inactive, GO_Portal, GridObject, LevelConfig, Player } from 'game/objects';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, GUI_SCORE_PANEL, M67_GRENADE, MILKSHAKE, PORTAL_CLOSED, PORTAL_OPEN, UNCOMMON_CACTI } from 'game/assets';
import '../helpers/constants';
import { DEPTH_GRID_LEVEL, DEPTH_GRID_OBJECTS } from '../helpers/constants';
import { GameScene } from 'game/scenes/game-scene';

interface Props {
  scene: Phaser.Scene;
  player: Player;
  levelConfig: LevelConfig;
  // x: number,
  // y: number,
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
  gridObject: GridObject;
  gridRectangle: Phaser.GameObjects.Rectangle | 'INACTIVE';
}

export class GridLevel {
  public x;
  public y;
  private scene: Phaser.Scene;
  // private gridRectangles: Phaser.GameObjects.Rectangle[] = [];
  private gridSize;
  private numberRows;
  private numberCols;
  private player?: Player;
  private gridCells: Array<GridCell>[] = [];
  private levelConfig: LevelConfig; 

  // define a gotchi array to make it easier to go through gotchis
  // private gotchiObjects: GO_Gotchi[] = [];

  constructor({ scene, player, levelConfig, }: Props) {
    // store our scene, player and levelConfig
    this.scene = scene;
    this.player = player;
    this.levelConfig = levelConfig;

    // create the grid level
    this.numberRows = this.levelConfig.gridObjectLayout.length;
    this.numberCols = this.levelConfig.gridObjectLayout[0].length;
    const padGrid = 0.1;
    this.gridSize = getGameWidth(this.scene)/(this.numberCols + padGrid*2);
    this.x = this.gridSize*padGrid;
    this.y = 3*this.gridSize;

    // fill out the gridCells member based on the config file
    for (let i = 0; i < this.numberRows; i++) {
      this.gridCells[i] = [];
      for (let j = 0; j < this.numberCols; j++) {
        switch (this.levelConfig.gridObjectLayout[i][j]) {
          case 0: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j, 
              gridObject: new GO_Inactive({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: '', gridSize: this.gridSize, objectType: 'INACTIVE',}),
              gridRectangle: 'INACTIVE'}
            break;
          }
          case 1: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j, 
              gridObject: new GO_Empty({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: '', gridSize: this.gridSize, objectType: 'EMPTY',}),
              gridRectangle: this.makeRectangle(i,j)}
            break;
          }
          case 2: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: GOTCHI_FRONT, gridSize: this.gridSize, objectType: 'GOTCHI',}),
              gridRectangle:  this.makeRectangle(i,j)
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) { 
              rgo.setDirection('DOWN'); 
            }
            break;
          }
          case 3: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: GOTCHI_FRONT, gridSize: this.gridSize, objectType: 'GOTCHI',}),
              gridRectangle:  this.makeRectangle(i,j)
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) {
              rgo.setDirection('LEFT');
            }
            break;
          }
          case 4: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: GOTCHI_FRONT, gridSize: this.gridSize, objectType: 'GOTCHI',}),
              gridRectangle:  this.makeRectangle(i,j)
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) {
              rgo.setDirection('UP');
            }
            break;
          }
          case 5: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: GOTCHI_FRONT, gridSize: this.gridSize, objectType: 'GOTCHI',}),
              gridRectangle:  this.makeRectangle(i,j)
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) {
              rgo.setDirection('RIGHT');
            }
            break;
          }
          case 6: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Portal({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: PORTAL_CLOSED, gridSize: this.gridSize, objectType: 'PORTAL',}),
              gridRectangle: this.makeRectangle(i,j),
            }
            break;
          }
          default: break;
        }
      }
    }

    
  }

  public makeRectangle(row: number, col: number) {
    return this.scene.add.rectangle(
      this.x + this.gridSize*col, this.y + this.gridSize*row, 
      this.gridSize, this.gridSize
      )
      .setStrokeStyle(1, 0xffffff)
      .setFillStyle(0x000000, 0.8)
      .setOrigin(0,0)
      .setDepth(DEPTH_GRID_LEVEL)
      .setScrollFactor(0)
  }

  // set all the leader/follower relationships
  public setupCongaLines() {
    // for every gotchi in level check what's around it
    this.gridCells.map(row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI') {
        (cell.gridObject as GO_Gotchi).findLeader();
        (cell.gridObject as GO_Gotchi).findFollowers();
      }
    }));
  }

  // drawCongaLines() --- shades in all grids with a gotchi thats part of a line
  public drawCongaLines() {
    // find all gotchis with a leader or follower and colour their grid
    this.gridCells.map( row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI') {
        const gr = cell.gridRectangle;
        const go = cell.gridObject as GO_Gotchi;
        if (gr !== 'INACTIVE') {
          gr.setFillStyle(go.hasLeader() || go.hasFollower() ? 0x770077 : 0x000000);
        }
      }
    }))

  }

  // portalConga() --- checks for gotchis near open portals and congas them in
  public portalConga() {
    // first look for any open portals
    this.gridCells.map( row => row.map( cell => {
      if (cell.gridObject.getType() === 'PORTAL' && (cell.gridObject as GO_Portal).getStatus() === 'OPEN') {
        // find any conga gotchis and then start conga'ring them
        (cell.gridObject as GO_Portal).findCongaGotchis();
        (cell.gridObject as GO_Portal).startCongaChains();
      }
    }));
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
    const levelConfigClone = JSON.parse(JSON.stringify(levelConfig));
    for (let i = 0; i < levelConfigClone.gridObjectLayout.length; i++) {
      for (let j = 0; j < i; j++) {
          const tmp = levelConfigClone.gridObjectLayout[i][j];
          levelConfigClone.gridObjectLayout[i][j] = levelConfigClone.gridObjectLayout[j][i];
          levelConfigClone.gridObjectLayout[j][i] = tmp;
      }
    }
    return levelConfigClone;
  }

  public setGridObject(row: number, col: number, gridObj: GridObject) {
    // first destroy old rectangle at this location
    (this.gridCells[row][col].gridRectangle as Phaser.GameObjects.Rectangle)?.destroy();

    // now make new object
    if (gridObj.getType() === 'INACTIVE') this.gridCells[row][col] = { row: row, col: col, gridObject: gridObj, gridRectangle: 'INACTIVE' }
    else this.gridCells[row][col] = { row: row, col: col, gridObject: gridObj, gridRectangle: this.makeRectangle(row,col) }
  }

  public emptyGridObject(row: number, col: number) {
    // first destroy old rectangle at this location
    (this.gridCells[row][col].gridRectangle as Phaser.GameObjects.Rectangle)?.destroy();

    // now make a new empty grid object at this location
    this.gridCells[row][col] = { 
      row: row, 
      col: col, 
      gridObject: new GO_Empty({scene: this.scene, gridLevel: this, gridRow: row, gridCol: col, key: '', gridSize: this.gridSize, objectType: 'EMPTY',}),
      gridRectangle: this.makeRectangle(row,col)}
  }


  public getGridObject(row: number, col: number) : GridObject {
    return this.gridCells[row][col].gridObject;
  }


  public getRandomEmptyGridPosition(): GridPosition {
    let foundEmpty = false;
    const maxIterations = 1000;
    let i = 0;
    let emptyGridPosition = { row: 1, col: 1 };

    while (!foundEmpty) {
      const randRow = Math.floor(Math.random()*this.numberRows);
      const randCol = Math.floor(Math.random()*this.numberCols);

      if (this.gridCells[randRow][randCol].gridObject.getType() === 'EMPTY') {
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
    if (this.gridCells[row][col].gridObject.getType() === 'EMPTY') return true;
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
      if (this.gridCells[gp.row][gp.col].gridObject.getType() !== 'INACTIVE') return true;
      else return false;
    } else {
      return false;
    }
  }

  public onEndLevel() {
    // go through all grid cells and destroy everything
    this.gridCells.map( gc => {
      gc.map( gcc => {
        gcc.gridObject.destroy();
        if (gcc.gridObject.getType() !== 'INACTIVE') {
          const gr = gcc.gridRectangle as Phaser.GameObjects.Rectangle;
          if (gr) gr.destroy();
        }
      })
    })
  }

  update(): void {
    // setup all the conga lines (i.e. set gotchi leaders/followers)
    this.setupCongaLines();

    // shade in gotchi cells that are part of conga lines
    this.drawCongaLines();

    // conga gotchi lines next to any open portals
    this.portalConga();
  }



}
