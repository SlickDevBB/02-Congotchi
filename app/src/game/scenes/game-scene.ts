import {
  LEFT_CHEVRON, BG, SOUND_CLICK, ARROW_DOWN, GUI_BUTTON_CROSS, MUSIC_WORLD_MAP, MUSIC_GRID_LEVEL_A, SOUND_VICTORY,
} from 'game/assets';
import { AavegotchiGameObject } from 'types';
import { getGameWidth, getGameHeight, getRelative } from '../helpers';
import { GridLevel, Gui, Player, WorldMap, levels, GridObject } from 'game/objects';
import { Socket } from 'socket.io-client';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

interface LevelScores {
  levelNumber: number,
  highScore: number,
  stars: number,
}

/**
 * Scene where gameplay takes place
 */
export class GameScene extends Phaser.Scene {
  private player?: Player;
  private selectedGotchi?: AavegotchiGameObject;
  private randomGotchis?: AavegotchiGameObject[];
  private worldMap?: WorldMap;
  private gui?: Gui;
  private gridLevel?: GridLevel;
  private socket: Socket | null = null;

  // the game scene needs the following game state variables
  public currentLevel = 1;
  public unlockedLevels = 1;
  public levelScores: Array<LevelScores> = [];

  // create a music object
  private musicWorldMap?: Phaser.Sound.HTML5AudioSound;
  private musicGridLevel?: Phaser.Sound.HTML5AudioSound;
  private soundClick?: Phaser.Sound.HTML5AudioSound;
  private soundVictory?: Phaser.Sound.HTML5AudioSound;

  constructor() {
    super(sceneConfig);
  }

  init = (data: { selectedGotchi: AavegotchiGameObject, randomGotchis: AavegotchiGameObject[] }): void => {
    this.selectedGotchi = data.selectedGotchi;
    this.randomGotchis = data.randomGotchis;
  };

  public create(): void {
    // fetch progress data
    this.socket = this.game.registry.values.socket;
    this.socket?.emit('fetchProgressData');
    this.socket?.on('fetchProgressDataResponse', (currentLevel, unlockedLevels, levelScores) => {
      // locally store previous game states from our database
      this.currentLevel = currentLevel;
      this.unlockedLevels = unlockedLevels;
      this.setLevelScores(levelScores, unlockedLevels);

      // create the world map
      this.worldMap = new WorldMap({
        scene: this,
        x: 0,
        y: 0,
        key: BG,
      }).setDepth(0)
      this.worldMap.setUnlockedLevels(unlockedLevels);

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

      // create the gui
      this.gui = new Gui({
        scene: this, 
        player: this.player, 
        world: this.worldMap,
      });

      this.selectLevel(currentLevel);


      // create a world map music object
      this.musicWorldMap = this.sound.add(MUSIC_WORLD_MAP, { loop: true, }) as Phaser.Sound.HTML5AudioSound;
      this.musicWorldMap.play();

      // create a grid level music object
      this.musicGridLevel = this.sound.add(MUSIC_GRID_LEVEL_A, { loop: true, }) as Phaser.Sound.HTML5AudioSound;

      // create sound of click
      this.soundClick = this.sound.add(SOUND_CLICK, { loop: false }) as Phaser.Sound.HTML5AudioSound;


      this.soundVictory = this.sound.add(SOUND_VICTORY, { loop: false }) as Phaser.Sound.HTML5AudioSound;
    })
  }

  public selectLevel(levelNumber: number) {
    // first check we can access the level
    if (this.worldMap && this.unlockedLevels >= levelNumber) {
      // set our current level number
      this.currentLevel = levelNumber;
      
      // call onSelectLevel 'callbacks' for all our objects
      this.player?.onSelectLevel(levelNumber);
      this.worldMap?.onSelectLevel(levelNumber);
      this.gui?.onSelectLevel(levelNumber);
    }

    // play click sound
    this.soundClick?.play();
  }

  public saveCurrentLevel() {
    this.socket?.emit('saveCurrentLevel', this.currentLevel);
  }

  public startLevel() {
    // create the grid level
    if (this.randomGotchis) {
      if (this.player) {
        this.gridLevel = new GridLevel({
          scene: this,
          player: this.player,
          randomGotchis: this.randomGotchis,
          levelConfig: levels[this.currentLevel - 1],
        })  
      }
    } else {
      alert('Random gotchis not available');
    }

    // call startLevel() for all our objects
    this.player?.onStartLevel();
    this.worldMap?.onStartLevel();
    this.gui?.onStartLevel();

    // change music
    this.musicWorldMap?.stop();
    this.musicGridLevel?.setVolume(1);
    this.musicGridLevel?.play();
  }

  public showLevelOverScreen() {
    this.soundVictory?.play();
    this.musicGridLevel?.stop();
  }

  public endLevel() {
    // destroy the grid level object
    this.gridLevel?.onEndLevel();
    delete this.gridLevel;

    // call endLevel() for all our objects
    this.player?.onEndLevel();
    this.worldMap?.onEndLevel();
    this.gui?.onEndLevel();

    // fade out grid music and fade in world map music
    this.add.tween({
      targets: this.musicGridLevel,
      volume: 0,
      duration: 1500,
      onComplete: () => {
        this.musicGridLevel?.stop();
        this.musicWorldMap?.setVolume(0);
        this.musicWorldMap?.play();
        this.add.tween({
          targets: this.musicWorldMap,
          volume: 1,
          duration: 1500,
        });
      }
    });
    
  }

  public setLevelScores(levelScores: Array<LevelScores>, unlockedLevels: number) {
    // set all levels to 0
    for (let i = 0; i < unlockedLevels; i++) {
      this.levelScores[i] = {
        levelNumber: i+1,
        highScore: 0,
        stars: 0,
      }
    }

    // go through levelscores parameter and fill in where data exists
    levelScores.map( ls => {
      this.levelScores[ls.levelNumber-1] = {
        levelNumber: ls.levelNumber,
        highScore: ls.highScore,
        stars: ls.stars,
      }
    })
  }

  public handleLevelResults(level: number, score: number, stars: number) {
    // check if we can unlock a new level
    if (level === this.unlockedLevels && stars > 0) {
      // tell the world map to enable button for next level
      this.worldMap?.setUnlockedLevels(level+1);
      this.unlockedLevels = level + 1;

      // tell database to increase number of unlocked levels for the user
      this.socket?.emit('setUnlockedLevels', level+1);

      // create a new level score locally
      this.levelScores[level] = {
        levelNumber: level+1,
        highScore: 0,
        stars: 0,
      }
    }

    // set a new high score locally if applicable
    if (score > this.levelScores[level-1].highScore) {
      this.levelScores[level-1].highScore = score;
      this.levelScores[level-1].stars = stars;
    }

    // set a new high score (if possible) in the database (high score checks handled on the server).
    this.socket?.emit("setHighScore", level, score, stars);
    
  }

  public getUnlockedLevels() {
    return this.unlockedLevels;
  }

  public getPlayer() {
    return this.player;
  }

  public getGui() {
    return this.gui;
  }

  public getGridLevel() {
    return this.gridLevel;
  }

  public returnMainMenu() {
    this.saveCurrentLevel();

    // stop all music
    this.musicWorldMap?.stop();
    this.musicGridLevel?.stop();
  }

  update(): void {
    // update all our objects
    this.gridLevel?.update();
    this.player?.update();
    this.worldMap?.update();
    this.gui?.update(); 
  }

  

}
