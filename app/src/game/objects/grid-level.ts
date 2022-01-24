// grid-level.ts
// this object should focus solely on creating and handling input on a grid game board

import { getGameHeight, getGameWidth, } from '../helpers';
import { GO_Empty, GO_Gotchi, GO_Grenade, GO_Inactive, GO_Milkshake, GO_Portal, GO_Rofl, GO_Cactii, GridObject, LevelConfig, Player } from 'game/objects';
import { BLACK_SQUARE, BLUE_BLOCK, COMMON_DOWN_ROFL, COMMON_LEFT_ROFL, COMMON_RIGHT_ROFL, COMMON_UP_ROFL, GREEN_BLOCK, GRID_BG_COBBLE_STONES, M67_GRENADE, MILKSHAKE, MUSIC_GRID_LEVEL_A, PARTICLE_CONFETTI, PINK_BLOCK, PORTAL_CLOSED, RED_BLOCK, SOUND_DEFEAT, SOUND_SOFT_RESET, SOUND_VICTORY, UNCOMMON_CACTII,} from 'game/assets';
import '../helpers/constants';
import { DEPTH_GRID_LEVEL, DEPTH_GRID_SQUARES } from '../helpers/constants';
import { GameScene } from 'game/scenes/game-scene';
import { AavegotchiGameObject } from 'types';
import { MoveTips } from './move-tips';

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
  private victoryStatus: 'VICTORY' | 'DEFEAT' | 'STILL_PLAYING' = 'STILL_PLAYING';

  private moveTips?: MoveTips;

  private gridSquares: Array<Phaser.GameObjects.Image> = [];

  private actionsRemaining = 0;

  private congaRunning = false;

  private musicGridLevel?: Phaser.Sound.HTML5AudioSound;
  private soundVictory?: Phaser.Sound.HTML5AudioSound;
  private soundDefeat?: Phaser.Sound.HTML5AudioSound;
  private soundSoftReset?: Phaser.Sound.HTML5AudioSound;

  // create particle effects for reset
  private particleResetConfetti?: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private emitterResetConfetti?: Phaser.GameObjects.Particles.ParticleEmitter;

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

    // assign initial actions remaining
    this.actionsRemaining = this.levelConfig.actionsRemaining;

    // create a grid level music object and start playing
    this.musicGridLevel = this.scene.sound.add(MUSIC_GRID_LEVEL_A, { loop: true, }) as Phaser.Sound.HTML5AudioSound;
    this.musicGridLevel.play();

    // create the victory sound
    this.soundVictory = this.scene.sound.add(SOUND_VICTORY, { loop: false }) as Phaser.Sound.HTML5AudioSound;
    this.soundDefeat = this.scene.sound.add(SOUND_DEFEAT, { loop: false }) as Phaser.Sound.HTML5AudioSound;
    this.soundSoftReset = this.scene.sound.add(SOUND_SOFT_RESET, { loop: false }) as Phaser.Sound.HTML5AudioSound;

    // create level reset confetti
    this.particleResetConfetti = this.scene.add.particles(PARTICLE_CONFETTI);
    this.particleResetConfetti.setDepth(1000);

    this.emitterResetConfetti = this.particleResetConfetti.createEmitter({
      frame: [ 'red', 'blue', 'green', 'yellow' ],
      x: getGameWidth(this.scene)/2,
      y: getGameHeight(this.scene)/2,
      // angle: { min: -100, max: -80 },
      gravityY: 2000,
      speed: 1000,
      lifespan: 1000,
      quantity: 20,
      scale: { start: 0.15, end: 0 },
      blendMode: 'ADD'
    })
    .setScrollFactor(0)
    .stop();

    // populate the grid contents
    this.populateGridCells();

    // now go through eachgridcell that is active and assign a grid square image
    for (let i = 0; i < this.numberRows; i++) {
      for (let j = 0; j < this.numberCols; j++) {
        if (this.gridCells[i][j].gridRectangle !== 'INACTIVE') {
          this.gridSquares.push(this.scene.add.image(this.gridCells[i][j].gridObject.x, this.gridCells[i][j].gridObject.y,
            levelConfig.gridTexture)
            // .setTintFill(0x000000, 0x252525, 0x252525, 0x4d4d4d)
            // .setTint(0x505050)
            .setDepth(DEPTH_GRID_SQUARES)
            .setOrigin(0.5,0.5)
            .setDisplaySize(this.gridSize*.95, this.gridSize*.95)
            .setScrollFactor(0)
            )
          
        }
      }
    }

    // set the players stat mask so our level only sees stat points as per its levelconfig
    this.player.setStatMask(levelConfig.statMask);

    // create the movetips object
    this.moveTips = new MoveTips(this.scene, this, levelConfig.levelNumber);
  }

  public populateGridCells() {
      // fill out the gridCells members based on the level config file
      for (let i = 0; i < this.numberRows; i++) {
        this.gridCells[i] = [];
        for (let j = 0; j < this.numberCols; j++) {
          switch (this.levelConfig.gridObjectLayout[i][j]) {
            // A NON-GRID AREA
            case 0: {
              this.gridCells[i][j] = { 
                row: i, 
                col: j, 
                gridObject: new GO_Inactive({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: '', gridSize: this.gridSize, objectType: 'INACTIVE',}),
                gridRectangle: 'INACTIVE'}
              break;
            }
            // EMPTY GRID CELL
            case 1: {
              this.gridCells[i][j] = { 
                row: i, 
                col: j, 
                gridObject: new GO_Empty({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: '', gridSize: this.gridSize, objectType: 'EMPTY',}),
                gridRectangle: this.makeRectangle(i,j)}
              break;
            }
            // GOTCHI
            case 2: {
              // call our local gotchi generator
              this.generateGridCellGotchi(i, j);
              break;
            }
            // PORTAL
            case 3: {
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Portal({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: PINK_BLOCK, gridSize: this.gridSize, objectType: 'PORTAL',}),
                gridRectangle: this.makeRectangle(i,j),
              }
              break;
            }
            // MILKSHAKE
            case 4: {
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Milkshake({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: GREEN_BLOCK, gridSize: this.gridSize, objectType: 'MILKSHAKE',}),
                gridRectangle: this.makeRectangle(i,j),
              }
              break;
            }
            // GRENADE
            case 5: {
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Grenade({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: RED_BLOCK, gridSize: this.gridSize, objectType: 'GRENADE',}),
                gridRectangle: this.makeRectangle(i,j),
              }
              break;
            }
            // CACTII
            case 6: {
              this.gridCells[i][j] = { 
                row: i, 
                col: j,
                gridObject: new GO_Cactii({scene: this.scene, gridLevel: this, gridRow: i, gridCol: j, key: RED_BLOCK, gridSize: this.gridSize, objectType: 'CACTII',}),
                gridRectangle: this.makeRectangle(i,j),
              }
              break;
            }
            // BURNT GOTCHI
            case 9: {
              // call our local gotchi generator
              this.generateGridCellGotchi(i, j);
              (this.gridCells[i][j].gridObject as GO_Gotchi).setStatus('BURNT');
              break;
            }
            // COMMON ROFL
            case 11: {
              this.generateGridCellRofl(i, j, 'COMMON');
              break;
            }
            // UNCOMMON ROFL
            case 12: {
              this.generateGridCellRofl(i, j, 'UNCOMMON');
              break;
            }
            // RARE ROFL
            case 13: {
              this.generateGridCellRofl(i, j, 'RARE');
              break;
            }
            // LEGENDARY ROFL
            case 14: {
              this.generateGridCellRofl(i, j, 'LEGENDARY');
              break;
            }
            // MYTHIC ROFL
            case 15: {
              this.generateGridCellRofl(i, j, 'MYTHICAL');
              break;
            }
            // GODLIKE ROFL
            case 16: {
              this.generateGridCellRofl(i, j, 'COMMON');
              break;
            }
            default: {
              alert('No grid object configured for number "' + this.levelConfig.gridObjectLayout[i][j] + '"');
              break;
            }
          }
        }
      }

      // init all the grid colours by simply setting their gridobject to themselves
      this.gridCells.map(row => row.map( cell => {
        this.setGridObject(cell.gridObject.gridPosition.row, cell.gridObject.gridPosition.col, cell.gridObject);
      }));

      // count all our initial gotchis
      this.initialGotchiCount = 0;
      this.gridCells.map(row => row.map( cell => {
        if (cell.gridObject.getType() === 'GOTCHI') this.initialGotchiCount++;
      }));
  }

  // helper function to make a new random gotchi
  private generateGridCellGotchi (row: number, col: number) {
    // assign a random direction
    let direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';
    const rand = Math.floor(Math.random()*4) + 1;
    switch (rand) {
      case 1: direction = 'DOWN'; break;
      case 2: direction = 'LEFT'; break;
      case 3: direction = 'UP'; break;
      case 4: direction = 'RIGHT'; break;
    }

    if (this.randomGotchis) {
      // try get a new random gotchi
      let randGotchi = this.randomGotchis[this.randomGotchiCount];
      let randSVG = randGotchi ? randGotchi.svg : 0;
      let loopCount = 0;

      // check we have a valid svg
      while ((!randGotchi || !randSVG) && loopCount < 1000) {
        // increment rand count if we haven't exceeded length
        this.randomGotchiCount = (this.randomGotchiCount === this.randomGotchis.length) ? 0 : this.randomGotchiCount + 1;

        // try load in new rand gotchi
        randGotchi = this.randomGotchis[this.randomGotchiCount];
        randSVG = randGotchi ? randGotchi.svg : 0;

        // increment loop counter
        loopCount++;
      }

      // assign to the grid cell
      this.gridCells[row][col] = { 
        row: row, 
        col: col,
        gridObject: new GO_Gotchi({scene: this.scene, gridLevel: this, gridRow: row, gridCol: col, key: BLUE_BLOCK, gridSize: this.gridSize, objectType: 'GOTCHI', direction: direction}),
        gridRectangle:  this.makeRectangle(row,col),
      };

      // now set the gotchi object block texture to the random assigned gotchi
      (this.gridCells[row][col].gridObject as GO_Gotchi).setGotchiSprite(this.randomGotchis[this.randomGotchiCount].spritesheetKey);

      // increment rand count if we haven't exceeded length
      this.randomGotchiCount = this.randomGotchiCount === this.randomGotchis.length ? 0 : this.randomGotchiCount + 1;
    }
  }

  // helper function to make a new ROFL
  private generateGridCellRofl(row: number, col: number, rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'MYTHICAL' | 'GODLIKE') {
    // assign a random direction
    let direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';
    const rand = Math.floor(Math.random()*4) + 1;
    switch (rand) {
      case 1: direction = 'DOWN'; break;
      case 2: direction = 'LEFT'; break;
      case 3: direction = 'UP'; break;
      case 4: direction = 'RIGHT'; break;
    }
    
    this.gridCells[row][col] = { 
      row: row, 
      col: col,
      gridObject: new GO_Rofl({scene: this.scene, gridLevel: this, gridRow: row, gridCol: col, key: BLUE_BLOCK, gridSize: this.gridSize, objectType: 'ROFL', direction: direction, rarity: rarity}),
      gridRectangle:  this.makeRectangle(row,col)
    }
  }

  // helper function to make our rectangles
  public makeRectangle(row: number, col: number) {
    return this.scene.add.rectangle(
      this.x + this.gridSize*col, this.y + this.gridSize*row, 
      this.gridSize, this.gridSize
      )
      .setStrokeStyle(1, 0xffffff)
      .setFillStyle(0x101010, 1)
      .setOrigin(0,0)
      .setDepth(DEPTH_GRID_LEVEL)
      .setScrollFactor(0)
  }

  // set, adjust and get functions for action remaining number
  public setActionsRemaining(value: number) {
    this.actionsRemaining = value;
  }

  public adjustActionsRemaining(delta: number) {
    this.actionsRemaining += delta;
    this.actionsRemaining < 0 ? 0 : this.actionsRemaining;
  }

  public getActionsRemaining() {
    return this.actionsRemaining;
  }

  public getNumberGotchis() {
    // variable to track gotchi number
    let count = 0;

      // check if all gotchis are gone
      this.gridCells.map( row => row.map( cell => {
        if (cell.gridObject.getType() === 'GOTCHI') {
          count++;
        }
      }));

    return count;
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

  public getXFromCol(col: number) {
    return this.x + col * this.gridSize + 0.5*this.gridSize;
  }

  public getYFromRow(row: number) {
    return this.y + row * this.gridSize + 0.5*this.gridSize;
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

    // destroy all the grid squares
    this.gridSquares.map( gs => gs.destroy() );
    this.gridSquares = [];

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

    // destory our move tips
    this.moveTips?.destroy();
  }

  // function that allows player to reset mid level if they stuffed up
  public onSoftResetLevel() {
    // first delete all grid objects
    this.gridCells.map( gc => {
      gc.map( gcc => {
        gcc.gridObject.destroy();
        if (gcc.gridObject.getType() !== 'INACTIVE') {
          const gr = gcc.gridRectangle as Phaser.GameObjects.Rectangle;
          if (gr) gr.destroy();
        }
      })
    })

    // now repopulate all cells
    this.populateGridCells();

    // play our music again
    this.musicGridLevel?.stop();
    this.musicGridLevel?.play();

    // play our particle effect
    this.emitterResetConfetti?.start();
    setTimeout(() => {
      this.emitterResetConfetti?.stop();
    }, 250);

    // play the 'reset' sound
    this.soundSoftReset?.play();

    // reset victory status
    this.victoryStatus = 'STILL_PLAYING';

    // reset actions remaining
    this.actionsRemaining = this.levelConfig.actionsRemaining;

    // reset level status to ACTIVE
    this.status = 'ACTIVE';

    // delete the move tips and then recreate them
    this.moveTips?.destroy();
    this.moveTips = new MoveTips(this.scene, this, this.levelConfig.levelNumber);

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

  public triggerGrenadesNearCongotchis() {
    this.gridCells.map(row => row.map (cell => {
      if (cell.gridObject.getType() === 'GRENADE') {
        // go through a 3x3 grid of all objects adjacent grenade
        for (let i = cell.gridObject.gridPosition.row-1; i < cell.gridObject.gridPosition.row + 2; i++) {
          for (let j = cell.gridObject.gridPosition.col-1; j < cell.gridObject.gridPosition.col + 2; j++) {
              const go = this.getGridObject(i, j);
              if (go !== 'OUT OF BOUNDS' && go.getType() === 'GOTCHI' && (go as GO_Gotchi).status === 'READY_TO_CONGA') {
                  (cell.gridObject as GO_Grenade).trigger();
              }
          }
        }
      }
    }))
  }

  public congaLineStarted() {
    this.musicGridLevel?.stop();
    this.congaRunning = true;
    // alert('Conga line STARTED');
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

    this.congaRunning = false;

    // alert('Conga line FINISHED');
  }

  public isCongaStepRunning() {
    // return this.congaRunning;
    let congaRunning = false;

    // go through all grid objects and see if any gotchis or rofls are congotching
    this.gridCells.map( row => row.map( cell => {
      if (  (cell.gridObject.getType() === 'GOTCHI' && (cell.gridObject as GO_Gotchi).getStatus() === 'CONGOTCHING') ||
            (cell.gridObject.getType() === 'GOTCHI' && (cell.gridObject as GO_Gotchi).getStatus() === 'READY_TO_CONGA') ||
            (cell.gridObject.getType() === 'GOTCHI' && (cell.gridObject as GO_Gotchi).getStatus() === 'JUMPING') ) {
        congaRunning = true;
      } 
      if (  (cell.gridObject.getType() === 'ROFL' && (cell.gridObject as GO_Gotchi).getStatus() === 'CONGOTCHING') ||
            (cell.gridObject.getType() === 'ROFL' && (cell.gridObject as GO_Gotchi).getStatus() === 'READY_TO_CONGA') ||
            (cell.gridObject.getType() === 'ROFL' && (cell.gridObject as GO_Gotchi).getStatus() === 'JUMPING') ) {
        congaRunning = true;
      }

    }));

    return congaRunning;
  }

  public getGridCells() {
    return this.gridCells;
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

    // if gotchis are ready (nobody congotching) we can check for available conga lines
    if (!this.isCongaStepRunning()) {
        // conga gotchi lines next to any open portals
        this.runCongaPortals();
    } 

    // CHECK for level complete conditions, first don't bother checking until congas aren't running and we haven't already achieved a victory condition
    if (!this.congaRunning && this.victoryStatus === 'STILL_PLAYING') {
        // First check if all gotchis are gone
        if (this.getNumberGotchis() === 0) {
            // we got all gotchis so victory status should be VICTORY
            this.victoryStatus = 'VICTORY';
        }
        
        // Second check if we got through all our action points
        // NOTE: this needs to be on a timeout as some tweens are likely still resolving
        if (this.actionsRemaining === 0) {
          setTimeout( () => {
              if (this.actionsRemaining === 0 && !this.congaRunning) {
                // if we got at least one star we can declare VICTORY
                if (gui && gui.getStarScore() > 0) {
                  this.victoryStatus = 'VICTORY';
                } else {
                  this.victoryStatus = 'DEFEAT';
                }
                // show level over screen
                (this.scene as GameScene).showLevelOverScreen()
              }
          }, 250);
        }

        // if we got a victory condition we can show level over screen
        if (this.victoryStatus !== 'STILL_PLAYING') {
          setTimeout( () => { (this.scene as GameScene).showLevelOverScreen(); }, 250);
        }
    }

    

    // call update for all our grid objects
    this.gridCells.map(row => row.map(cell => {
      cell.gridObject.update();
    }))


    // call update for our move tips
    this.moveTips?.update();

    
  }

}
