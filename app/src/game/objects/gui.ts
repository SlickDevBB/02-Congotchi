// gui.ts
// this object controls display of all gui elements

import { getGameHeight, getGameWidth, } from "game/helpers";
import { SOUND_CLICK, GUI_LEVEL_SELECT_RIBBON, GUI_PANEL_5, GUI_BUTTON_PLAY, GUI_BUTTON_CROSS, GUI_BUTTON_RESET, GUI_BUTTON_FAST_FORWARD } from "game/assets";
import { Player, levels, WorldMap, GuiScoreBoard } from ".";
// import { Math } from "phaser";
import { GameScene } from "game/scenes/game-scene";
import { DEPTH_ACTION_TEXT, DEPTH_GUI_LEVEL_OVER, DEPTH_GUI_LEVEL_SELECT } from "game/helpers/constants";

interface Props {
    scene: GameScene,
    player: Player,
    world: WorldMap,
}

// interface LevelScores {
//     levelNumber: number,
//     highScore: number,
//     stars: number,
// }

export class Gui {
    private scene;
    private levelDescription?: Phaser.GameObjects.Image;
    private guiLevelSelectRibbon?: Phaser.GameObjects.Image;
    private text?: Phaser.GameObjects.Text;
    private playButton: Phaser.GameObjects.Image;
    private exitButton: Phaser.GameObjects.Image;
    private scoreBoard: GuiScoreBoard;
    private mainMenuButton?: Phaser.GameObjects.Image;

    private resetButton: Phaser.GameObjects.Image;
    private nextLevelButton: Phaser.GameObjects.Image;
    
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
            getGameWidth(this.scene)*0.5,
            getGameHeight(this.scene)-getGameWidth(this.scene)*0.05,
            GUI_PANEL_5)
        .setDisplaySize(getGameWidth(this.scene)*.9, getGameHeight(this.scene)*0.3)
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
        const fontHeight = getGameHeight(this.scene)*0.026;
        this.text = this.scene.add.text(
            getGameWidth(this.scene)*0.5, 
            getGameHeight(this.scene)*(1-0.28),
            '',
            { font: fontHeight+'px Courier', color: '#000000' })
            .setWordWrapWidth(getGameWidth(this.scene)*0.85)
            .setAlign('center')
            .setDepth(25)
            .setOrigin(0.5,0)
            .setScrollFactor(0);

        // add a play button
        this.playButton = this.scene.add.image(
            getGameWidth(this.scene)*0.5,
            getGameHeight(this.scene)*0.965,
            GUI_BUTTON_PLAY,)
            .setDepth(DEPTH_GUI_LEVEL_SELECT+2)
            .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => {
                
                // start the level
                this.scene.startLevel()
            });

        // add exit button when we need to get out of a level
        this.exitButton = this.scene.add.image(
            getGameWidth(this.scene)-getGameWidth(this.scene)*0.1, 
            getGameWidth(this.scene)*0.1, 
            GUI_BUTTON_CROSS)
        .setDepth(DEPTH_GUI_LEVEL_OVER+5)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setOrigin(0.5,0.5)
        .setInteractive()
        .on('pointerdown', () => {
            // if level was active and we escaped we didn't get a natural victory
            if (this.scene.getGridLevel()?.getStatus() === 'ACTIVE') {
                // if a conga isn't running we should show victory screen
                if (!this.scene.getGridLevel()?.isCongaStepRunning()) {
                    (this.scene as GameScene).showLevelOverScreen();
                }  
            } else if (this.scene.getGridLevel()?.getStatus() === 'LEVEL_OVER_SCREEN') {
                (this.scene as GameScene).endLevel(false);
            }
            else {
                // we've hit exit when on world map, save the current level and get out of here
                (this.scene as GameScene).returnMainMenu();
                this.clickSound?.play();
                window.history.back();
            }
        });

        // add reset button when we need to get out of a level
        this.resetButton = this.scene.add.image(
            getGameWidth(this.scene)-getGameWidth(this.scene)*0.225, 
            getGameWidth(this.scene)*0.1, 
            GUI_BUTTON_RESET)
        .setDepth(DEPTH_GUI_LEVEL_OVER+5)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setOrigin(0.5,0.5)
        .setInteractive()
        .setVisible(false)
        .on('pointerdown', () => {
            // if level was active and we escaped we didn't get a natural victory
            if (this.scene.getGridLevel()?.getStatus() === 'ACTIVE') {
                // if a conga isn't running reset the level
                if (!this.scene.getGridLevel()?.isCongaStepRunning()) {
                    (this.scene as GameScene).softResetLevel();
                }  
            } else if (this.scene.getGridLevel()?.getStatus() === 'LEVEL_OVER_SCREEN') {
                (this.scene as GameScene).softResetLevel();
            }
            else {
                // we've hit exit when on world map, save the current level and get out of here
                (this.scene as GameScene).returnMainMenu();
                this.clickSound?.play();
                window.history.back();
            }
        });

        // add the next level button which only shows up at level over screen
        this.nextLevelButton = this.scene.add.image(
            getGameWidth(this.scene)-getGameWidth(this.scene)*0.225, 
            getGameWidth(this.scene)*0.1, 
            GUI_BUTTON_FAST_FORWARD)
        .setDepth(DEPTH_GUI_LEVEL_OVER+5)
        .setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1)
        .setScrollFactor(0)
        .setOrigin(0.5,0.5)
        .setInteractive()
        .setVisible(false)
        .on('pointerdown', () => {
            // if we're at level over screen just exit normally
            if (this.scene.getGridLevel()?.getStatus() === 'LEVEL_OVER_SCREEN') {
                (this.scene as GameScene).endLevel(true);
            }
        });
        
        // add scoreboard
        this.scoreBoard = new GuiScoreBoard({
            scene: this.scene,
            x: getGameWidth(this.scene)*0.25,
            y: getGameWidth(this.scene)*0.125,
        });

        // create the back button click sound
        this.clickSound = this.scene.sound.add(SOUND_CLICK, { loop: false });
    }

    public getScoreboard() {
        return this.scoreBoard;
    }

    public adjustScore(delta: number) {
        this.scoreBoard.adjustScore(delta);
    }

    public setStarScore(stars: 0 | 1 | 2 | 3) {
        this.scoreBoard.setStarScore(stars);
    }

    public onSelectLevel(levelNumber: number) {
        this.levelNumber = levelNumber;
        this.text?.setText(levels[levelNumber-1].levelDescription);

        // display the latest available score data
        this.displayLevelHighScore(levelNumber);

        console.log((this.scene as GameScene).levelScores);
    }

    public onStartLevel() {
        // tween down the level description gui
        this.scene.add.tween({
                targets: [this.levelDescription, this.guiLevelSelectRibbon,this.text,this.playButton,],
                y: '+='+(getGameHeight(this.scene)*0.5).toString(),
                duration: 250,
        });

        // tell the scoreboard started a level
        this.scoreBoard.onStartLevel();

        // tween out the main menu button
        this.scene.add.tween({
            targets: [this.mainMenuButton,  ],
            x: '+='+(getGameWidth(this.scene)).toString(),
            duration: 250,
        })

        // make the reset button visible
        this.resetButton.setVisible(true);

    }

    public onEndLevel() {
        // tween the level description back into view
        this.scene.add.tween({
            targets: [this.levelDescription, this.guiLevelSelectRibbon,this.text,this.playButton,],
            y: '+='+(-getGameHeight(this.scene)*0.5).toString(),
            duration: 250,
        });

        // tween the exit button back home
        this.scene.add.tween({
            targets: this.exitButton,
            x: getGameWidth(this.scene)-getGameWidth(this.scene)*0.1, 
            y: getGameWidth(this.scene)*0.1, 
            // scale: this.exitButton.scale/1.5,
            duration: 250,
        });

        // tween the reset button back home
        this.scene.add.tween({
            targets: this.resetButton,
            x: getGameWidth(this.scene)-getGameWidth(this.scene)*0.225, 
            y: getGameWidth(this.scene)*0.1, 
            duration: 250,
        });

        // tween in the main menu button
        this.scene.add.tween({
            targets: [this.mainMenuButton,  ],
            x: '+='+(-getGameWidth(this.scene)).toString(),
            duration: 250,
        })

        // hide the next level and reset buttons
        this.nextLevelButton.setVisible(false);
        this.resetButton.setVisible(false);

        // return score home
        this.scoreBoard.returnHome();

        // redisplay high scores
        this.displayLevelHighScore(this.levelNumber);
    }

    public onSoftResetLevel() {
        // tween scoreboard back to home position (if activated from victory screen)
        this.scoreBoard.returnHome();

        // reset the scoreboard
        this.scoreBoard.resetScore();

        // tween the exit button back home
        this.scene.add.tween({
            targets: this.exitButton,
            x: getGameWidth(this.scene)-getGameWidth(this.scene)*0.1, 
            y: getGameWidth(this.scene)*0.1, 
            duration: 250,
        });

        // tween the reset button back home
        this.scene.add.tween({
            targets: this.resetButton,
            x: getGameWidth(this.scene)-getGameWidth(this.scene)*0.225, 
            y: getGameWidth(this.scene)*0.1, 
            duration: 250,
        });

        // hide the next level button
        this.nextLevelButton.setVisible(false);
    }

    public displayLevelHighScore(levelNumber: number) {
        // Fetch current gotchis highest score for this level and display it
        if ((this.scene as GameScene).levelScores[levelNumber-1]) {
            const hs = (this.scene as GameScene).levelScores[levelNumber-1].highScore;
            const st = (this.scene as GameScene).levelScores[levelNumber-1].stars;
            
            // update the scoreboard
            this.scoreBoard.setScore(hs);
            this.scoreBoard.setStarScore(st);
            console.log('hs ' + hs);
            console.log('st ' + st);
            
        } else {
            console.log('Why are we missing level data?????');
        }
    }

    public showActionText(text: string) {
        // add a tween of some text in middle of page
        const phaserText = this.scene.add.text(
            getGameWidth(this.scene)*0.5, 
            getGameHeight(this.scene)*0.4, 
            text,
            {
                fontFamily: 'Arial',
                fontSize: (getGameHeight(this.scene)*0.03).toString() + 'px',
                color: '#fff',
                stroke: '#f0f',
                strokeThickness: 3
            })
            .setOrigin(0.5,0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH_ACTION_TEXT)
            .setAlpha(0);

        this.scene.add.tween({
            targets: phaserText,
            angle: 1,
            yoyo: true,
            duration: 500,
        })

        this.scene.add.tween({
            targets: phaserText,
            alpha: 1,
            yoyo: true,
            y: phaserText.y - getGameHeight(this.scene)*0.002,
            duration: 500,
            onComplete: () => {
                phaserText.destroy();
            }
        })
    }

    public onLevelOverScreen() {
        // move the scoreboard into the end of level results position
        this.scoreBoard.showLevelOverResults();
        
        // tween the exit button down next to the scoreboard
        this.scene.add.tween({
            targets: this.exitButton,
            x: getGameWidth(this.scene)*0.87,
            y: getGameHeight(this.scene)*0.43,
            duration: 250,
        }); 

        // tween reset button down next to the scoreboard
        this.scene.add.tween({
            targets: this.resetButton,
            x: getGameWidth(this.scene)*0.43,
            y: getGameHeight(this.scene)*0.56,
            duration: 250,
        }); 

        // show the next level button
        this.nextLevelButton.setVisible(true);
        this.nextLevelButton.setPosition(getGameWidth(this.scene)*0.58, getGameHeight(this.scene)*0.56);
        // fade tween it into visibility
        this.nextLevelButton.setAlpha(0);
        this.scene.add.tween({
            targets: this.nextLevelButton,
            alpha: 1,
            duration: 250,
        })
    }

    public destroy() {
        // does nothing right now
    }

    public update() {
        // update gui score board
        this.scoreBoard.update();

        // if we have an active level and a conga is running exit and reset should be greyed out
        if (this.scene.getGridLevel()?.getStatus() === 'ACTIVE' && this.scene.getGridLevel()?.isCongaStepRunning()) {
            this.exitButton.setAlpha(0.5);
            this.resetButton.setAlpha(0.5);
        } else {
            this.exitButton.setAlpha(1);
            this.resetButton.setAlpha(1);
        }
    }

}