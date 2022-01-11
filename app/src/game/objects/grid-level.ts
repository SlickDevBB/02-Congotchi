// grid-level.ts
// this object should focus solely on creating and handling input on a grid game board

import { getGameWidth, } from '../helpers';
import { GO_Empty, GO_Gotchi, GO_Grenade, GO_Inactive, GO_Milkshake, GO_Portal, GridObject, LevelConfig, Player } from 'game/objects';
import { M67_GRENADE, MILKSHAKE, MUSIC_GRID_LEVEL_A, PORTAL_CLOSED, SOUND_CONGA, SOUND_DEFEAT, SOUND_VICTORY,} from 'game/assets';
import '../helpers/constants';
import { DEPTH_GRID_LEVEL } from '../helpers/constants';
import { GameScene } from 'game/scenes/game-scene';
import { AavegotchiGameObject } from 'types';

interface Props {
  scene: Phaser.Scene;
  player: Player;
  randomGotchis: AavegotchiGameObject[] | undefined;
  levelConfig: LevelConfig;
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
  private gridSize;
  private numberRows;
  private numberCols;
  private player?: Player;
  private randomGotchis?: AavegotchiGameObject[] | undefined;
  private randomGotchiCount = 0;
  private gridCells: Array<GridCell>[] = [];
  private levelConfig: LevelConfig; 
  private levelOverOccurred = false;
  private initialGotchiCount = 0;
  private status: 'ACTIVE' | 'INACTIVE' | 'LEVEL_OVER_SCREEN';
  private victoryStatus: 'VICTORY' | 'DEFEAT' = 'DEFEAT';

  private musicGridLevel?: Phaser.Sound.HTML5AudioSound;
  private soundVictory?: Phaser.Sound.HTML5AudioSound;
  private soundDefeat?: Phaser.Sound.HTML5AudioSound;

  // fire up our constructor
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

    // create a grid level music object and start playing
    this.musicGridLevel = this.scene.sound.add(MUSIC_GRID_LEVEL_A, { loop: true, }) as Phaser.Sound.HTML5AudioSound;
    this.musicGridLevel.play();

    // create the victory sound
    this.soundVictory = this.scene.sound.add(SOUND_VICTORY, { loop: false }) as Phaser.Sound.HTML5AudioSound;
    this.soundDefeat = this.scene.sound.add(SOUND_DEFEAT, { loop: false }) as Phaser.Sound.HTML5AudioSound;

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
                //console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              //console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
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
                //console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              //console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
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
                //console.log('we getting in here when svg data is bad?');
                // increment rand count if we haven't exceeded length
                this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

                // try load in new rand gotchi
                randGotchi = this.randomGotchis[this.randomGotchiCount];
                randSVG = randGotchi ? randGotchi.svg : 0;

                // increment loop counter
                loopCount++;
              }
              //console.log('attempting to load: ' + this.randomGotchis[this.randomGotchiCount].spritesheetKey);
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
          case 7: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Grenade({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: M67_GRENADE, gridSize: this.gridSize, objectType: 'GRENADE',}),
              gridRectangle: this.makeRectangle(i,j),
            }
            break;
          }
          case 8: {
            this.gridCells[i][j] = { 
              row: i, 
              col: j,
              gridObject: new GO_Milkshake({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: MILKSHAKE, gridSize: this.gridSize, objectType: 'MILKSHAKE',}),
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

  // function to check for a victory
  public isVictory() {
    // first check if levelOverOccurred is true
    if (this.levelOverOccurred) {
      return false;
    } 
    else {
      // 
      // create booleans to see if any gotchis left and any portal points left
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
        if (this.player.getStat("INTERACT_BLUE") > 0 || this.player.getStat('MOVE_BLUE') > 0) {
          noPortalPointsLeft = false;
        }
      }

      this.levelOverOccurred = (noGotchisLeft || noPortalPointsLeft);
      return this.levelOverOccurred;
    }
  }

  public getLevelNumber() {
    return this.levelConfig.levelNumber;
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

  public getGridObject(row: number, col: number) : GridObject | 'OUT OF BOUNDS' {
    // try see if we can access the gridobject, if not carry on and return out of bounds
    try {
        return this.gridCells[row][col].gridObject;
    } catch (err) {
      // console.log(err);
      return 'OUT OF BOUNDS';
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
    return this.gridCells[row][col].gridObject.getType() === 'EMPTY';
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

    // fade out music
    this.scene.add.tween({
      targets: this.musicGridLevel,
      volume: 0,
      duration: 1500,
      onComplete: () => {
        this.musicGridLevel?.stop();
      }
    })
  }

  public onLevelOverScreen() {
    // do level over screen stuff
    this.status = 'LEVEL_OVER_SCREEN';

    // stop grid level music
    this.musicGridLevel?.stop();

    // depending on status play end of level music
    if (this.victoryStatus === 'VICTORY') this.soundVictory?.play();
    else this.soundDefeat?.play();
  }

  public setStatus(status: 'ACTIVE' | 'INACTIVE' | 'LEVEL_OVER_SCREEN') {
    this.status = status;
  }

  public getStatus() {
    return this.status;
  }

  public setVictoryStatus(status: 'VICTORY' | 'DEFEAT') {
    this.victoryStatus = status;
  }

  public getVictoryStatus() {
    return this.status;
  }

  public explodeGrenadesNearCongotchis() {
    this.gridCells.map(row => row.map (cell => {
      if (cell.gridObject.getType() === 'GRENADE') {
        // go through a 3x3 grid of all objects adjacent grenade
        for (let i = cell.gridObject.gridPosition.row-1; i < cell.gridObject.gridPosition.row + 2; i++) {
          for (let j = cell.gridObject.gridPosition.col-1; j < cell.gridObject.gridPosition.col + 2; j++) {
              const go = this.getGridObject(i, j);
              if (go !== 'OUT OF BOUNDS' && go.getType() === 'GOTCHI' && (go as GO_Gotchi).status === 'READY_TO_CONGA') {
                  (cell.gridObject as GO_Grenade).explode();
              }
          }
        }
      }
    }))
  }

  public congaLineStarted() {
    this.musicGridLevel?.stop();
  }

  public congaLineFinished() {
    // restart grid music
    this.musicGridLevel?.setVolume(0);
    this.musicGridLevel?.play();

    this.scene.tweens.add({
      targets: this.musicGridLevel,
      volume: 1,
      duration: 2000,
    })
  }

  public isCongaRunning() {
    let congaRunning = false;
    // go through all grid objects and see if any gotchis are congotching
    this.gridCells.map( row => row.map( cell => {
      if (  (cell.gridObject.getType() === 'GOTCHI' && (cell.gridObject as GO_Gotchi).getStatus() === 'CONGOTCHING') ||
            (cell.gridObject.getType() === 'GOTCHI' && (cell.gridObject as GO_Gotchi).getStatus() === 'READY_TO_CONGA') ||
            (cell.gridObject.getType() === 'GOTCHI' && (cell.gridObject as GO_Gotchi).getStatus() === 'JUMPING')
        ) {
        congaRunning = true;
      }
    }));
    return congaRunning;
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
    if (this.isVictory()) {
      // change our victory status
      this.victoryStatus = 'VICTORY';
      
      // set a timeout to end the level
      setTimeout( () => {
        (this.scene as GameScene).showLevelOverScreen();
      }, 1000);
    } 

    // if gotchis are ready (nobody congotching) we can do stuff
    if (!this.isCongaRunning()) {

      // setup all leader and follower relationships for gotchis
      this.setupLeadersAndFollowers(); 

      // conga gotchi lines next to any open portals
      this.runCongaPortals();
    } 

    // call update for all our grid objects
    this.gridCells.map(row => row.map(cell => {
      cell.gridObject.update();
    }))

    
  }

}
