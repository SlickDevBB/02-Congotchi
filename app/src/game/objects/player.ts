import { BLACK_CIRCLE_SHADED, BONUS_ICON, M67_GRENADE, MILKSHAKE, MOVE_ICON, PORTAL_OPEN, ROTATE_ICON, SHUFFLE_ICON, UNCOMMON_CACTI } from "game/assets";
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

const ROTATE_MIN = 5;     const ROTATE_MAX = 10;
const MOVE_MIN = 5;       const MOVE_MAX = 10;
const GRENADE_MIN = 1;    const GRENADE_MAX = 3;
const CACTI_MIN = 1;      const CACTI_MAX = 3;
const MILKSHAKE_MIN = 1;  const MILKSHAKE_MAX = 3;
const PORTAL_MIN = 2;     const PORTAL_MAX = 5;
const RESHUFFLE_MIN = 1;  const RESHUFFLE_MAX = 3;
const BONUS_MIN = 0;      const BONUS_MAX = 3; 

export class Player extends Phaser.GameObjects.Sprite {
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  public speed = 200;

  public interactGotchiStat = { startMin: ROTATE_MIN, current: 1, startMax: ROTATE_MAX};
  public moveGotchiStat = { startMin: MOVE_MIN, current: 1, startMax: MOVE_MAX};

  public moveAggroStat = { startMin: GRENADE_MIN, current: 1, startMax: GRENADE_MAX};
  public interactAggroStat = { startMin: CACTI_MIN, current: 1, startMax: CACTI_MAX};

  public interactPortalStat = { startMin: MILKSHAKE_MIN, current: 1, startMax: MILKSHAKE_MAX};
  public movePortalStat = { startMin: PORTAL_MIN, current: 1, startMax: PORTAL_MAX};

  public moveBoosterStat = { startMin: RESHUFFLE_MIN, current: 1, startMax: RESHUFFLE_MAX};
  public interactBoosterStat = { startMin: BONUS_MIN, current: 1, startMax: BONUS_MAX};

  // declare all our icons
  public interactGotchiIcon;
  public moveGotchiIcon;

  public moveAggroIcon;
  public interactAggroIcon;

  public interactPortalIcon;
  public movePortalIcon;

  public moveBoosterIcon;
  public interactBoosterIcon;

  public gotchi;

  // store some variables for when we leave the map toplay the level
  private playerSavedPos = new Phaser.Math.Vector2(0,0);
  private playerSavedScaleX = 1;
  private playerSavedScaleY= 1;
  private world;

  // levelNumber variable stores what level our gotchi is on
  private levelNumber = 1;

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
    this.interactGotchiIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: ROTATE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactGotchiStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveGotchiIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.moveGotchiStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveAggroIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: M67_GRENADE,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.moveAggroStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactAggroIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: UNCOMMON_CACTI,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactAggroStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactPortalIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: MILKSHAKE,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactPortalStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.movePortalIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: PORTAL_OPEN,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.movePortalStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveBoosterIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: SHUFFLE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.moveBoosterStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.interactBoosterIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: BONUS_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.interactBoosterStat?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    // start off with all stats invisible
    this.setStatsVisible(false);
  }

  private initStats() {
    const gotchi = this.gotchi;
    // set all the stats
    if (gotchi) {
      this.interactGotchiStat.current = ROTATE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[0])/100*(ROTATE_MAX-ROTATE_MIN));
      this.moveGotchiStat.current = MOVE_MIN + Math.floor(gotchi.withSetsNumericTraits[0]/100*(MOVE_MAX-MOVE_MIN));
      this.moveAggroStat.current = GRENADE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[1])/100*(GRENADE_MAX-GRENADE_MIN));
      this.interactAggroStat.current = CACTI_MIN + Math.floor(gotchi.withSetsNumericTraits[1]/100*(CACTI_MAX-CACTI_MIN));
      this.interactPortalStat.current = MILKSHAKE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[2])/100*(MILKSHAKE_MAX-MILKSHAKE_MIN));
      this.movePortalStat.current = PORTAL_MIN + Math.floor(gotchi.withSetsNumericTraits[2]/100*(PORTAL_MAX-PORTAL_MIN));
      this.moveBoosterStat.current = RESHUFFLE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[3])/100*(RESHUFFLE_MAX-RESHUFFLE_MIN));
      this.interactBoosterStat.current = BONUS_MIN + Math.floor(gotchi.withSetsNumericTraits[3]/100*(BONUS_MAX-BONUS_MIN));

      if (this.interactGotchiIcon && this.moveGotchiIcon && this.moveAggroIcon && this.interactAggroIcon && this.interactPortalIcon && this.movePortalIcon && this.moveBoosterIcon && this.interactBoosterIcon) {
        this.interactGotchiIcon.setBadge(this.interactGotchiStat.current);
        this.moveGotchiIcon.setBadge(this.moveGotchiStat.current);
        this.moveAggroIcon.setBadge(this.moveAggroStat.current);
        this.interactAggroIcon.setBadge(this.interactAggroStat.current);
        this.interactPortalIcon.setBadge(this.interactPortalStat.current);
        this.movePortalIcon.setBadge(this.movePortalStat.current);
        this.moveBoosterIcon.setBadge(this.moveBoosterStat.current);
        this.interactBoosterIcon.setBadge(this.interactBoosterStat.current);
      }
    }
    
  }


  // setStatsVisible()
  public setStatsVisible(visible: boolean) {
    this.interactGotchiIcon.setVisible(visible);
    this.moveGotchiIcon.setVisible(visible);
    this.moveAggroIcon.setVisible(visible);
    this.interactAggroIcon.setVisible(visible);
    this.interactPortalIcon.setVisible(visible);
    this.movePortalIcon.setVisible(visible);
    this.moveBoosterIcon.setVisible(visible);
    this.interactBoosterIcon.setVisible(visible);

    const cam = new Phaser.Math.Vector2(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY);
    const circle = new Phaser.Geom.Circle(cam.x+getGameWidth(this.scene)*.5, cam.y+getGameHeight(this.scene), getGameWidth(this.scene)*0.36);
    const a = 1/16;
    const b = 1/32;
    this.interactGotchiIcon.setPosition(circle.getPoint(0.75-b).x, circle.getPoint(0.75-b).y);
    this.moveGotchiIcon.setPosition(circle.getPoint(0.75+b).x, circle.getPoint(0.75+b).y);
    this.moveAggroIcon.setPosition(circle.getPoint(0.75-1.5*a).x, circle.getPoint(0.75-1.5*a).y);
    this.interactAggroIcon.setPosition(circle.getPoint(0.75+1.5*a).x, circle.getPoint(0.75+1.5*a).y);
    this.interactPortalIcon.setPosition(circle.getPoint(0.75-2.5*a).x, circle.getPoint(0.75-2.5*a).y);
    this.movePortalIcon.setPosition(circle.getPoint(0.75+2.5*a).x, circle.getPoint(0.75+2.5*a).y);
    this.moveBoosterIcon.setPosition(circle.getPoint(0.75-3.5*a).x, circle.getPoint(0.75+3.5*a).y);
    this.interactBoosterIcon.setPosition(circle.getPoint(0.75+3.5*a).x, circle.getPoint(0.75+3.5*a).y);
  }

  // create stat adjustment
  public adjustStat(stat: 'INTERACT_GOTCHI' | 'MOVE_GOTCHI' | 'MOVE_AGGRO' | 'INTERACT_AGGRO' | 'INTERACT_PORTAL' | 'MOVE_PORTAL' | 'MOVE_BOOSTER' | 'INTERACT_BOOSTER', value: number) {
    switch (stat) {
      case 'INTERACT_GOTCHI': {
        this.interactGotchiStat.current += Math.floor(value);
        this.interactGotchiIcon.setBadge(this.interactGotchiStat.current);
        break;
      }
      case 'MOVE_GOTCHI': {
        this.moveGotchiStat.current += Math.floor(value);
        this.moveGotchiIcon.setBadge(this.moveGotchiStat.current);
        break;
      }
      case 'MOVE_AGGRO': {
        this.moveAggroStat.current += Math.floor(value);
        this.moveAggroIcon.setBadge(this.moveAggroStat.current);
        break;
      }
      case 'INTERACT_AGGRO': {
        this.interactAggroStat.current += Math.floor(value);
        this.interactAggroIcon.setBadge(this.interactAggroStat.current);
        break;
      }
      case 'INTERACT_PORTAL': {
        this.interactPortalStat.current += Math.floor(value);
        this.interactPortalIcon.setBadge(this.interactPortalStat.current);
        break;
      }
      case 'MOVE_PORTAL': {
        this.movePortalStat.current += Math.floor(value);
        this.movePortalIcon.setBadge(this.movePortalStat.current);
        break;
      }
      case 'MOVE_BOOSTER': {
        this.moveBoosterStat.current += Math.floor(value);
        this.moveBoosterIcon.setBadge(this.moveBoosterStat.current);
        break;
      }
      case 'INTERACT_BOOSTER': {
        this.interactBoosterStat.current += Math.floor(value);
        this.interactBoosterIcon.setBadge(this.interactBoosterStat.current);
        break;
      }
    }
  }

  public getStat(stat: 'INTERACT_GOTCHI' | 'MOVE_GOTCHI' | 'MOVE_AGGRO' | 'INTERACT_AGGRO' | 'INTERACT_PORTAL' | 'MOVE_PORTAL' | 'MOVE_BOOSTER' | 'INTERACT_BOOSTER') {
    switch (stat) {
      case 'INTERACT_GOTCHI': {
        return this.interactGotchiStat.current;
        break;
      }
      case 'MOVE_GOTCHI': {
        return this.moveGotchiStat.current;
        break;
      }
      case 'MOVE_AGGRO': {
        return this.moveAggroStat.current;
        break;
      }
      case 'INTERACT_AGGRO': {
        return this.interactAggroStat.current;
        break;
      }
      case 'INTERACT_PORTAL': {
        return this.interactPortalStat.current;
        break;
      }
      case 'MOVE_PORTAL': {
        return this.movePortalStat.current;
        break;
      }
      case 'MOVE_BOOSTER': {
        return this.moveBoosterStat.current;
        break;
      }
      case 'INTERACT_BOOSTER': {
        return this.interactBoosterStat.current;
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

  public onSelectLevel(levelNumber: number) {
    
        const selectedLevelButton = this.world.getLevelButton(levelNumber);
        const playerLevelButton = this.world.getLevelButton(this.levelNumber);

        // if player doesn't have a level we need to set it to one
        if (!playerLevelButton && selectedLevelButton) {      
            // should really change this to a smoke bomb...
            this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*1.5);
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
                        },
                        duration: 500,
                    });
                }
            } else {
                // should really change this to a smoke bomb...
                this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*1.5);
            }

        }

        this.levelNumber = levelNumber;

  }

  update(): void {
    // do nothing
  }
}
