// player.ts - the aavegotchi player chooses to solve puzzles with

import { BLUE_CIRCLE_SHADED, GREEN_CIRCLE_SHADED, GREY_CIRCLE_SHADED, MOVE_ICON, PARTICLE_CONFETTI, PINK_CIRCLE_SHADED, QUESTION_MARK_ICON, RED_CIRCLE_SHADED, } from "game/assets";
import { getGameHeight, getGameWidth } from "game/helpers";
import { DEPTH_DEBUG_INFO, DEPTH_PLAYER, DEPTH_PLAYER_ICONS } from "game/helpers/constants";
import { GameScene } from "game/scenes/game-scene";
import { calcStats, StatPoints } from "helpers/stats";
import { AavegotchiGameObject } from "types";
import { AarcIcon, GridLevel, Gui, WorldMap } from ".";

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

interface StatMask {
  spareMove: number, congaJump: number, greenActivate: number, redDestroy: number, 
  redDamage: number, greenBuff: number, gotchiSave: number, congaStart: number
}

export class Player extends Phaser.GameObjects.Sprite {
  
  public speed = 200;

  // object for current stats
  public currentStats?: StatPoints;

  // declare all our icons
  public spareMoveIcon;
  public congaJumpIcon;

  public greenActivateIcon;
  public redDestroyIcon;

  public redDamageIcon;
  public greenBuffIcon;

  public gotchiSaveIcon;
  public congaStartIcon;

  public gotchi;

  // store some variables for when we leave the map toplay the level
  private playerSavedPos = new Phaser.Math.Vector2(0,0);
  private playerSavedScaleX = 1;
  private playerSavedScaleY= 1;
  private world;
  private levelNumber = 1;

  private cameraAutoPan = true;
  private cameraAutoPanText?: Phaser.GameObjects.Text;

  private particleStat?: Array<Phaser.GameObjects.Particles.ParticleEmitterManager> = [];
  private emitterStat?: Array<Phaser.GameObjects.Particles.ParticleEmitter> = [];

  private gui?: Gui;

  // direction variable
  private direction: 'DOWN' | 'LEFT' | 'UP' | 'RIGHT' = 'DOWN';

  // stat mask
  private statMask: StatMask = {spareMove: 0, congaJump: 0, greenActivate: 0, redDestroy: 0, 
    redDamage: 0, greenBuff: 0, gotchiSave: 0, congaStart: 0}

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
    this.scene.add.existing(this);
    this.setDisplaySize(width, height);

    // create locations for our stat icons in a nice semicircle above our gotchi
    const RADIUS = getGameWidth(this.scene) * 0.31;
    const posX = getGameWidth(this.scene) * 0.5;
    const posY = getGameHeight(this.scene);
    const iconRadius = getGameHeight(this.scene)*0.0225;

    // create our icons
    this.spareMoveIcon = new AarcIcon ({
      scene: this.scene,
      x: posX - RADIUS * Math.cos(11.25 * 1 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 1 * Math.PI / 180),
      keyBg: BLUE_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.spareMove,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    this.congaJumpIcon = new AarcIcon ({
      scene: this.scene,
      x: posX - RADIUS * Math.cos(11.25 * 3 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 3 * Math.PI / 180),
      keyBg: BLUE_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.congaJump,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    // left icon
    this.greenActivateIcon = new AarcIcon ({
      scene: this.scene,
      x: posX - RADIUS * Math.cos(11.25 * 5 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 5 * Math.PI / 180),
      keyBg: GREEN_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.greenActivate,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    this.redDestroyIcon = new AarcIcon ({
      scene: this.scene,
      x: posX - RADIUS * Math.cos(11.25 * 7 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 7 * Math.PI / 180),
      keyBg: RED_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.redDestroy,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    this.redDamageIcon = new AarcIcon ({
      scene: this.scene,
      x: posX + RADIUS * Math.cos(11.25 * 7 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 7 * Math.PI / 180),
      keyBg: RED_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.redDamage,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    this.greenBuffIcon = new AarcIcon ({
      scene: this.scene,
      x: posX + RADIUS * Math.cos(11.25 * 5 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 5 * Math.PI / 180),
      keyBg: GREEN_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.greenBuff,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    this.gotchiSaveIcon = new AarcIcon ({
      scene: this.scene,
      x: posX + RADIUS * Math.cos(11.25 * 3 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 3 * Math.PI / 180),
      keyBg: PINK_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.gotchiSave,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    this.congaStartIcon = new AarcIcon ({
      scene: this.scene,
      x: posX + RADIUS * Math.cos(11.25 * 1 * Math.PI / 180),
      y: posY - RADIUS * Math.sin(11.25 * 1 * Math.PI / 180),
      keyBg: PINK_CIRCLE_SHADED,
      keyIcon: "",
      radius: iconRadius,
      useBadge: true,
      numBadge: this.currentStats?.congaStart,
    })
    .setDepth(DEPTH_PLAYER_ICONS)
    .setScrollFactor(0);

    
    
    for (let i = 0; i < 8; i++) {

      // make some particles
      this.particleStat?.push(this.scene.add.particles(PARTICLE_CONFETTI));
      if (this.particleStat) {
        this.particleStat[i].setDepth(10000);
        const shape1 = new Phaser.Geom.Circle(0, 0, iconRadius*1.2);

        this.emitterStat?.push(this.particleStat[i].createEmitter({
          frame: { frames: [ 'red', 'green', 'blue', 'yellow' ], cycle: false },
          x: 400,
          y: 300,
          scale: { start: getGameWidth(this.scene)*0.0003, end: 0 },
          blendMode: 'ADD',
          speed: 2,
          lifespan: 1500,
          quantity: 32,
          frequency: 2000,
          emitZone: { type: 'edge', source: shape1, quantity: 32, yoyo: false }
        })
        .setScrollFactor(0)
        .stop()
        )
      }
    }

    // start off with all stats invisible and ignore statmask
    this.setStatsVisible(false, true);


    // i'd like to toggle auto camera scroll whenever space is hit
    this.scene.input.keyboard.on("keydown-SPACE", () => {
        this.cameraAutoPan = !this.cameraAutoPan;
        // if (this.cameraAutoPan) {
        //   if (this.cameraAutoPanText) this.cameraAutoPanText.text = 'Camera Auto Pan: Enabled \n(Hit Space to Toggle)';
        // } else {
        //   if (this.cameraAutoPanText) this.cameraAutoPanText.text = 'Camera Auto Pan: Disabled \n(Hit Space to Toggle)';
        // }
    });

    // const fontHeight = getGameHeight(this.scene)*0.02;
    // this.cameraAutoPanText = this.scene.add.text(
    //     getGameWidth(this.scene)*0.5, 
    //     getGameHeight(this.scene)*0.65,
    //     'Camera Auto Pan: Enabled \n(Hit Space to Toggle)',
    //     { font: fontHeight+'px Courier', color: '#ff0000' })
    //     .setAlign('center')
    //     .setDepth(DEPTH_DEBUG_INFO)
    //     .setOrigin(0.5,0.5)
    //     .setScrollFactor(0)
    //     .setStroke('#ffffff', fontHeight*0.25)
    //     .setVisible(process.env.NODE_ENV === 'development');

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
      if (this.spareMoveIcon && this.congaJumpIcon && this.greenActivateIcon && this.redDestroyIcon && this.redDamageIcon && this.greenBuffIcon && this.gotchiSaveIcon && this.congaStartIcon) {
        this.spareMoveIcon.setBadge(this.currentStats.spareMove);
        this.congaJumpIcon.setBadge(this.currentStats.congaJump);

        this.greenActivateIcon.setBadge(this.currentStats.greenActivate);
        this.redDestroyIcon.setBadge(this.currentStats.redDestroy);
        
        this.redDamageIcon.setBadge(this.currentStats.redDamage);
        this.greenBuffIcon.setBadge(this.currentStats.greenBuff);

        this.gotchiSaveIcon.setBadge(this.currentStats.gotchiSave);
        this.congaStartIcon.setBadge(this.currentStats.congaStart);
      }
    }
    
  }


  // setStatsVisible() depending on mask parameters
  public setStatsVisible(visible: boolean, ignoreMask: boolean) {
    if (this.statMask.spareMove > 0 || ignoreMask) this.spareMoveIcon.setVisible(visible);
    if (this.statMask.congaJump > 0 || ignoreMask) this.congaJumpIcon.setVisible(visible);
    if (this.statMask.greenActivate > 0 || ignoreMask) this.greenActivateIcon.setVisible(visible);
    if (this.statMask.redDestroy > 0 || ignoreMask) this.redDestroyIcon.setVisible(visible);
    if (this.statMask.redDamage > 0 || ignoreMask) this.redDamageIcon.setVisible(visible);
    if (this.statMask.greenBuff > 0 || ignoreMask) this.greenBuffIcon.setVisible(visible);
    if (this.statMask.gotchiSave > 0 || ignoreMask) this.gotchiSaveIcon.setVisible(visible);
    if (this.statMask.congaStart > 0 || ignoreMask) this.congaStartIcon.setVisible(visible);
  }

  public setStatsAlpha(alpha: number) {
    this.spareMoveIcon.setAlpha(alpha);
    this.congaJumpIcon.setAlpha(alpha);
    this.greenActivateIcon.setAlpha(alpha);
    this.redDestroyIcon.setAlpha(alpha);
    this.redDamageIcon.setAlpha(alpha);
    this.greenBuffIcon.setAlpha(alpha);
    this.gotchiSaveIcon.setAlpha(alpha);
    this.congaStartIcon.setAlpha(alpha);
  }

  // setStatMask() hides certain stats 
  public setStatMask(statMask: StatMask) {
    this.statMask = statMask;
  }

  // this function will animate a given stat sphere if not masked
  public animStat(stat: 'SPARE_MOVE' | 'CONGA_JUMP' | 'GREEN_ACTIVATE' | 'RED_DESTROY' | 
  'RED_DAMAGE' | 'GREEN_BUFF' | 'GOTCHI_SAVE' | 'CONGA_START') {

    const duration = 1500;

    if (this.currentStats && this.emitterStat) {
      switch (stat) {
        case 'SPARE_MOVE': {
          if (this.statMask.spareMove === 0) break;
          this.emitterStat[0].setPosition(this.spareMoveIcon.x, this.spareMoveIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[0].stop()}, duration);
          break;
        }
        case 'CONGA_JUMP': {
          if (this.statMask.congaJump === 0) break;
          this.emitterStat[1].setPosition(this.congaJumpIcon.x, this.congaJumpIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[1].stop()}, duration);
          break;
        }
        case 'GREEN_ACTIVATE': {
          if (this.statMask.greenActivate === 0) break;
          this.emitterStat[2].setPosition(this.greenActivateIcon.x, this.greenActivateIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[2].stop()}, duration);
          break;
        }
        case 'RED_DESTROY': {
          if (this.statMask.redDestroy === 0) break;
          this.emitterStat[3].setPosition(this.redDestroyIcon.x, this.redDestroyIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[3].stop()}, duration);
          break;
        }
        case 'RED_DAMAGE': {
          if (this.statMask.redDamage === 0) break;
          this.emitterStat[4].setPosition(this.redDamageIcon.x, this.redDamageIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[4].stop()}, duration);
          break;
        }
        case 'GREEN_BUFF': {
          if (this.statMask.greenBuff === 0) break;
          this.emitterStat[5].setPosition(this.greenBuffIcon.x, this.greenBuffIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[5].stop()}, duration);
          break;
        }
        case 'GOTCHI_SAVE': {
          if (this.statMask.gotchiSave === 0) break;
          this.emitterStat[6].setPosition(this.gotchiSaveIcon.x, this.gotchiSaveIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[6].stop()}, duration);
          break;
        }
        case 'CONGA_START': {
          if (this.statMask.congaStart === 0) break;
          this.emitterStat[7].setPosition(this.congaStartIcon.x, this.congaStartIcon.y).start();
          setTimeout(() => {if (this.emitterStat) this.emitterStat[7].stop()}, duration);
          break;
        }
      }
    }
  }

  public getStat(stat: 'SPARE_MOVE' | 'CONGA_JUMP' | 'GREEN_ACTIVATE' | 'RED_DESTROY' | 
  'RED_DAMAGE' | 'GREEN_BUFF' | 'GOTCHI_SAVE' | 'CONGA_START'): number {
    if (this.currentStats) {
      switch (stat) {
        case 'SPARE_MOVE': {
          return this.currentStats?.spareMove;
          break;
        }
        case 'CONGA_JUMP': {
          return this.currentStats?.congaJump;
          break;
        }
        case 'GREEN_ACTIVATE': {
          return this.currentStats?.greenActivate;
          break;
        }
        case 'RED_DESTROY': {
          return this.currentStats?.redDestroy;
          break;
        }
        case 'RED_DAMAGE': {
          return this.currentStats?.redDamage;
          break;
        }
        case 'GREEN_BUFF': {
          return this.currentStats?.greenBuff;
          break;
        }
        case 'GOTCHI_SAVE': {
          return this.currentStats?.gotchiSave;
          break;
        }
        case 'CONGA_START': {
          return this.currentStats?.congaStart;
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
                y: this.scene.cameras.main.scrollY+getGameHeight(this.scene)*0.965,
                scale: getGameHeight(this.scene)*0.002,
                duration: 250,
                onComplete: () => {
                    this.anims.play('still');
                },
            })
        }
    });

    // tween the stats into visibility
    this.setStatsVisible(true, false);
    this.setStatsAlpha(0);
    const dt = {t:0};
    this.scene.add.tween({
      targets: dt,
      t: 1,
      duration: 500,
      onUpdate: () => {
        this.setStatsAlpha(dt.t);
      },
    })
  }

  public onEndLevel() {
    // hide our stats
    this.setStatsVisible(false, true);

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
                  // play normal animation
                    this.anims.play('front');

                  // the game scene may auto move us to next level if new unlocked
                  (this.scene as GameScene).autoMoveToNextLevelIfPossible();
                },
            })
        }
    });
  }

  public onLevelOverScreen() {
    // do level over screen stuff
  }

  public onSoftResetLevel() {
    // call init stats again to re-evaluate base stats
    this.initStats();
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

        const OFFSET = 1.75;

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
                            if (this.cameraAutoPan) this.panCameraToPlayer();
                        },
                        duration: 500,
                    });
                }
            } else {
                // should really change this to a smoke bomb...
                this.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*OFFSET);

                // tween camera to new position
                if (this.cameraAutoPan) this.panCameraToPlayer();
            }

        }

        this.levelNumber = levelNumber;
  }

  update(): void {
    // do nothing
  }
}
