// world-map.ts
// this is the main level selector object that our gotchi traverses

import { GREEN_BUTTON, GUI_BUTTON_PLAY, GUI_LEVEL_SELECT_RIBBON, GUI_PANEL_5, RED_BUTTON } from "game/assets";
import { getGameHeight, getGameWidth, getRelative } from "game/helpers";
import { LevelButton, Player, LevelConfig, levels, GuiLevelSelect, GridLevel } from ".";


interface Props {
    scene: Phaser.Scene;
    x: number;
    y: number;
    key: string;
    player: Player;
    unlockedLevels?: string[];
}

export class WorldMap extends Phaser.GameObjects.Image {

    // declare private variables
    private player: Player;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private debugText: Phaser.GameObjects.Text;
    private worldCam: Phaser.Cameras.Scene2D.Camera;
    private levelButtons: LevelButton[] = [];
    private worldHeight;
    private worldWidth;
    private selectedLevel = 0;
    private levelSelector: GuiLevelSelect;
    private levelPlaying = false;

    private gridLevel?: GridLevel;
    
    // call constructor
    constructor({ scene, x, y, key, player, unlockedLevels }: Props) {
        super(scene, x, y, key);

        // add the map to the scene and set its display size
        const zoom = 1.5;
        this.scene.add.existing(this);
        this.worldHeight = getGameHeight(this.scene)*zoom;
        this.worldWidth = this.worldHeight/612*905;
        this.setDisplaySize(this.worldWidth, this.worldHeight);
        // set alpha and world origin
        // this.setAlpha(0.8);
        this.setOrigin(0,0);

        // // create level buttons
        this.createLevelButtons();

        // add player and make stats invisible
        this.player = player;
        this.player.setStatsVisible(false);

        // create cursor control
        this.cursorKeys = this.scene.input.keyboard.createCursorKeys();

        // create the debug text
        const fontHeight = getGameHeight(this.scene)/50;
        this.debugText = this.scene.add.text(10, 10, 'Debug Info', { font: fontHeight+'px Courier', color: '#ff0000' });
        this.debugText.setScrollFactor(0);
        this.debugText.setStroke("#000000", 1);

        // create the level selector
        this.levelSelector = new GuiLevelSelect( {scene: this.scene, player: this.player, world: this});

         // set the player to level 1
         this.selectLevel(1);

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
        .on('pointerdown', () => this.selectLevel(1));

        // level 2
        this.levelButtons[1] = new LevelButton({
            scene: this.scene,
            x: 0.285*this.displayWidth,
            y: 0.485*this.displayHeight,
            key: RED_BUTTON,
            levelNumber: 2,
        })
        .on('pointerdown', () => this.selectLevel(2));

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
        .on('pointerdown', () => this.selectLevel(3));

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
        .on('pointerdown', () => this.selectLevel(4));

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
        .on('pointerdown', () => this.selectLevel(5));

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

    public startLevel() {
        this.gridLevel = new GridLevel({
            scene: this.scene,
            player: this.player,
            levelConfig: levels[this.selectedLevel - 1],
            x: this.scene.cameras.main.scrollX,
            y: this.scene.cameras.main.scrollY,
        })

        this.levelPlaying = true;
        this.scene.input.disable(this);
        this.levelButtons.map(lb => this.scene.input.disable(lb));
    }

    public endLevel() {
        this.levelPlaying = false;
        this.scene.input.enable(this);
        this.levelButtons.map(lb => this.scene.input.enable(lb));
        this.gridLevel?.destroy();
    }

    public selectLevel(levelNumber: number) {

        const selectedLevelButton = this.getLevelButton(levelNumber);
        const playerLevelButton = this.getLevelButton(this.player.levelNumber);

        // if player doesn't have a level we need to set it to one
        if (!playerLevelButton && selectedLevelButton) {      
            // should really change this to a smoke bomb...
            this.player.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*1.5);
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
                            const playerX = this.player.x;
                            const playerY = this.player.y;
                            const targetX = curve?.getPoint(path.t).x;
                            const targetY = curve?.getPoint(path.t).y-playerLevelButton.displayHeight*1.5;

                            // find out which direction we're moving in most to determine gotchi orientation
                            const deltaX = targetX - playerX;
                            const deltaY = targetY - playerY;
                            // check for left/right
                            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                                deltaX > 0 ? this.player.setDirection('RIGHT') : this.player.setDirection('LEFT');
                            } else {
                                deltaY > 0 ? this.player.setDirection('DOWN') : this.player.setDirection('UP');
                            }

                            this.player.x = targetX;
                            this.player.y = targetY;
                        },
                        onComplete: () => {
                            this.player.setDirection('DOWN');
                        },
                        duration: 500,
                    });
                }
            } else {
                // should really change this to a smoke bomb...
                this.player.setPosition(selectedLevelButton?.x, selectedLevelButton.y-selectedLevelButton.displayHeight*1.5);
            }

        }
        // store the players new level number and ensure current level is selected
        this.player.levelNumber = levelNumber;
        this.selectedLevel = levelNumber;
        this.levelButtons.map( lb => { if (lb !== selectedLevelButton) lb.setSelected(false) });
        selectedLevelButton?.setSelected(true);
        this.levelSelector.setLevel(levelNumber);
    }


    update() {

        if (this.cursorKeys.up.isDown)
        {
            this.scene.cameras.main.scrollY -= 0.01*this.worldHeight;
        }
        else if (this.cursorKeys.down.isDown)
        {
            this.scene.cameras.main.scrollY += 0.01*this.worldHeight;
        }

        if (this.cursorKeys.left.isDown)
        {
            this.scene.cameras.main.scrollX -= 0.01*this.worldHeight;
        }
        else if (this.cursorKeys.right.isDown)
        {
            this.scene.cameras.main.scrollX += 0.01*this.worldHeight;
        }


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