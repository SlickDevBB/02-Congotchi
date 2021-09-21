// gui-level-description.ts
// just a tab at bottom of world map to describe a level

import { getGameHeight, getGameWidth, getRelative } from "game/helpers";
import { GREEN_BUTTON, GUI_LEVEL_SELECT_RIBBON, GUI_PANEL_5, RED_BUTTON, GUI_BUTTON_PLAY, GUI_BUTTON_FORWARD, GUI_BUTTON_BACK, GUI_BUTTON_CROSS } from "game/assets";
import { LevelButton, Player, LevelConfig, levels, GridLevel, WorldMap } from ".";
import { Math } from "phaser";

interface Props {
    scene: Phaser.Scene,
    player: Player,
    world: WorldMap,
}

export class GuiLevelSelect {

    private scene;
    private guiPanel5?: Phaser.GameObjects.Image;
    private guiLevelSelectRibbon?: Phaser.GameObjects.Image;
    private text?: Phaser.GameObjects.Text;
    private playButton: Phaser.GameObjects.Image;
    private forwardButton: Phaser.GameObjects.Image;
    private backButton: Phaser.GameObjects.Image;
    private exitButton: Phaser.GameObjects.Image;
    
    private player: Player;
    private playerSavedPos: Phaser.Math.Vector2;
    private playerSavedScaleX = 1;
    private playerSavedScaleY= 1;
    private world: WorldMap;
    private levelNumber = 0;

    constructor({ scene, player, world}: Props) {
        this.scene = scene;
        this.player = player;
        this.playerSavedPos = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.world = world;

        // add the panel for text
        this.guiPanel5 = this.scene.add.image(
            getGameWidth(this.scene)*0.5,getGameHeight(this.scene)-getGameWidth(this.scene)*0.05,
            GUI_PANEL_5)
        .setDisplaySize(getGameWidth(this.scene)*.9, getGameHeight(this.scene)*0.15)
        .setDepth(20)
        .setOrigin(0.5,1)
        .setScrollFactor(0);

        // add the nice looking select ribbon
        this.guiLevelSelectRibbon = this.scene.add.image(
            getGameWidth(this.scene)*0.5, this.guiPanel5.y-this.guiPanel5.displayHeight,
            GUI_LEVEL_SELECT_RIBBON)
        .setDisplaySize(getGameWidth(this.scene)*.6, getGameHeight(this.scene)*0.07)
        .setDepth(25)
        .setOrigin(0.5,0.5)
        .setScrollFactor(0);
        
        // add text
        const fontHeight = getGameHeight(this.scene)*0.027;
        this.text = this.scene.add.text(
            this.guiPanel5.x + getGameWidth(this.scene)*0.01, 
            getGameHeight(this.scene)*0.872,
            '',
            { font: fontHeight+'px Courier', color: '#000000' })
        // .setStroke('0x000000', 1)
        .setWordWrapWidth(getGameWidth(this.scene)*0.7)
        .setDepth(25)
        .setOrigin(0.5,0)
        .setScrollFactor(0);

        // add a play button
        this.playButton = this.scene.add.image(
            getGameWidth(this.scene)*0.5,
            getGameHeight(this.scene)*0.96,
            GUI_BUTTON_PLAY,
        )
        .setDepth(30)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => {
            // tween player down
            this.tweenPlayerIntoLevel();

            // we need to hide the level select gui so hide it downwards
            this.adjustPosition(0, getGameHeight(this.scene)*0.5);

            // hide the level exit button
            this.exitButton.setVisible(true);

            // start the level
            this.world.startLevel()
        });

        // add a forward level button
        this.forwardButton = this.scene.add.image(
            getGameWidth(this.scene)*0.93,
            getGameHeight(this.scene)*0.9,
            GUI_BUTTON_FORWARD,
        )
        .setDepth(30)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => {
            this.world.selectLevel(this.levelNumber+1);
        });
        
        // add a back level button
        this.backButton = this.scene.add.image(
            getGameWidth(this.scene)*0.07,
            getGameHeight(this.scene)*0.9,
            GUI_BUTTON_BACK,
        )
        .setDepth(30)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => {
            this.world.selectLevel(this.levelNumber-1);
        });

        // add exit button and start it off invisible
        this.exitButton = this.scene.add.image(
            getGameWidth(this.scene)*0.8,
            getGameHeight(this.scene)*0.1,
            GUI_BUTTON_CROSS,
        )
        .setDepth(30)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)
        .on('pointerdown', () => {
            // tween player down
            this.tweenPlayerOutOfLevel();

            // bring back level select gui
            this.adjustPosition(0, -getGameHeight(this.scene)*0.5);

            // hide the level exit button
            this.exitButton.setVisible(false);

            // end the level
            this.world.endLevel()
        });
    }

    

    public setLevel(levelNumber: number) {
        this.levelNumber = levelNumber;
        switch (levelNumber) {
            case 1: {
                this.text?.setText('1: So... U Congotchi round here often?');
                break;
            }
            case 2: {
                this.text?.setText('2: The Journey Begins... dunh dunh daaaah');
                break;
            }
            case 3: {
                this.text?.setText('3: Friskin by the Forest! Oooooweeee!');
                break;
            }
            case 4: {
                this.text?.setText('4: Shall we go in? Maybe wait a bit...');
                break;
            }
            case 5: {
                this.text?.setText('5: OMG. Is that a head? A tentacle? What.. the.. f....');
                break;
            }
        }
    }


    public adjustPosition(deltaX: number, deltaY: number) {
        this.scene.add.tween({
            targets: [this.guiPanel5, this.guiLevelSelectRibbon,this.text,this.playButton,this.forwardButton,this.backButton],
            x: '+='+deltaX.toString(),
            y: '+='+deltaY.toString(),
            duration: 250,
        });
    }

    public tweenPlayerIntoLevel() {
        this.playerSavedPos = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.playerSavedScaleX = this.player.scaleX;
        this.playerSavedScaleY = this.player.scaleY;

        this.scene.add.tween({
            targets: this.player,
            y: this.player.y + getGameHeight(this.scene),
            duration: 250,
            onComplete: () => {
                this.scene.add.tween({
                    targets: this.player,
                    x: this.scene.cameras.main.scrollX+getGameWidth(this.scene)*0.5,
                    y: this.scene.cameras.main.scrollY+getGameHeight(this.scene),
                    scale: getGameHeight(this.scene)*0.002,
                    duration: 250,
                    onComplete: () => {
                        this.player.anims.play('still');
                        this.player.setStatsVisible(true);
                    },
                })
            }
        });
    }

    public tweenPlayerOutOfLevel() {
        this.player.setStatsVisible(false);
        this.scene.add.tween({
            targets: this.player,
            y: this.player.y + getGameHeight(this.scene),
            duration: 250,
            onComplete: () => {
                this.scene.add.tween({
                    targets: this.player,
                    x: this.playerSavedPos.x,
                    y: this.playerSavedPos.y,
                    scaleX: this.playerSavedScaleX,
                    scaleY: this.playerSavedScaleY,
                    duration: 250,
                    onComplete: () => {
                        this.player.anims.play('idle');
                    },
                })
            }
        });
    }
}