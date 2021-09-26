import { BLACK_CIRCLE_SHADED, BONUS_ICON, M67_GRENADE, MILKSHAKE, MOVE_ICON, PORTAL_OPEN, ROTATE_ICON, SHUFFLE_ICON, UNCOMMON_CACTI } from "game/assets";
import { getGameHeight, getGameWidth } from "game/helpers";
import { DEPTH_PLAYER_ICONS } from "game/helpers/constants";
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

  public rotate = { startMin: ROTATE_MIN, current: 1, startMax: ROTATE_MAX};
  public move = { startMin: MOVE_MIN, current: 1, startMax: MOVE_MAX};
  public grenade = { startMin: GRENADE_MIN, current: 1, startMax: GRENADE_MAX};
  public cacti = { startMin: CACTI_MIN, current: 1, startMax: CACTI_MAX};
  public milkshake = { startMin: MILKSHAKE_MIN, current: 1, startMax: MILKSHAKE_MAX};
  public portal = { startMin: PORTAL_MIN, current: 1, startMax: PORTAL_MAX};
  public reshuffle = { startMin: RESHUFFLE_MIN, current: 1, startMax: RESHUFFLE_MAX};
  public bonus = { startMin: BONUS_MIN, current: 1, startMax: BONUS_MAX};

  // declare all our icons
  public rotateIcon;
  public moveIcon;
  public grenadeIcon;
  public cactiIcon;
  public milkshakeIcon;
  public portalIcon;
  public reshuffleIcon;
  public bonusIcon;
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

    // input
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
    this.scene.add.existing(this);
    this.setDisplaySize(width, height);
    const iconRadius = this.displayHeight * 0.2;

    // create our icons
    this.rotateIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: ROTATE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.rotate?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.moveIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y - iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: MOVE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.move?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.grenadeIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: M67_GRENADE,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.grenade?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.cactiIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y - iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: UNCOMMON_CACTI,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.cacti?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.milkshakeIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: MILKSHAKE,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.milkshake?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.portalIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth,
      y: this.y + iconRadius*1.33,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: PORTAL_OPEN,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.portal?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.reshuffleIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x - this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: SHUFFLE_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.reshuffle?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    this.bonusIcon = new AarcIcon ({
      scene: this.scene,
      x: this.x + this.displayWidth*.5,
      y: this.y + iconRadius*4,
      keyBg: BLACK_CIRCLE_SHADED,
      keyIcon: BONUS_ICON,
      radius: iconRadius,
      useBadge: true,
      numBadge: this.bonus?.current,
    }).setDepth(DEPTH_PLAYER_ICONS);

    // start off with all stats invisible
    this.setStatsVisible(false);
  }

  private initStats() {
    const gotchi = this.gotchi;
    // set all the stats
    if (gotchi) {
      this.rotate.current = ROTATE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[0])/100*(ROTATE_MAX-ROTATE_MIN));
      this.move.current = MOVE_MIN + Math.floor(gotchi.withSetsNumericTraits[0]/100*(MOVE_MAX-MOVE_MIN));
      this.grenade.current = GRENADE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[1])/100*(GRENADE_MAX-GRENADE_MIN));
      this.cacti.current = CACTI_MIN + Math.floor(gotchi.withSetsNumericTraits[1]/100*(CACTI_MAX-CACTI_MIN));
      this.milkshake.current = MILKSHAKE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[2])/100*(MILKSHAKE_MAX-MILKSHAKE_MIN));
      this.portal.current = PORTAL_MIN + Math.floor(gotchi.withSetsNumericTraits[2]/100*(PORTAL_MAX-PORTAL_MIN));
      this.reshuffle.current = RESHUFFLE_MIN + Math.floor((100-gotchi.withSetsNumericTraits[3])/100*(RESHUFFLE_MAX-RESHUFFLE_MIN));
      this.bonus.current = BONUS_MIN + Math.floor(gotchi.withSetsNumericTraits[3]/100*(BONUS_MAX-BONUS_MIN));

      if (this.rotateIcon && this.moveIcon && this.grenadeIcon && this.cactiIcon && this.milkshakeIcon && this.portalIcon && this.reshuffleIcon && this.bonusIcon) {
        this.rotateIcon.setBadge(this.rotate.current);
        this.moveIcon.setBadge(this.move.current);
        this.grenadeIcon.setBadge(this.grenade.current);
        this.cactiIcon.setBadge(this.cacti.current);
        this.milkshakeIcon.setBadge(this.milkshake.current);
        this.portalIcon.setBadge(this.portal.current);
        this.reshuffleIcon.setBadge(this.reshuffle.current);
        this.bonusIcon.setBadge(this.bonus.current);
      }
    }
    
  }


  // setStatsVisible()
  public setStatsVisible(visible: boolean) {
    this.rotateIcon.setVisible(visible);
    this.moveIcon.setVisible(visible);
    this.grenadeIcon.setVisible(visible);
    this.cactiIcon.setVisible(visible);
    this.milkshakeIcon.setVisible(visible);
    this.portalIcon.setVisible(visible);
    this.reshuffleIcon.setVisible(visible);
    this.bonusIcon.setVisible(visible);

    const cam = new Phaser.Math.Vector2(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY);
    const circle = new Phaser.Geom.Circle(cam.x+getGameWidth(this.scene)*.5, cam.y+getGameHeight(this.scene), getGameWidth(this.scene)*0.36);
    const a = 1/16;
    const b = 1/32;
    this.rotateIcon.setPosition(circle.getPoint(0.75-b).x, circle.getPoint(0.75-b).y);
    this.moveIcon.setPosition(circle.getPoint(0.75+b).x, circle.getPoint(0.75+b).y);
    this.grenadeIcon.setPosition(circle.getPoint(0.75-1.5*a).x, circle.getPoint(0.75-1.5*a).y);
    this.cactiIcon.setPosition(circle.getPoint(0.75+1.5*a).x, circle.getPoint(0.75+1.5*a).y);
    this.milkshakeIcon.setPosition(circle.getPoint(0.75-2.5*a).x, circle.getPoint(0.75-2.5*a).y);
    this.portalIcon.setPosition(circle.getPoint(0.75+2.5*a).x, circle.getPoint(0.75+2.5*a).y);
    this.reshuffleIcon.setPosition(circle.getPoint(0.75-3.5*a).x, circle.getPoint(0.75+3.5*a).y);
    this.bonusIcon.setPosition(circle.getPoint(0.75+3.5*a).x, circle.getPoint(0.75+3.5*a).y);
  }

  // create stat adjustment
  public adjustStat(stat: 'ROTATE' | 'MOVE' | 'GRENADE' | 'CACTI' | 'MILKSHAKE' | 'PORTAL' | 'RESHUFFLE' | 'BONUS', value: number) {
    switch (stat) {
      case 'ROTATE': {
        this.rotate.current += Math.floor(value);
        this.rotateIcon.setBadge(this.rotate.current);
        break;
      }
      case 'MOVE': {
        this.move.current += Math.floor(value);
        this.moveIcon.setBadge(this.move.current);
        break;
      }
      case 'GRENADE': {
        this.grenade.current += Math.floor(value);
        this.grenadeIcon.setBadge(this.grenade.current);
        break;
      }
      case 'CACTI': {
        this.cacti.current += Math.floor(value);
        this.cactiIcon.setBadge(this.cacti.current);
        break;
      }
      case 'MILKSHAKE': {
        this.milkshake.current += Math.floor(value);
        this.milkshakeIcon.setBadge(this.milkshake.current);
        break;
      }
      case 'PORTAL': {
        this.portal.current += Math.floor(value);
        this.portalIcon.setBadge(this.portal.current);
        break;
      }
      case 'RESHUFFLE': {
        this.reshuffle.current += Math.floor(value);
        this.reshuffleIcon.setBadge(this.reshuffle.current);
        break;
      }
      case 'BONUS': {
        this.bonus.current += Math.floor(value);
        this.bonusIcon.setBadge(this.bonus.current);
        break;
      }
    }
  }

  public getStat(stat: 'ROTATE' | 'MOVE' | 'GRENADE' | 'CACTI' | 'MILKSHAKE' | 'PORTAL' | 'RESHUFFLE' | 'BONUS') {
    switch (stat) {
      case 'ROTATE': {
        return this.rotate.current;
        break;
      }
      case 'MOVE': {
        return this.move.current;
        break;
      }
      case 'GRENADE': {
        return this.grenade.current;
        break;
      }
      case 'CACTI': {
        return this.cacti.current;
        break;
      }
      case 'MILKSHAKE': {
        return this.milkshake.current;
        break;
      }
      case 'PORTAL': {
        return this.portal.current;
        break;
      }
      case 'RESHUFFLE': {
        return this.reshuffle.current;
        break;
      }
      case 'BONUS': {
        return this.bonus.current;
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
