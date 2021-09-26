// level-button.ts
// this should be stand alone from the actual levels
// an object placed in the world that our gotchi can traverse between

import { GREEN_BUTTON, PURPLE_BUTTON, RED_BUTTON } from "game/assets";
import { getGameWidth } from "game/helpers";
import { DEPTH_LEVEL_BUTTON } from "game/helpers/constants";
import { Player } from ".";


interface Props {
    scene: Phaser.Scene;
    x: number;
    y: number;
    key: string;
    levelNumber: number;
}

export class LevelButton extends Phaser.GameObjects.Image {

    private levelText: Phaser.GameObjects.Text;
    private buttonLinks: LevelButton[] = [];
    private buttonLinkCurves: Phaser.Curves.CubicBezier[] = [];
    private curveGraphics: Phaser.GameObjects.Graphics;
    private levelNumber;
    private isSelected = false;

    // call constructor
    constructor({ scene, x, y, key, levelNumber }: Props) {
        super(scene, x, y, key);

        // create a graphics object
        this.curveGraphics = this.scene.add.graphics();

        // add button to the scene
        this.scene.add.existing(this);
        this.setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.1);
        
        this.setOrigin(0.5,0.5);
        
        this.levelNumber = levelNumber;

        // make some level text
        this.levelText = this.scene.add.text(
            this.x, this.y-this.displayHeight*0.05, 
            levelNumber.toString(), 
            { font: this.displayHeight*0.5+'px Courier', color: '#ffffff' })
                .setOrigin(0.5,0.8)
                .setStroke('#000000', 1)
                .setShadow(0, 2, "#333333", 3, true, true);

        this.setInteractive();
        this.on( 'pointerover', () => { if (!this.isSelected) this.setTexture(PURPLE_BUTTON) });
        this.on( 'pointerout', () => { if (!this.isSelected) this.setTexture(RED_BUTTON) });

        // last thing to do is set depth
        this.setDepth(DEPTH_LEVEL_BUTTON);

    }

    public createLink ( button: LevelButton, bezierControlPoint1: Phaser.Math.Vector2, bezierControlPoint2: Phaser.Math.Vector2) {
        // check we don't already have a link to the button passed to this function
        let alreadyLinked = false;
        this.buttonLinks.map( bl => {
            if (bl === button) alreadyLinked = true;
        });
        if (!alreadyLinked) { 
            this.buttonLinks.push(button);

            // create a curve that goes to new button
            const startPoint = new Phaser.Math.Vector2(this.x, this.y);
            const controlPoint1 = bezierControlPoint1;
            const controlPoint2 = bezierControlPoint2;
            const endPoint = new Phaser.Math.Vector2(button.x, button.y);
            
            // add to our curves array
            this.buttonLinkCurves.push(new Phaser.Curves.CubicBezier(
                startPoint, controlPoint1, controlPoint2,endPoint,
            ));
            
            this.curveGraphics.lineStyle(5, 0xff00ff, 0.9);
            this.buttonLinkCurves[this.buttonLinkCurves.length-1].draw(this.curveGraphics);

            // we also need to add this button to the new buttons links
            button.buttonLinks.push(this);
            // add another curve but reverse it (will be useful for animation). Don't need to draw it though.
            button.buttonLinkCurves.push(new Phaser.Curves.CubicBezier(
                endPoint, controlPoint2, controlPoint1,startPoint,
            ));
        }
    }

    setDepth(depth: number) {
        super.setDepth(depth);
        this.levelText.setDepth(depth + 1);
        this.curveGraphics.setDepth(depth-1);
        return this;
    }

    public getLevelNumber() {
        return this.levelNumber;
    }

    public getBezierCurveLinkedTo(linkedButton: LevelButton) {
        // go through all button links till we find the one attached to linkedButton
        let bezier: Phaser.Curves.CubicBezier | 0 = 0;
        for (let i = 0; i < this.buttonLinks.length; i++) {
            if (this.buttonLinks[i] === linkedButton) {
                bezier = this.buttonLinkCurves[i];
            }
        }
        return bezier;
    }

    public isNextToButton(button: LevelButton) {
        return this.buttonLinks.find( bl => bl === button);
    }

    public setSelected(selected: boolean) {
        this.isSelected = selected;
        if (this.isSelected) this.setTexture(GREEN_BUTTON);
        else this.setTexture(RED_BUTTON);
    }

    public getSelected() { return this.isSelected; }
}