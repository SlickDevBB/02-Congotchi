import {
  LEFT_CHEVRON, BG, CLICK, ARROW_DOWN, GUI_BUTTON_CROSS,
} from 'game/assets';
import { AavegotchiGameObject } from 'types';
import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GridLevel, Player, WorldMap } from 'game/objects';

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
  private worldMap?: WorldMap;
  private backButton?: Phaser.GameObjects.Image;
  private backSound?: Phaser.Sound.BaseSound;

  constructor() {
    super(sceneConfig);
  }

  init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
    this.selectedGotchi = data.selectedGotchi;
  };

  public create(): void {

    // create our player
    this.player = new Player({
      scene: this,
      x: getGameWidth(this)*0.25,
      y: getGameHeight(this)*0.87,
      key: this.selectedGotchi?.spritesheetKey || '',
      width: getGameWidth(this) * 0.2,
      height: getGameWidth(this) * 0.2,
      gotchi: this.selectedGotchi,
    })
      .setOrigin(0.5,0.5)
      .setDepth(10);

    // create the world map
    this.worldMap = new WorldMap({
      scene: this,
      x: 0,
      y: 0,
      key: BG,
      player: this.player,
    }).setDepth(0);

    // create the back button
    this.backSound = this.sound.add(CLICK, { loop: false });
    this.createBackButton();

  }

  private createBackButton = () => {
    this.backButton = this.add
      .sprite(getGameWidth(this)-getGameWidth(this)*0.05, getGameWidth(this)*0.05, GUI_BUTTON_CROSS)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(getGameWidth(this)*0.1, getGameWidth(this)*0.1)
      .on('pointerdown', () => {
        this.backSound?.play();
        window.history.back();
      })
      .setScrollFactor(0);
  };

  update(): void {
    // Every frame, we update the player
    this.player?.update();

    this.worldMap?.update();

    this.backButton?.update();

  }

}
