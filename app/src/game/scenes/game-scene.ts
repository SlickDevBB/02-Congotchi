import {
  LEFT_CHEVRON, BG, CLICK, ARROW_DOWN, GUI_BUTTON_CROSS,
} from 'game/assets';
import { AavegotchiGameObject } from 'types';
import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GridLevel, Gui, Player, WorldMap, levels } from 'game/objects';

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
  private gui?: Gui;
  private gridLevel?: GridLevel;
  private selectedLevel = 1;

  constructor() {
    super(sceneConfig);
  }

  init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
    this.selectedGotchi = data.selectedGotchi;
  };

  public create(): void {
    

    // create the world map
    this.worldMap = new WorldMap({
      scene: this,
      x: 0,
      y: 0,
      key: BG,
    }).setDepth(0);

    // create our player
    this.player = new Player({
      scene: this,
      x: getGameWidth(this)*0.25,
      y: getGameHeight(this)*0.87,
      key: this.selectedGotchi?.spritesheetKey || '',
      world: this.worldMap,
      width: getGameWidth(this) * 0.2,
      height: getGameWidth(this) * 0.2,
      gotchi: this.selectedGotchi,
    })
      .setOrigin(0.5,0.5)
      .setDepth(10);

    // create the gui
    this.gui = new Gui({
      scene: this, 
      player: this.player, 
      world: this.worldMap,
    });

    // start off by selecting level 1
    // when we get round to it, will start on whatever level a player finished
    // on last time they played (will be stored on server against their address)
    this.selectLevel(1);

  }

  public selectLevel(levelNumber: number) {
    // set our current level number
    this.selectedLevel = levelNumber;

    // call onSelectLevel 'callbacks' for all our objects
    this.player?.onSelectLevel(levelNumber);
    this.worldMap?.onSelectLevel(levelNumber);
    this.gui?.onSelectLevel(levelNumber);
  }

  public startLevel() {
    // create the grid level
    if (this.player) {
      this.gridLevel = new GridLevel({
        scene: this,
        player: this.player,
        levelConfig: levels[this.selectedLevel - 1],
        // x: this.cameras.main.scrollX,
        // y: this.cameras.main.scrollY,
      })  
    }

    // call startLevel() for all our objects
    this.player?.onStartLevel();
    this.worldMap?.onStartLevel();
    this.gui?.onStartLevel();
  }

  public endLevel() {
    // destroy the grid level object
    this.gridLevel?.onEndLevel();

    // call endLevel() for all our objects
    this.player?.onEndLevel();
    this.worldMap?.onEndLevel();
    this.gui?.onEndLevel();
  }

  public getPlayer() {
    return this.player;
  }

  update(): void {
    // update all our objects
    this.gridLevel?.update();
    this.player?.update();
    this.worldMap?.update();
    this.gui?.update();
  }

}
