import {
  LEFT_CHEVRON, BG, CLICK, ARROW_DOWN,
} from 'game/assets';
import { AavegotchiGameObject } from 'types';
import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GridLevel, Player, InputHandler } from 'game/objects';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

/**
 * Scene where gameplay takes place
 */
export class GameScene extends Phaser.Scene {
  private player?: Player;
  private selectedGotchi?: AavegotchiGameObject;
  private gridLevel: GridLevel | 0 = 0;
  private gridSize = 0;
  private inputHandler?: InputHandler;

  // Sounds
  private back?: Phaser.Sound.BaseSound;

  constructor() {
    super(sceneConfig);
  }

  init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
    this.selectedGotchi = data.selectedGotchi;
  };

  public create(): void {
    // Add layout
    const bg = this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2, BG).setDisplaySize(getGameWidth(this), getGameHeight(this));
    bg.setAlpha(0.5);
    this.back = this.sound.add(CLICK, { loop: false });
    this.createBackButton();

    // create the grid level
    const numRows = 6;
    const numCols = 6;
    const padGrid = 1;
    const gridSize = getGameWidth(this)/(numRows + padGrid*2);
    const mainGridX = gridSize;
    const mainGridY = 3*gridSize;
    this.gridSize = gridSize;

    // Add a player to display at bottom of screen
    this.player = new Player({
      scene: this,
      x: getGameWidth(this)*0.5,
      y: (getGameHeight(this) + mainGridY + this.gridSize*numRows) / 2,
      key: this.selectedGotchi?.spritesheetKey || '',
      width: getGameWidth(this) * 0.25,
      height: getGameWidth(this) * 0.25,
      gotchi: this.selectedGotchi,
    }).setOrigin(0.5,0.5);

    this.gridLevel = new GridLevel({
      scene: this,
      x: mainGridX,
      y: mainGridY,
      gridSize: gridSize,
      numberRows: numRows,
      numberCols: numCols,
      player: this.player,
    });

    this.gridLevel.generateLevel(6, 2, 1, 3);

    this.inputHandler = new InputHandler({
      scene: this,
      gridLevel: this.gridLevel,
      player: this.player,
    })
    

  }

  private createBackButton = () => {
    this.add
      .image(getRelative(54, this), getRelative(54, this), LEFT_CHEVRON)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(getRelative(94, this), getRelative(94, this))
      .on('pointerdown', () => {
        this.back?.play();
        window.history.back();
      });
  };

  public update(): void {
    // Every frame, we update the player
    this.player?.update();

    this.inputHandler?.update();
  }
}
