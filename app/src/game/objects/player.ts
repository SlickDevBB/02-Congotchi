import { BLACK_CIRCLE_SHADED, BLUE_CIRCLE_SHADED, GREEN_CIRCLE_SHADED, GREY_CIRCLE_SHADED, M67_GRENADE, MILKSHAKE, MOVE_ICON, PINK_CIRCLE_SHADED, PORTAL_OPEN, QUESTION_MARK_ICON, RED_CIRCLE_SHADED, UNCOMMON_CACTI } from "game/assets";
import { getGameHeight, getGameWidth } from "game/helpers";
import { DEPTH_PLAYER, DEPTH_PLAYER_ICONS } from "game/helpers/constants";
import { calcStats, Stats } from "helpers/stats";
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

export class Player extends Phaser.GameObjects.Sprite {
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  public speed = 200;

  // object for current stats
  public currentStats?: Stats;

  // declare all our icons
  public interactPinkIcon;
  public movePinkIcon;

  public interactRedIcon;
  public moveRedIcon;

  public interactBlueIcon;
  public moveBlueIcon;

  public interactGreenIcon;
  public moveGreenIcon;

  public interactIcon;
  public moveIcon;

  public gotchi;

  // store some variables for when we leave the map toplay the level
  private playerSavedPos = new Phaser.Math.Vector2(0,0);
  private playerSavedScaleX = 1;
  private playerSavedScaleY= 1;
  private world;
  private levelNumber = 1;

  // direction variable
  private direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';

  constructor({ scene, x, y, key, world, width, height, gotchi }: Props) {
    super(scene, x, y, key);

    this.gotchi = gotchi;
    this.world = world;

    // sprite
    this.setOrigin(0.5, 0.5);

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

    // create the question mark and move icon
    this.interactIcon = new AarcIcon ({
      scene: this.scene,
      x: 0,//this.x - this.displayWidth*.5,
      y: 0,//this.y - iconRadius*4,
      keyBg: GREY_CIRCLE_SHADED,
      keyIcon: QUESTION_MARK_ICON,
      radius: iconRadius*1.5,
      useBadge: false,
      numBadge: 0,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveIcon = new AarcIcon ({
      scene: this.scene,
      x: 0,//this.x - this.displayWidth*.5,
      y: 0,//this.y - iconRadius*4,
      keyBg: GREY_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius*1.5,
      useBadge: false,
      numBadge: 0,
    }).setDepth(DEPTH_PLAYER_ICONS);


    // create our icons
    this.interactPinkIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: PINK_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.interactPink,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.movePinkIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: PINK_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.movePink,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactRedIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: RED_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.interactRed,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveRedIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: RED_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.moveRed,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactBlueIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLUE_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.interactBlue,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveBlueIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLUE_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.moveBlue,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactGreenIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: GREEN_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.interactGreen,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveGreenIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: GREEN_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.moveGreen,
    }).setDepth(DEPTH_PLAYER_ICONS);

    // start off with all stats invisible
    this.setStatsVisible(false);

  }

  private initStats() {
    const gotchi = this.gotchi;
    // set all the stats
    if (gotchi) {
      // calc the gotchis base stats
      this.currentStats = calcStats(gotchi.withSetsNumericTraits[0],
        gotchi.withSetsNumericTraits[1],
        gotchi.withSetsNumericTraits[2],
        gotchi.withSetsNumericTraits[3]);
      
      // set badge numbers for all icons
      if (this.interactPinkIcon && this.movePinkIcon && this.moveRedIcon && this.interactRedIcon && this.interactBlueIcon && this.moveBlueIcon && this.moveGreenIcon && this.interactGreenIcon) {
        this.interactPinkIcon.setBadge(this.currentStats.interactPink);
        this.movePinkIcon.setBadge(this.currentStats.movePink);

        this.interactRedIcon.setBadge(this.currentStats.interactRed);
        this.moveRedIcon.setBadge(this.currentStats.moveRed);
        
        this.interactGreenIcon.setBadge(this.currentStats.interactGreen);
        this.moveGreenIcon.setBadge(this.currentStats.moveGreen);

        this.interactBlueIcon.setBadge(this.currentStats.interactBlue);
        this.moveBlueIcon.setBadge(this.currentStats.moveBlue);
      }
    }
    
  }


  // setStatsVisible()
  public setStatsVisible(visible: boolean) {
    this.interactIcon.setVisible(visible);
    this.moveIcon.setVisible(visible);
    this.interactPinkIcon.setVisible(visible);
    this.movePinkIcon.setVisible(visible);
    this.interactRedIcon.setVisible(visible);
    this.moveRedIcon.setVisible(visible);
    this.interactBlueIcon.setVisible(visible);
    this.moveBlueIcon.setVisible(visible);
    this.interactGreenIcon.setVisible(visible);
    this.moveGreenIcon.setVisible(visible);

    // get the camera current position
    const camPos = new Phaser.Math.Vector2(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY);
    const leftPos = new Phaser.Math.Vector2(camPos.x + getGameWidth(this.scene)*0.2, camPos.y + getGameHeight(this.scene)*0.9);
    const rightPos = new Phaser.Math.Vector2(camPos.x + getGameWidth(this.scene)*0.8, camPos.y + getGameHeight(this.scene)*0.9);
    const OFFSET = getGameHeight(this.scene)*.05;

    // setup two sides of icons
    this.interactIcon.setPosition(leftPos.x, leftPos.y);
    this.interactPinkIcon.setPosition(leftPos.x, leftPos.y - OFFSET);
    this.interactRedIcon.setPosition(leftPos.x - OFFSET, leftPos.y);
    this.interactBlueIcon.setPosition(leftPos.x, leftPos.y + OFFSET);
    this.interactGreenIcon.setPosition(leftPos.x + OFFSET, leftPos.y);

    this.moveIcon.setPosition(rightPos.x, rightPos.y);
    this.movePinkIcon.setPosition(rightPos.x, rightPos.y - OFFSET);
    this.moveRedIcon.setPosition(rightPos.x - OFFSET, rightPos.y);
    this.moveBlueIcon.setPosition(rightPos.x, rightPos.y + OFFSET);
    this.moveGreenIcon.setPosition(rightPos.x + OFFSET, rightPos.y);
  }

  // create stat adjustment
  public adjustStat(stat: 'INTERACT_PINK' | 'MOVE_PINK' | 'MOVE_RED' | 'INTERACT_RED' | 
  'INTERACT_BLUE' | 'MOVE_BLUE' | 'MOVE_GREEN' | 'INTERACT_GREEN', value: number) {
    if (this.currentStats) {
      switch (stat) {
        case 'INTERACT_PINK': {
          this.currentStats.interactPink += Math.floor(value);
          this.interactPinkIcon.setBadge(this.currentStats.interactPink);
          break;
        }
        case 'MOVE_PINK': {
          this.currentStats.movePink += Math.floor(value);
          this.movePinkIcon.setBadge(this.currentStats.movePink);
          break;
        }
        case 'MOVE_RED': {
          this.currentStats.moveRed += Math.floor(value);
          this.moveRedIcon.setBadge(this.currentStats.moveRed);
          break;
        }
        case 'INTERACT_RED': {
          this.currentStats.interactRed += Math.floor(value);
          this.interactRedIcon.setBadge(this.currentStats.interactRed);
          break;
        }
        case 'INTERACT_BLUE': {
          this.currentStats.interactBlue += Math.floor(value);
          this.interactBlueIcon.setBadge(this.currentStats.interactBlue);
          break;
        }
        case 'MOVE_BLUE': {
          this.currentStats.moveBlue += Math.floor(value);
          this.moveBlueIcon.setBadge(this.currentStats.moveBlue);
          break;
        }
        case 'MOVE_GREEN': {
          this.currentStats.moveGreen += Math.floor(value);
          this.moveGreenIcon.setBadge(this.currentStats.moveGreen);
          break;
        }
        case 'INTERACT_GREEN': {
          this.currentStats.interactGreen += Math.floor(value);
          this.interactGreenIcon.setBadge(this.currentStats.interactGreen);
          break;
        }
      }
    }
  }

  public getStat(stat: 'INTERACT_PINK' | 'MOVE_PINK' | 'MOVE_RED' | 'INTERACT_RED' | 
  'INTERACT_BLUE' | 'MOVE_BLUE' | 'MOVE_GREEN' | 'INTERACT_GREEN'): number {
    if (this.currentStats) {
      switch (stat) {
        case 'INTERACT_PINK': {
          return this.currentStats?.interactPink;
          break;
        }
        case 'MOVE_PINK': {
          return this.currentStats?.movePink;
          break;
        }
        case 'MOVE_RED': {
          return this.currentStats?.moveRed;
          break;
        }
        case 'INTERACT_RED': {
          return this.currentStats?.interactRed;
          break;
        }
        case 'INTERACT_BLUE': {
          return this.currentStats?.interactBlue;
          break;
        }
        case 'MOVE_BLUE': {
          return this.currentStats?.moveBlue;
          break;
        }
        case 'MOVE_GREEN': {
          return this.currentStats?.moveGreen;
          break;
        }
        case 'INTERACT_GREEN': {
          return this.currentStats?.interactGreen;
          break;
        }
      }
    } else {
      return 0;
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
                    this.anims.play('front');
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

        const OFFSET = 1.75

        // if player doesn't have a level we need to set it to one
        if (!playerLevelButton && selectedLevelButton) {      
            // should really change this to a smoke bomb...
            this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*OFFSET);

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
                            const targetY = curve?.getPoint(path.t).y-playerLevelButton.displayHeight*OFFSET;

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
                this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*OFFSET);

                // tween camera to new position
                this.panCameraToPlayer();
            }

        }

        this.levelNumber = levelNumber;
  }

  update(): void {
    // do nothing
  }
}
