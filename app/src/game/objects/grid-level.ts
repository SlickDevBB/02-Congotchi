import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GridObject, Player } from 'game/objects';
import { GOTCHI_BACK, GOTCHI_FRONT, GOTCHI_LEFT, GOTCHI_RIGHT, M67_GRENADE, MILKSHAKE, PORTAL_OPEN, UNCOMMON_CACTI } from 'game/assets';
import reportWebVitals from 'reportWebVitals';

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  gridSize: number;
  numberRows: number;
  numberCols: number;
  player: Player | undefined;
}

// going to number rows and columns start from 1
export interface GridPosition {
  row: number;
  col: number;
}

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
  private gridSize;
  private numberRows;
  private numberCols;
  private gotchiObjects: GridObject[] = [];
  private grenadeObjects: GridObject[] = [];
  private milkshakeObjects: GridObject[] = [];
  private cactiObjects: GridObject[] = [];
  private portalObjects: GridObject[] = [];
  private score = 0;
  private scoreText;
  private player;
  private gridCells: Array<GridCell>[] = [];

  constructor({ scene, x, y, gridSize, numberRows, numberCols, player }: Props) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.gridSize = gridSize;
    this.numberRows = numberRows;
    this.numberCols = numberCols;
    this.score = 0;

    this.player = player;

    // fill out the gridCells member
    for (let i = 0; i < this.numberRows; i++) {
      this.gridCells[i] = [];
      for (let j = 0; j < this.numberCols; j++) {
        this.gridCells[i][j] = { row: i, col: j, isActive: true, gridObject: 0}
      }
    }

    // add the scoring text
    this.scoreText = this.scene.add.text(
      getGameWidth(this.scene)*0.65,
      getGameHeight(this.scene)*0.1,
        'SCORE: 00000000',)
        .setVisible(true)
        .setStyle({
            fontFamily: 'Arial', 
            fontSize: Math.trunc(getGameHeight(this.scene)*0.03).toString() + 'px', 
          })
        .setOrigin(0.5,0.5)
        .setStroke('0x000000', 3);

    // add the main grid, we want to go for a 5x5
    this.gridSize = getGameWidth(this.scene)/(numberCols+2);
    const g1 = this.scene.add.grid(x, y, gridSize*numberCols, gridSize*numberRows, gridSize, gridSize, 0x000000, 0.5);
    g1.setOrigin(0,0);
    g1.setOutlineStyle(0x808080, 0.3);
    // const square = this.scene.add.rectangle(gridSize, gridSize*3,gridSize*numberCols,gridSize*numberRows);
    // square.setStrokeStyle(2, 0x808080, 0.6);
    // square.setOrigin(0,0);

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

  public getGridObjects(object: 'GOTCHIS' | 'GRENADES' | 'MILKSHAKES' | 'CACTI' | 'PORTALS') {
    switch (object) {
      case 'GOTCHIS': return this.gotchiObjects; break;
      case 'GRENADES': return this.grenadeObjects; break;
      case 'MILKSHAKES': return this.milkshakeObjects; break;
      case 'CACTI': return this.cactiObjects; break;
      case 'PORTALS': return this.portalObjects; break;
    }
  }
  
  // this is probably the function to get overidden in children classes
  public generateLevel(numberRescueGotchis: number, numberGrenades: number, numberMilkshakes: number, numberCacti: number) {
    // NEED TO ADD ERROR CHECKS TO ENSURE WE DON'T MAKE TOO MANY!!!
    for (let i = 0; i < numberRescueGotchis; i++) {
      const rgp = this.getRandomEmptyGridPosition();
      // console.log(randGridPosition);
      this.gridCells[rgp.row][rgp.col].gridObject = new GridObject({
        scene: this.scene,
        gridLevel: this,
        gridRow: rgp.row,
        gridCol: rgp.col,
        key: GOTCHI_FRONT,
        gridSize: this.gridSize,
        objectType: 'GOTCHI',
      });

      const rgo = this.gridCells[rgp.row][rgp.col].gridObject;

      // set random direction, interactive and make draggable.
      if (rgo) {
        rgo.setRandomDirection();
        rgo.setInteractive();
        this.scene.input.setDraggable(rgo);
      }
      
    }

    // generate grenades
    for (let i = 0; i < numberGrenades; i++) {
      const rgp = this.getRandomEmptyGridPosition();
      this.gridCells[rgp.row][rgp.col].gridObject = new GridObject({
        scene: this.scene,
        gridLevel: this,
        gridRow: rgp.row,
        gridCol: rgp.col,
        key: M67_GRENADE,
        gridSize: this.gridSize,
        objectType: 'GRENADE',
      });
    }

    // generate milkshakes
    for (let i = 0; i < numberMilkshakes; i++) {
      const rgp = this.getRandomEmptyGridPosition();
      this.gridCells[rgp.row][rgp.col].gridObject = new GridObject({
        scene: this.scene,
        gridLevel: this,
        gridRow: rgp.row,
        gridCol: rgp.col,
        key: MILKSHAKE,
        gridSize: this.gridSize,
        objectType: 'MILKSHAKE',
      });
    }

    // generate cacti
    for (let i = 0; i < numberCacti; i++) {
      const rgp = this.getRandomEmptyGridPosition();
      this.gridCells[rgp.row][rgp.col].gridObject = new GridObject({
        scene: this.scene,
        gridLevel: this,
        gridRow: rgp.row,
        gridCol: rgp.col,
        key: UNCOMMON_CACTI,
        gridSize: this.gridSize,
        objectType: 'CACTI',
      });
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

      if (this.isGridPositionEmpty(randRow, randCol)) {
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

  public isGridPositionEmpty(row: number, col: number): boolean {
    console.log(this.gridCells[row][col]);
    return true;
  }

  public getGridPositionFromXY(x: number, y: number): GridPosition {
    const offsetX = x - this.x;
    const offsetY = y - this.y;

    return { row: Math.floor(offsetY/this.gridSize), col: Math.floor(offsetX/this.gridSize) }
  }

  public setCongaLines() {
    // go through each gotchi object and see if it is a leader
    this.gotchiObjects.map( go => {
      // check above, right, below and left for potential gotchis looking at us
      const gogp = go.getGridPosition();

    
    });
  }
  
  update(): void {
    const a = 0;
  }



}
