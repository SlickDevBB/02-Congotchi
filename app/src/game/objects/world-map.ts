// world-map.ts
// this is the main level selector object that our gotchi traverses

import { GREEN_BUTTON, GUI_BUTTON_PLAY, GUI_LEVEL_SELECT_RIBBON, GUI_PANEL_5, RED_BUTTON } from "game/assets";
import { getGameHeight, getGameWidth, getRelative } from "game/helpers";
import { LevelButton, Player, LevelConfig, levels, Gui, GridLevel } from ".";
import {
    LEFT_CHEVRON, BG, CLICK, ARROW_DOWN, GUI_BUTTON_CROSS,
  } from 'game/assets';
import { GameScene } from "game/scenes/game-scene";
import { DEPTH_WORLD_MASK } from "game/helpers/constants";

interface Props {
    scene: GameScene;
    x: number;
    y: number;
    key: string;
    unlockedLevels?: string[];
}

export class WorldMap extends Phaser.GameObjects.Image {

    // declare private variables
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private debugText: Phaser.GameObjects.Text;
    private worldCam: Phaser.Cameras.Scene2D.Camera;
    private levelButtons: LevelButton[] = [];
    private worldHeight;
    private worldWidth;
    
    private backButton?: Phaser.GameObjects.Image;
    private backSound?: Phaser.Sound.BaseSound;

    private worldMask: Phaser.GameObjects.Rectangle;

    // call constructor
    constructor({ scene, x, y, key, unlockedLevels }: Props) {
        super(scene, x, y, key);

        // add the map to the scene and set its display size
        const zoom = 2;
        this.scene.add.existing(this);
        this.worldHeight = getGameHeight(this.scene)*zoom;
        this.worldWidth = this.worldHeight/612*905;
        this.setDisplaySize(this.worldWidth, this.worldHeight);
        this.setOrigin(0,0);

        // // create level buttons
        this.createLevelButtons();

        // create cursor control
        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        // create the debug text
        const fontHeight = getGameHeight(this.scene)/50;
        this.debugText = this.scene.add.text(10, 10, 'Debug Info', { font: fontHeight+'px Courier', color: '#ff0000' });
        this.debugText.setScrollFactor(0);
        this.debugText.setStroke("#000000", 1);

        // get the main scene camera and set its initial scroll position
        this.worldCam = this.scene.cameras.main;
        this.worldCam.setBounds(0, 0, this.displayWidth, this.displayHeight);
        this.worldCam.setScroll(0.137*this.displayWidth,0.236*this.displayHeight);

        // make the world map 'draggable" although when we drag we only want the camera to move
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            this.worldCam.scrollX -= dragX * getGameWidth(this.scene) / this.displayWidth;
            this.worldCam.scrollY -= dragY * getGameHeight(this.scene) / this.displayHeight;
        });

        // create a world mask used to 'dim' the world on level select
        this.worldMask = this.scene.add.rectangle(0,0,getGameWidth(this.scene),getGameHeight(this.scene),0x000000,0)
            .setDepth(DEPTH_WORLD_MASK)
            .setScrollFactor(0)
            .setOrigin(0,0);

    }

    private createLevelButtons() {
        // level 1
        this.levelButtons[0] = new LevelButton({
            scene: this.scene,
            x: 0.23*this.displayWidth,
            y: 0.65*this.displayHeight,
            key: RED_BUTTON,
            levelNumber: 1,
        })
        .on('pointerdown', () => (this.scene as GameScene).selectLevel(1));

        // level 2
        this.levelButtons[1] = new LevelButton({
            scene: this.scene,
            x: 0.285*this.displayWidth,
            y: 0.485*this.displayHeight,
            key: RED_BUTTON,
            levelNumber: 2,
        })
        .on('pointerdown', () => (this.scene as GameScene).selectLevel(2));

        // create link form level 1 to 2
        this.levelButtons[0].createLink(this.levelButtons[1], 
            new Phaser.Math.Vector2(0.285*this.displayWidth, 0.62*this.displayHeight),
            new Phaser.Math.Vector2(0.24*this.displayWidth, 0.5*this.displayHeight),
        );

        // level 3
        this.levelButtons[2] = new LevelButton({
            scene: this.scene,
            x: 0.206*this.displayWidth,
            y: 0.386*this.displayHeight,
            key: RED_BUTTON,
            levelNumber: 3,
        })
        .on('pointerdown', () => (this.scene as GameScene).selectLevel(3));

        // create link form level 2 to 3
        this.levelButtons[1].createLink(this.levelButtons[2], 
            new Phaser.Math.Vector2(0.288*this.displayWidth, 0.4*this.displayHeight),
            new Phaser.Math.Vector2(0.24*this.displayWidth, 0.37*this.displayHeight),
        );

        // level 4
        this.levelButtons[3] = new LevelButton({
            scene: this.scene,
            x: 0.06*this.displayWidth,
            y: 0.4*this.displayHeight,
            key: RED_BUTTON,
            levelNumber: 4,
        })
        .on('pointerdown', () => (this.scene as GameScene).selectLevel(4));

        // create link form level 2 to 3
        this.levelButtons[2].createLink(this.levelButtons[3], 
            new Phaser.Math.Vector2(0.12*this.displayWidth, 0.4*this.displayHeight),
            new Phaser.Math.Vector2(0.12*this.displayWidth, 0.47*this.displayHeight),
        );

        // level 5
        this.levelButtons[4] = new LevelButton({
            scene: this.scene,
            x: 0.115*this.displayWidth,
            y: 0.273*this.displayHeight,
            key: RED_BUTTON,
            levelNumber: 5,
        })
        .on('pointerdown', () => (this.scene as GameScene).selectLevel(5));

        // create link form level 2 to 3
        this.levelButtons[3].createLink(this.levelButtons[4], 
            new Phaser.Math.Vector2(0.029*this.displayWidth, 0.279*this.displayHeight),
            new Phaser.Math.Vector2(0.038*this.displayWidth, 0.2*this.displayHeight),
        );


        
    }

    public getLevelButton(levelNumber: number) {
        const val = this.levelButtons.find( lb => lb.getLevelNumber() === levelNumber );
        return val;
    }

    public onStartLevel() {
        this.scene.input.disable(this);
        this.levelButtons.map(lb => this.scene.input.disable(lb));

        // fade in the world mask
        this.scene.add.tween({
            targets: this.worldMask,
            fillAlpha: 0.8,
            duration: 250,
        })

        // move the main menu button offscreen
        if (this.backButton) {
            this.scene.add.tween({
                targets: this.backButton,
                x: this.backButton.x + getGameWidth(this.scene),
                duration: 250,
            })
        }
    }

    public onEndLevel() {
        this.scene.input.enable(this);
        this.levelButtons.map(lb => this.scene.input.enable(lb));
        
        // fade out the world mask
        this.scene.add.tween({
            targets: this.worldMask,
            fillAlpha: 0,
            duration: 250,
        })

        // move the main menu button offscreen
        if (this.backButton) {
            this.scene.add.tween({
                targets: this.backButton,
                x: this.backButton.x - getGameWidth(this.scene),
                duration: 250,
            })
        }
    }

    public onSelectLevel(levelNumber: number) {
        // set the selected level button to visible
        const selectedLevelButton = this.getLevelButton(levelNumber);
        this.levelButtons.map( lb => { if (lb !== selectedLevelButton) lb.setSelected(false) });
        selectedLevelButton?.setSelected(true);

    }


    update() {

        // render some debug info
        const pointer = this.scene.input.activePointer;

        this.debugText.setText([
            'World Parameters:',
            // '  Width: ' + Math.floor(this.worldWidth) + 'px',
            // '  Height: ' + Math.floor(this.worldHeight) + 'px',
            '  Ptr % Width:  ' + (this.scene.cameras.main.scrollX/this.worldWidth + pointer.x/this.worldWidth).toFixed(3),
            '  Ptr % Height: ' + (this.scene.cameras.main.scrollY/this.worldHeight + pointer.y/this.worldHeight).toFixed(3),
            // 'Screen Parameters:',
            // '  Ptr px: ' + Math.floor(pointer.x),
            // '  Ptr px: ' + Math.floor(pointer.y),
            '  Camera X: ' + (this.scene.cameras.main.scrollX/this.worldWidth).toFixed(3),
            '  Camera Y: ' + (this.scene.cameras.main.scrollY/this.worldHeight).toFixed(3),
            // '  Camera Zoom: ' + this.worldCam.zoom,
        ]);
    }

}