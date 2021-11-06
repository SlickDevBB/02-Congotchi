// grid-level.ts
// this object should focus solely on creating and handling input on a grid game board


import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GO_Empty, GO_Gotchi, GO_Inactive, GO_Portal, GridObject, LevelConfig, Player } from 'game/objects';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, GUI_SCORE_PANEL, M67_GRENADE, MILKSHAKE, PORTAL_CLOSED, PORTAL_OPEN, UNCOMMON_CACTI } from 'game/assets';
import '../helpers/constants';
import { DEPTH_GRID_LEVEL, DEPTH_GRID_OBJECTS } from '../helpers/constants';
import { GameScene } from 'game/scenes/game-scene';
import { AavegotchiGameObject } from 'types';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';
import { Game } from 'phaser';

interface Props {
  scene: Phaser.Scene;
  player: Player;
  randomGotchis: AavegotchiGameObject[] | undefined;
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
  private randomGotchis?: AavegotchiGameObject[] | undefined;
  private randomGotchiCount = 0;
  private gridCells: Array<GridCell>[] = [];
  private levelConfig: LevelConfig; 
  private levelOver = false;
  private initialGotchiCount = 0;
  private status: 'ACTIVE' | 'INACTIVE';

  constructor({ scene, player, randomGotchis, levelConfig, }: Props) {
    // store our scene, player and levelConfig
    this.scene = scene;
    this.player = player;
    this.randomGotchis = randomGotchis;
    this.levelConfig = levelConfig;
    this.status = 'ACTIVE';

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
          // DOWN GOTCHI
          case 2: {
            if (this.randomGotchis) {
              // try get a new random gotchi
              let randGotchi = this.randomGotchis[this.randomGotchiCount];
              let randSVG = randGotchi ? randGotchi.svg : 0;
              let loopCount = 0;

              // check we have a valid svg
              while ((!randGotchi || !randSVG) && loopCount < 1000) {
                console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: this.randomGotchis[this.randomGotchiCount].spritesheetKey, gotchi: this.randomGotchis[this.randomGotchiCount], gridSize: this.gridSize, objectType: 'GOTCHI',}),
                gridRectangle:  this.makeRectangle(i,j)
              }
              // increment rand count if we haven't exceeded length
              this.randomGotchiCount = this.randomGotchiCount === this.randomGotchis.length ? 0 : this.randomGotchiCount + 1;
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) { 
              rgo.setDirection('DOWN'); 
            }
            break;
          }
          // LEFT GOTCHI
          case 3: {
            if (this.randomGotchis) {
              // try get a new random gotchi
              let randGotchi = this.randomGotchis[this.randomGotchiCount];
              let randSVG = randGotchi ? randGotchi.svg : 0;
              let loopCount = 0;

              // check we have a valid svg
              while ((!randGotchi || !randSVG) && loopCount < 1000) {
                console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: this.randomGotchis[this.randomGotchiCount].spritesheetKey, gotchi: this.randomGotchis[this.randomGotchiCount], gridSize: this.gridSize, objectType: 'GOTCHI',}),
                gridRectangle:  this.makeRectangle(i,j)
              }
              // increment rand count if we haven't exceeded length
              this.randomGotchiCount = this.randomGotchiCount === this.randomGotchis.length ? 0 : this.randomGotchiCount + 1;
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) {
              rgo.setDirection('LEFT');
            }
            break;
          }
          // UP GOTCHI
          case 4: {
            if (this.randomGotchis) {
              // try get a new random gotchi
              let randGotchi = this.randomGotchis[this.randomGotchiCount];
              let randSVG = randGotchi ? randGotchi.svg : 0;
              let loopCount = 0;

              // check we have a valid svg
              while ((!randGotchi || !randSVG) && loopCount < 1000) {
                console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: this.randomGotchis[this.randomGotchiCount].spritesheetKey, gotchi: this.randomGotchis[this.randomGotchiCount], gridSize: this.gridSize, objectType: 'GOTCHI',}),
                gridRectangle:  this.makeRectangle(i,j)
              }
              // increment rand count if we haven't exceeded length
              this.randomGotchiCount = this.randomGotchiCount === this.randomGotchis.length ? 0 : this.randomGotchiCount + 1;
            }
            const rgo = this.gridCells[i][j].gridObject as GO_Gotchi;
            // case 2 needs to aim down
            if (rgo) {
              rgo.setDirection('UP');
            }
            break;
          }
          // RIGHT GOTCHI
          case 5: {
            if (this.randomGotchis) {
              // try get a new random gotchi
              let randGotchi = this.randomGotchis[this.randomGotchiCount];
              let randSVG = randGotchi ? randGotchi.svg : 0;
              let loopCount = 0;

              // check we have a valid svg
              while ((!randGotchi || !randSVG) && loopCount < 1000) {
                console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: this.randomGotchis[this.randomGotchiCount].spritesheetKey, gotchi: this.randomGotchis[this.randomGotchiCount], gridSize: this.gridSize, objectType: 'GOTCHI',}),
                gridRectangle:  this.makeRectangle(i,j)
              }
              // increment rand count if we haven't exceeded length
              this.randomGotchiCount = this.randomGotchiCount === this.randomGotchis.length ? 0 : this.randomGotchiCount + 1;
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

    // find all the initial leaders and followers
    this.setupLeadersAndFollowers();

    // init all the grid colours by simply setting their gridobject to themselves
    this.gridCells.map(row => row.map( cell => {
      this.setGridObject(cell.gridObject.gridPosition.row, cell.gridObject.gridPosition.col, cell.gridObject);
    }));

    // count all our initial gotchis
    this.gridCells.map(row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI') this.initialGotchiCount++;
    }));
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
  public setupLeadersAndFollowers() {
    // for every gotchi in level check what's around it
    this.gridCells.map(row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI') {
        (cell.gridObject as GO_Gotchi).findLeader();
        (cell.gridObject as GO_Gotchi).findFollowers();
      }
    }));
  }

  // runCongaPortals() --- checks for gotchis near open portals and congas them in
  public runCongaPortals() {
    // first look for any open portals
    this.gridCells.map( row => row.map( cell => {
      if (cell.gridObject.getType() === 'PORTAL' && (cell.gridObject as GO_Portal).getStatus() === 'OPEN') {
        // run our conga chains
        (cell.gridObject as GO_Portal).runCongaChains();
      }
    }));
  }

  public isGotchiGangReady() {
    let gotchisReady = true;
    // first look for any open portals
    this.gridCells.map( row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI' && !( (cell.gridObject as GO_Gotchi).getStatus() === 'READY') && !( (cell.gridObject as GO_Gotchi).getStatus() === 'WAITING')) {
        // we have a gotchi not ready so set gotchisREady to false
        gotchisReady = false;
      }
    }));
    return gotchisReady;
  }

  public isLevelOver() {
    // declare a level over variable
    let noGotchisLeft = true;
    let noPortalPointsLeft = true;

    // check if all gotchis are gone
    this.gridCells.map( row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI') {
        noGotchisLeft = false;
      }
    }));

    // check if we've still got portal moves/opens
    if (this.player) {
      if (this.player.getStat("INTERACT_PORTAL") > 0 || this.player.getStat('MOVE_PORTAL') > 0) {
        noPortalPointsLeft = false;
      }
    }

    return (noGotchisLeft || noPortalPointsLeft);
  }
  
  // public setGotchiArrowsVisible(visible: boolean) {
  //   this.gridCells.map(row => row.map(cell => {
  //     if (cell.gridObject.getType() === 'GOTCHI') {
  //       (cell.gridObject as GO_Gotchi).setRotateArrowsVisible(visible);
  //     }
  //   }))
  // }



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

  public renderGridCell(row: number, col: number) {
     // based on the gridobject type we should shade the cell
     const gr = this.gridCells[row][col].gridRectangle as Phaser.GameObjects.Rectangle;
     const go = this.gridCells[row][col].gridObject;
     switch (go.getType()) {
       case 'EMPTY': {
         gr.setFillStyle(0x000000); 
         break;
       }
       case 'GOTCHI': {
         if ( (go as GO_Gotchi).hasFollower() || (go as GO_Gotchi).hasLeader() ) {
           gr.setFillStyle(0x770077);
         } else {
           gr.setFillStyle(0x000000);
         }
         break;
       }
       case 'PORTAL': {
         gr.setFillStyle(0x000077);
       }
     }
  }

  public setGridObject(row: number, col: number, gridObj: GridObject) {
    // set the new grid object to the cell requested
    if (this.gridCells[row][col]) {
      this.gridCells[row][col].gridObject = gridObj;
    } else {
      alert('Setting to invalid gridcell')
    }
  }

  public setEmptyGridObject(row: number, col: number) {
    this.setGridObject(row, col, new GO_Empty({
      scene: this.scene, gridLevel: this, gridRow: row, gridCol: col, key: '', gridSize: this.gridSize, objectType: 'EMPTY',}));
  
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

    this.status = 'INACTIVE';
  }

  public getStatus() {
    return this.status;
  }


  update(): void {
    // update our star score depending on gotchis saved
    let remainingGotchiCount = 0;
    const gui = (this.scene as GameScene).getGui();
    this.gridCells.map(row => row.map( cell => {
      if (cell.gridObject.getType() === 'GOTCHI') remainingGotchiCount++;
    }));

    if (gui) {
      if (remainingGotchiCount > this.initialGotchiCount * 2/3) {
        gui.setStarScore(0);
      }
      else if (remainingGotchiCount > this.initialGotchiCount * 1/3) {
        gui.setStarScore(1);
      }
      else if (remainingGotchiCount > 0) {
        gui.setStarScore(2);
      }
      else {
        gui.setStarScore(3);
      }
    }

    // if level is over call our scenes end level function
    if (this.isLevelOver() && !this.levelOver) {
      this.levelOver = true;
      // set a timeout to end the level
      setTimeout( () => {
        (this.scene as GameScene).getGui()?.showLevelOverScreen();
        // (this.scene as GameScene).endLevel();
      }, 500);
    }

    // if gotchis are ready we can do stuff
    if (this.isGotchiGangReady()) {

      // setup all leader and follower relationships for gotchis
      this.setupLeadersAndFollowers(); 

      // conga gotchi lines next to any open portals
      this.runCongaPortals();

      // render all grid cells
      this.gridCells.map(row => row.map( cell => this.renderGridCell(cell.gridObject.gridPosition.row, cell.gridObject.gridPosition.col)));

    }

    

    // call update for all our grid objects
    this.gridCells.map(row => row.map(cell => {
      cell.gridObject.update();
    }))

    
  }

}
