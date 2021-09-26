// gui.ts
// this object controls display of all gui elements

import { getGameHeight, getGameWidth, getRelative } from "game/helpers";
import { GREEN_BUTTON, CLICK, GUI_SCORE_PANEL, GUI_LEVEL_SELECT_RIBBON, GUI_PANEL_5, RED_BUTTON, GUI_BUTTON_PLAY, GUI_BUTTON_FORWARD, GUI_BUTTON_BACK, GUI_BUTTON_CROSS } from "game/assets";
import { LevelButton, Player, LevelConfig, levels, GridLevel, WorldMap } from ".";
// import { Math } from "phaser";
import { GameScene } from "game/scenes/game-scene";
import { DEPTH_GUI_LEVEL_SELECT } from "game/helpers/constants";

interface Props {
    scene: GameScene,
    player: Player,
    world: WorldMap,
}

export class Gui {
    private scene;
    private levelDescription?: Phaser.GameObjects.Image;
    private guiLevelSelectRibbon?: Phaser.GameObjects.Image;
    private text?: Phaser.GameObjects.Text;
    private playButton: Phaser.GameObjects.Image;
    private forwardButton: Phaser.GameObjects.Image;
    private backButton: Phaser.GameObjects.Image;
    private exitButton: Phaser.GameObjects.Image;
    private scorePanel: Phaser.GameObjects.Image;
    private scoreText;
    private mainMenuButton?: Phaser.GameObjects.Image;
    private clickSound?: Phaser.Sound.BaseSound;
    
    private player: Player;
    private world: WorldMap;
    private levelNumber = 0;

    constructor({ scene, player, world}: Props) {
        this.scene = scene;
        this.player = player;
        this.world = world;

        // add the panel for text
        this.levelDescription = this.scene.add.image(
            getGameWidth(this.scene)*0.5,getGameHeight(this.scene)-getGameWidth(this.scene)*0.05,
            GUI_PANEL_5)
        .setDisplaySize(getGameWidth(this.scene)*.9, getGameHeight(this.scene)*0.15)
        .setDepth(DEPTH_GUI_LEVEL_SELECT)
        .setOrigin(0.5,1)
        .setScrollFactor(0);

        // add the nice looking select ribbon
        this.guiLevelSelectRibbon = this.scene.add.image(
            getGameWidth(this.scene)*0.5, this.levelDescription.y-this.levelDescription.displayHeight,
            GUI_LEVEL_SELECT_RIBBON)
            .setDisplaySize(getGameWidth(this.scene)*.6, getGameHeight(this.scene)*0.07)
            .setDepth(DEPTH_GUI_LEVEL_SELECT+1)
            .setOrigin(0.5,0.5)
            .setScrollFactor(0);
        
        // add text for level description
        const fontHeight = getGameHeight(this.scene)*0.027;
        this.text = this.scene.add.text(
            this.levelDescription.x + getGameWidth(this.scene)*0.01, 
            getGameHeight(this.scene)*0.872,
            '',
            { font: fontHeight+'px Courier', color: '#000000' })
            .setWordWrapWidth(getGameWidth(this.scene)*0.7)
            .setDepth(25)
            .setOrigin(0.5,0)
            .setScrollFactor(0);

        // add a play button
        this.playButton = this.scene.add.image(
            getGameWidth(this.scene)*0.5,
            getGameHeight(this.scene)*0.96,
            GUI_BUTTON_PLAY,)
            .setDepth(DEPTH_GUI_LEVEL_SELECT+2)
            .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => {
                
                // start the level
                this.scene.startLevel()
            });

        // add a forward level button
        this.forwardButton = this.scene.add.image(
            getGameWidth(this.scene)*0.93,
            getGameHeight(this.scene)*0.9,
            GUI_BUTTON_FORWARD,)
            .setDepth(DEPTH_GUI_LEVEL_SELECT+2)
            .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.selectLevel(this.levelNumber+1);
            });
        
        // add a back level button
        this.backButton = this.scene.add.image(
            getGameWidth(this.scene)*0.07,
            getGameHeight(this.scene)*0.9,
            GUI_BUTTON_BACK,)
            .setDepth(DEPTH_GUI_LEVEL_SELECT+2)
            .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.selectLevel(this.levelNumber-1);
            });

        // add exit button and start it just offscreen
        this.exitButton = this.scene.add.image(
            getGameWidth(this.scene)-getGameWidth(this.scene)*0.05 + getGameWidth(this.scene), 
            getGameWidth(this.scene)*0.05, 
            GUI_BUTTON_CROSS)
            .setDepth(DEPTH_GUI_LEVEL_SELECT)
            .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
            .setScrollFactor(0)
            .setOrigin(1,0)
            .setInteractive()
            .on('pointerdown', () => {
                // end the level
                this.scene.endLevel()
            });


        // add the scorePanel for grid levels (it should start offscreen)
        this.scorePanel = this.scene.add.image(
            getGameWidth(this.scene)*0.05 - getGameWidth(this.scene),
            getGameWidth(this.scene)*0.05,
            GUI_SCORE_PANEL,)
            .setOrigin(0,0)
            .setScrollFactor(0)
            .setDisplaySize(getGameWidth(this.scene)*0.4, getGameWidth(this.scene)*0.126)
            .setDepth(DEPTH_GUI_LEVEL_SELECT);
  
        // add the scoring text
        this.scoreText = this.scene.add.text(
            getGameWidth(this.scene)*0.21 - getGameWidth(this.scene),
            getGameWidth(this.scene)*0.095,
            '0000000',)
            .setVisible(true)
            .setStyle({
                fontFamily: 'Arial', 
                fontSize: Math.trunc(getGameHeight(this.scene)*0.03).toString() + 'px', 
                })
            .setOrigin(0,0)
            .setStroke('0x000000', 3)
            .setScrollFactor(0)
            .setDepth(DEPTH_GUI_LEVEL_SELECT);
        
        // add the return to main menu button
        this.mainMenuButton = this.scene.add.sprite(
            getGameWidth(this.scene)-getGameWidth(this.scene)*0.05, 
            getGameWidth(this.scene)*0.05, 
            GUI_BUTTON_CROSS)
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
            .on('pointerdown', () => {
                this.clickSound?.play();
                window.history.back();
            })
            .setScrollFactor(0)
            .setDepth(DEPTH_GUI_LEVEL_SELECT);

        // create the back button click sound
        this.clickSound = this.scene.sound.add(CLICK, { loop: false });
    }

    public onStartLevel() {
        // tween down the level description gui
        this.scene.add.tween({
                targets: [this.levelDescription, this.guiLevelSelectRibbon,this.text,this.playButton,this.forwardButton,this.backButton],
                y: '+='+(getGameHeight(this.scene)*0.5).toString(),
                duration: 250,
        });

        // tween across the score panel and text
        this.scene.add.tween({
            targets: [this.scorePanel, this.scoreText],
            x: '+='+(getGameWidth(this.scene)).toString(),
            duration: 250,
        });

        // tween out the main menu button
        this.scene.add.tween({
            targets: this.mainMenuButton,
            x: '+='+(getGameWidth(this.scene)).toString(),
            duration: 250,
        })

        // tween in the exit button
        this.scene.add.tween({
            targets: this.exitButton,
            x: '+='+(-getGameWidth(this.scene)).toString(),
            duration: 250,
        })
    }

    public onEndLevel() {
        // tween the level description back into view
        this.scene.add.tween({
            targets: [this.levelDescription, this.guiLevelSelectRibbon,this.text,this.playButton,this.forwardButton,this.backButton],
            y: '+='+(-getGameHeight(this.scene)*0.5).toString(),
            duration: 250,
        });

        // tween across the score panel and text
        this.scene.add.tween({
            targets: [this.scorePanel, this.scoreText],
            x: '+='+(-getGameWidth(this.scene)).toString(),
            duration: 250,
        });

        // tween in the main menu button
        this.scene.add.tween({
            targets: this.mainMenuButton,
            x: '+='+(-getGameWidth(this.scene)).toString(),
            duration: 250,
        })

        // tween out the exit button
        this.scene.add.tween({
            targets: this.exitButton,
            x: '+='+(getGameWidth(this.scene)).toString(),
            duration: 250,
        })
    }

    public onSelectLevel(levelNumber: number) {
        this.levelNumber = levelNumber;
        switch (levelNumber) {
            case 1: {
                this.text?.setText('1: So... U Congotchi round here often?');
                break;
            }
            case 2: {
                this.text?.setText("2: I'm going on an Aadventure!!!");
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

    public update() {
        // do nothing atm
    }

}