import { BLACK_CIRCLE_SHADED, BLUE_CIRCLE_SHADED, BONUS_ICON, GREEN_CIRCLE_SHADED, M67_GRENADE, MILKSHAKE, MOVE_ICON, PINK_CIRCLE_SHADED, PORTAL_OPEN, QUESTION_MARK_ICON, RED_CIRCLE_SHADED, ROTATE_ICON, SHUFFLE_ICON, UNCOMMON_CACTI } from "game/assets";
import { getGameHeight, getGameWidth } from "game/helpers";
import { DEPTH_PLAYER, DEPTH_PLAYER_ICONS } from "game/helpers/constants";
import { AavegotchiGameObject } from "types";
import { AarcIcon, WorldMap } from ".";

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  key: string;
  world: WorldMap;
  frame?: number;
  width: number;
  height: number;
  gotchi?: AavegotchiGameObject | undefined;
}

interface stat {
  startMin: number,
  current: number,
  startMax: number,
}

const INTERACT_PINK_MIN = 10;       const MOVE_PINK_MIN = 10; 
const INTERACT_PINK_MAX = 20;       const MOVE_PINK_MAX = 20;
         
const INTERACT_RED_MIN = 1;         const MOVE_RED_MIN = 2;
const INTERACT_RED_MAX = 5;         const MOVE_RED_MAX = 10;
           
const INTERACT_BLUE_MIN = 1;        const MOVE_BLUE_MIN = 2;  
const INTERACT_BLUE_MAX = 5;        const MOVE_BLUE_MAX = 10;

const INTERACT_GREEN_MIN = 1;       const MOVE_GREEN_MIN = 2; 
const INTERACT_GREEN_MAX = 5;       const MOVE_GREEN_MAX = 10; 

export class Player extends Phaser.GameObjects.Sprite {
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  public speed = 200;

  public interactPinkStat = { startMin: INTERACT_PINK_MIN, current: 1, startMax: INTERACT_PINK_MAX};
  public movePinkStat = { startMin: MOVE_PINK_MIN, current: 1, startMax: MOVE_PINK_MAX};

  public interactRedStat = { startMin: INTERACT_RED_MIN, current: 1, startMax: INTERACT_RED_MAX};
  public moveRedStat = { startMin: MOVE_RED_MIN, current: 1, startMax: MOVE_RED_MAX};

  public interactBlueStat = { startMin: INTERACT_BLUE_MIN, current: 1, startMax: INTERACT_BLUE_MAX};
  public moveBlueStat = { startMin: MOVE_BLUE_MIN, current: 1, startMax: MOVE_BLUE_MAX};

  public interactGreenStat = { startMin: INTERACT_GREEN_MIN, current: 1, startMax: INTERACT_GREEN_MAX};
  public moveGreenStat = { startMin: MOVE_GREEN_MIN, current: 1, startMax: MOVE_GREEN_MAX};

  // declare all our icons
  public interactPinkIcon;
  public movePinkIcon;

  public interactRedIcon;
  public moveRedIcon;

  public interactBlueIcon;
  public moveBlueIcon;

  public interactGreenIcon;
  public moveGreenIcon;

  public gotchi;

  // store some variables for when we leave the map toplay the level
  private playerSavedPos = new Phaser.Math.Vector2(0,0);
  private playerSavedScaleX = 1;
  private playerSavedScaleY= 1;
  private world;

  // levelNumber variable stores what level our gotchi is on (starts on a non valid level)
  private levelNumber = 0;

  // direction variable
  private direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';

  constructor({ scene, x, y, key, world, width, height, gotchi }: Props) {
    super(scene, x, y, key);

    this.gotchi = gotchi;
    this.world = world;

    // sprite
    this.setOrigin(0, 0);

    // init stats
    this.initStats();

    // a basic nothing anim
    this.anims.create({
      key: 'still',
      frames: this.anims.generateFrameNumbers(key || '', { start: 0, end: 0 }),
    })

    // Add animations
    this.anims.create({
      key: 'front',
      frames: this.anims.generateFrameNumbers(key || '', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1,
    });

    // side views!!!
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 2 ]}),
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 4 ]}),
    });
    this.anims.create({
      key: 'back',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 6 ]}),
    });

    this.anims.play('front');

    // physics
    this.scene.physics.world.enable(this);

    this.setDepth(DEPTH_PLAYER);

    // input
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
    this.scene.add.existing(this);
    this.setDisplaySize(width, height);
    const iconRadius = this.displayHeight * 0.2;

    // create our icons
    this.interactPinkIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: PINK_CIRCLE_SHADED,
      keyIcon: QUESTION_MARK_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactPinkStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.movePinkIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: PINK_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.movePinkStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactRedIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: RED_CIRCLE_SHADED,
      keyIcon: QUESTION_MARK_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactRedStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveRedIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: RED_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.moveRedStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    

    this.interactBlueIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLUE_CIRCLE_SHADED,
      keyIcon: QUESTION_MARK_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactBlueStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveBlueIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLUE_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.moveBlueStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactGreenIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: GREEN_CIRCLE_SHADED,
      keyIcon: QUESTION_MARK_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactGreenStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveGreenIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: GREEN_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.moveGreenStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    // start off with all stats invisible
    this.setStatsVisible(false);

    
  }

  private initStats() {
    const gotchi = this.gotchi;
    // set all the stats
    if (gotchi) {
      this.interactPinkStat.current = INTERACT_PINK_MIN + Math.floor((100-gotchi.withSetsNumericTraits[0])/100*(INTERACT_PINK_MAX-INTERACT_PINK_MIN));
      this.interactRedStat.current = INTERACT_RED_MIN + Math.floor((100-gotchi.withSetsNumericTraits[0])/100*(INTERACT_RED_MAX-INTERACT_RED_MIN));
      this.interactBlueStat.current = INTERACT_BLUE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[2])/100*(INTERACT_BLUE_MAX-INTERACT_BLUE_MIN));
      this.interactGreenStat.current = INTERACT_GREEN_MIN + Math.floor((100-gotchi.withSetsNumericTraits[0])/100*(INTERACT_GREEN_MAX-INTERACT_GREEN_MIN));

      this.movePinkStat.current = MOVE_PINK_MIN + Math.floor(gotchi.withSetsNumericTraits[0]/100*(MOVE_PINK_MAX-MOVE_PINK_MIN));
      this.moveRedStat.current = MOVE_RED_MIN + Math.floor(gotchi.withSetsNumericTraits[0]/100*(MOVE_RED_MAX-MOVE_RED_MIN));
      this.moveBlueStat.current = MOVE_BLUE_MIN + Math.floor(gotchi.withSetsNumericTraits[0]/100*(MOVE_BLUE_MAX-MOVE_BLUE_MIN));
      this.moveGreenStat.current = MOVE_GREEN_MIN + Math.floor(gotchi.withSetsNumericTraits[0]/100*(MOVE_GREEN_MAX-MOVE_GREEN_MIN));
      

      if (this.interactPinkIcon && this.movePinkIcon && this.moveRedIcon && this.interactRedIcon && this.interactBlueIcon && this.moveBlueIcon && this.moveGreenIcon && this.interactGreenIcon) {
        this.interactPinkIcon.setBadge(this.interactPinkStat.current);
        this.movePinkIcon.setBadge(this.movePinkStat.current);
        this.moveRedIcon.setBadge(this.moveRedStat.current);
        this.interactRedIcon.setBadge(this.interactRedStat.current);
        this.interactBlueIcon.setBadge(this.interactBlueStat.current);
        this.moveBlueIcon.setBadge(this.moveBlueStat.current);
        this.moveGreenIcon.setBadge(this.moveGreenStat.current);
        this.interactGreenIcon.setBadge(this.interactGreenStat.current);
      }
    }
    
  }


  // setStatsVisible()
  public setStatsVisible(visible: boolean) {
    this.interactPinkIcon.setVisible(visible);
    this.movePinkIcon.setVisible(visible);
    this.interactRedIcon.setVisible(visible);
    this.moveRedIcon.setVisible(visible);
    this.interactBlueIcon.setVisible(visible);
    this.moveBlueIcon.setVisible(visible);
    this.interactGreenIcon.setVisible(visible);
    this.moveGreenIcon.setVisible(visible);

    const cam = new Phaser.Math.Vector2(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY);
    const circle = new Phaser.Geom.Circle(cam.x+getGameWidth(this.scene)*.5, cam.y+getGameHeight(this.scene), getGameWidth(this.scene)*0.36);
    const a = 1/16;
    const b = 1/32;
    this.interactPinkIcon.setPosition(circle.getPoint(0.75-b).x, circle.getPoint(0.75-b).y);
    this.movePinkIcon.setPosition(circle.getPoint(0.75+b).x, circle.getPoint(0.75+b).y);
    this.interactRedIcon.setPosition(circle.getPoint(0.75-1.5*a).x, circle.getPoint(0.75-1.5*a).y);
    this.moveRedIcon.setPosition(circle.getPoint(0.75+1.5*a).x, circle.getPoint(0.75+1.5*a).y);
    this.interactBlueIcon.setPosition(circle.getPoint(0.75-2.5*a).x, circle.getPoint(0.75-2.5*a).y);
    this.moveBlueIcon.setPosition(circle.getPoint(0.75+2.5*a).x, circle.getPoint(0.75+2.5*a).y);
    this.interactGreenIcon.setPosition(circle.getPoint(0.75-3.5*a).x, circle.getPoint(0.75+3.5*a).y);
    this.moveGreenIcon.setPosition(circle.getPoint(0.75+3.5*a).x, circle.getPoint(0.75+3.5*a).y);
  }

  // create stat adjustment
  public adjustStat(stat: 'INTERACT_GOTCHI' | 'MOVE_GOTCHI' | 'MOVE_AGGRO' | 'INTERACT_AGGRO' | 'INTERACT_PORTAL' | 'MOVE_PORTAL' | 'MOVE_BOOSTER' | 'INTERACT_BOOSTER', value: number) {
    switch (stat) {
      case 'INTERACT_GOTCHI': {
        this.interactPinkStat.current += Math.floor(value);
        this.interactPinkIcon.setBadge(this.interactPinkStat.current);
        break;
      }
      case 'MOVE_GOTCHI': {
        this.movePinkStat.current += Math.floor(value);
        this.movePinkIcon.setBadge(this.movePinkStat.current);
        break;
      }
      case 'MOVE_AGGRO': {
        this.moveRedStat.current += Math.floor(value);
        this.moveRedIcon.setBadge(this.moveRedStat.current);
        break;
      }
      case 'INTERACT_AGGRO': {
        this.interactRedStat.current += Math.floor(value);
        this.interactRedIcon.setBadge(this.interactRedStat.current);
        break;
      }
      case 'INTERACT_PORTAL': {
        this.interactBlueStat.current += Math.floor(value);
        this.interactBlueIcon.setBadge(this.interactBlueStat.current);
        break;
      }
      case 'MOVE_PORTAL': {
        this.moveBlueStat.current += Math.floor(value);
        this.moveBlueIcon.setBadge(this.moveBlueStat.current);
        break;
      }
      case 'MOVE_BOOSTER': {
        this.moveGreenStat.current += Math.floor(value);
        this.moveGreenIcon.setBadge(this.moveGreenStat.current);
        break;
      }
      case 'INTERACT_BOOSTER': {
        this.interactGreenStat.current += Math.floor(value);
        this.interactGreenIcon.setBadge(this.interactGreenStat.current);
        break;
      }
    }
  }

  public getStat(stat: 'INTERACT_GOTCHI' | 'MOVE_GOTCHI' | 'MOVE_AGGRO' | 'INTERACT_AGGRO' | 'INTERACT_PORTAL' | 'MOVE_PORTAL' | 'MOVE_BOOSTER' | 'INTERACT_BOOSTER') {
    switch (stat) {
      case 'INTERACT_GOTCHI': {
        return this.interactPinkStat.current;
        break;
      }
      case 'MOVE_GOTCHI': {
        return this.movePinkStat.current;
        break;
      }
      case 'MOVE_AGGRO': {
        return this.moveRedStat.current;
        break;
      }
      case 'INTERACT_AGGRO': {
        return this.interactRedStat.current;
        break;
      }
      case 'INTERACT_PORTAL': {
        return this.interactBlueStat.current;
        break;
      }
      case 'MOVE_PORTAL': {
        return this.moveBlueStat.current;
        break;
      }
      case 'MOVE_BOOSTER': {
        return this.moveGreenStat.current;
        break;
      }
      case 'INTERACT_BOOSTER': {
        return this.interactGreenStat.current;
        break;
      }
    }
  }

  public setDirection(direction: 'UP' | 'LEFT' | 'DOWN' | 'RIGHT') {
    this.direction = direction;

    switch (this.direction) {
      case 'UP': this.anims.play('back', true); break;
      case 'LEFT': this.anims.play('left', true); break;
      case 'RIGHT': this.anims.play('right', true); break;
      case 'DOWN': this.anims.play('front', true); break;
      default: break;
    }
  }

  public onStartLevel() {
    // save the players map position and scale
    this.playerSavedPos = new Phaser.Math.Vector2(this.x, this.y);
    this.playerSavedScaleX = this.scaleX;
    this.playerSavedScaleY = this.scaleY;

    // reset stats for new level
    this.initStats();

    // tween the player into grid level gaming mode
    this.scene.add.tween({
        targets: this,
        y: this.y + getGameHeight(this.scene),
        duration: 250,
        onComplete: () => {
            this.scene.add.tween({
                targets: this,
                x: this.scene.cameras.main.scrollX+getGameWidth(this.scene)*0.5,
                y: this.scene.cameras.main.scrollY+getGameHeight(this.scene),
                scale: getGameHeight(this.scene)*0.002,
                duration: 250,
                onComplete: () => {
                    this.anims.play('still');
                    this.setStatsVisible(true);
                },
            })
        }
    });
  }

  public onEndLevel() {
    // hide our stats
    this.setStatsVisible(false);

    // tween the player back to the saved map position
    this.scene.add.tween({
        targets: this,
        y: this.y + getGameHeight(this.scene),
        duration: 250,
        onComplete: () => {
            this.scene.add.tween({
                targets: this,
                x: this.playerSavedPos.x,
                y: this.playerSavedPos.y,
                scaleX: this.playerSavedScaleX,
                scaleY: this.playerSavedScaleY,
                duration: 250,
                onComplete: () => {
                    this.anims.play('still');
                },
            })
        }
    });
  }

  public panCameraToPlayer() {
    this.scene.add.tween({
      targets: this.scene.cameras.main,
      scrollX: this.x - getGameWidth(this.scene)*0.5,
      scrollY: this.y - getGameHeight(this.scene)*0.5,
      duration: 500,
    })
  }

  public onSelectLevel(levelNumber: number) {
    
        const selectedLevelButton = this.world.getLevelButton(levelNumber);
        const playerLevelButton = this.world.getLevelButton(this.levelNumber);

        // if player doesn't have a level we need to set it to one
        if (!playerLevelButton && selectedLevelButton) {      
            // should really change this to a smoke bomb...
            this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*1.5);

            // set the camera to the players starting position
            this.scene.cameras.main.scrollX = this.x - getGameWidth(this.scene)*0.5;
            this.scene.cameras.main.scrollY = this.y - getGameHeight(this.scene)*0.5;

        } // valid player and selected buttons so...
        else if (playerLevelButton && selectedLevelButton) {
            // if player button adjacent to selected, tween to it...
            if (playerLevelButton.isNextToButton(selectedLevelButton)) {
                const path = { t: 0, vec: new Phaser.Math.Vector2() };
                const curve = playerLevelButton.getBezierCurveLinkedTo(selectedLevelButton);

                if (curve) {
                    this.scene.tweens.add({
                        targets: path,
                        t: 1,
                        onUpdate: () => {
                            const playerX = this.x;
                            const playerY = this.y;
                            const targetX = curve?.getPoint(path.t).x;
                            const targetY = curve?.getPoint(path.t).y-playerLevelButton.displayHeight*1.5;

                            // find out which direction we're moving in most to determine gotchi orientation
                            const deltaX = targetX - playerX;
                            const deltaY = targetY - playerY;
                            // check for left/right
                            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                                deltaX > 0 ? this.setDirection('RIGHT') : this.setDirection('LEFT');
                            } else {
                                deltaY > 0 ? this.setDirection('DOWN') : this.setDirection('UP');
                            }

                            this.x = targetX;
                            this.y = targetY;
                        },
                        onComplete: () => {
                            this.setDirection('DOWN');

                            // tween camera to new position
                            this.panCameraToPlayer();
                        },
                        duration: 500,
                    });
                }
            } else {
                // should really change this to a smoke bomb...
                this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*1.5);

                // tween camera to new position
                this.panCameraToPlayer();
            }

        }

        this.levelNumber = levelNumber;

        // last thing to do is tween the camera to centre on our player

  }

  update(): void {
    // do nothing
  }
}
