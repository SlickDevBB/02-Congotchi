// level-button.ts
// this should be stand alone from the actual levels
// an object placed in the world that our gotchi can traverse between

import { GREEN_CIRCLE_SHADED, GREY_CIRCLE_SHADED, PINK_CIRCLE_SHADED, RED_CIRCLE_SHADED } from "game/assets";
import { getGameHeight, getGameWidth } from "game/helpers";
import { DEPTH_DEBUG_INFO, DEPTH_LEVEL_BUTTON, DEPTH_WORLD_MAP } from "game/helpers/constants";


interface Props {
    scene: Phaser.Scene;
    x: number;
    y: number;
    key: string;
    levelNumber: number;
    worldWidth: number;
    worldHeight: number;
}

export class LevelButton extends Phaser.GameObjects.Sprite {

    private levelText: Phaser.GameObjects.Text;
    private prevButton?: LevelButton;
    private nextButton?: LevelButton;
    // private buttonLinkCurves: Phaser.Curves.CubicBezier[] = [];
    private curveLinkToPreviousButton?: Phaser.Curves.CubicBezier;
    private curveLinkFromPreviousButton?: Phaser.Curves.CubicBezier;
    private curveGraphics: Phaser.GameObjects.Graphics;

    // need some control points visible for manipulation
    private controlPointA?: Phaser.GameObjects.Image;
    private controlPointB?: Phaser.GameObjects.Image;
    private controlPointAtext?: Phaser.GameObjects.Text;
    private controlPointBtext?: Phaser.GameObjects.Text;
    private controlPointAline?: Phaser.Geom.Line;
    private controlPointBline?: Phaser.Geom.Line;

    private levelNumber;
    private isSelected = false;
    private locked = true;  // note we start all buttons locked

    private debugText?: Phaser.GameObjects.Text;
    private worldWidth?;
    private worldHeight?;

    // call constructor
    constructor({ scene, x, y, key, levelNumber, worldWidth, worldHeight }: Props) {
        super(scene, x, y, key);

        // add a pointer to the world
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        // create a graphics object
        this.curveGraphics = this.scene.add.graphics();

        // add button to the scene
        this.scene.add.existing(this);
        this.setDisplaySize(getGameWidth(this.scene)*0.1, getGameWidth(this.scene)*0.075);
        
        this.setOrigin(0.5,0.5);
        
        this.levelNumber = levelNumber;

        // make some level text
        this.levelText = this.scene.add.text(
            this.x, this.y-this.displayHeight*0.05, 
            levelNumber.toString(), 
            { font: this.displayHeight*0.6+'px Courier', color: '#ffffff' })
                .setOrigin(0.5,0.5)
                .setStroke('#000000', 1)
                .setShadow(0, 2, "#333333", 3, true, true);

        this.setInteractive();
        
        this.on( 'pointerover', () => { if (!this.isSelected && !this.locked) this.setTexture(PINK_CIRCLE_SHADED) });
        this.on( 'pointerout', () => { if (!this.isSelected && !this.locked) this.setTexture(RED_CIRCLE_SHADED) });
        this.on( 'pointerdown', () => console.log(this.isSelected));
        
        // if we're in development make levels draggable
        if (process.env.NODE_ENV === 'development') this.scene.input.setDraggable(this);
        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            this.x = dragX;
            this.y = dragY;

            // update curve to match
            if (this.curveLinkToPreviousButton) {
                this.curveLinkToPreviousButton.p0.x = dragX;
                this.curveLinkToPreviousButton.p0.y = dragY;
                
                if (this.nextButton?.curveLinkToPreviousButton) {
                    this.nextButton.curveLinkToPreviousButton.p3.x = dragX;
                    this.nextButton.curveLinkToPreviousButton.p3.y = dragY;
                } 
            }

            // update control lines to match
            if (this.controlPointAline) {
                this.controlPointAline.x1 = dragX;
                this.controlPointAline.y1 = dragY;

                if (this.nextButton?.controlPointBline) {
                    this.nextButton.controlPointBline.x1 = dragX;
                    this.nextButton.controlPointBline.y1 = dragY;
                }
            }

            this.redrawCurve();
            this.nextButton?.redrawCurve();
        });

        // last thing to do is set depth
        this.setDepth(DEPTH_LEVEL_BUTTON);
        
        // create our debug text
        this.debugText = this.scene.add.text(this.x, this.y, 'level text!', 
        { font: this.displayHeight*0.5+'px Courier', color: '#ff0000' })
                .setOrigin(0.5,0.5)
                .setStroke('#ffffff', 2)
                .setShadow(0, 2, "#ffffff", 3, true, true)
                .setDepth(DEPTH_WORLD_MAP+1)
                .setVisible(process.env.NODE_ENV === 'development')

        
    }

    public redrawCurve() {
        // clear our graphics
        this.curveGraphics.clear();
        this.curveGraphics.lineStyle(5, 0xff00ff, 0.5);
        if (this.curveLinkToPreviousButton) this.curveLinkToPreviousButton.draw(this.curveGraphics);

        if (this.controlPointAline && this.controlPointBline && process.env.NODE_ENV === 'development') {
            this.curveGraphics.lineStyle(3, 0xdddddd, 0.9);
            this.curveGraphics.strokeLineShape(this.controlPointAline);
            this.curveGraphics.strokeLineShape(this.controlPointBline);
        }
    }

    public createLink ( prevButton: LevelButton, bezierControlPoint1: Phaser.Math.Vector2, bezierControlPoint2: Phaser.Math.Vector2) {
        // set prevButton to prevButton
        this.prevButton = prevButton;

        // create a curve that goes to new button
        const startPoint = new Phaser.Math.Vector2(this.x, this.y);
        const controlPoint1 = bezierControlPoint1;
        const controlPoint2 = bezierControlPoint2;
        const endPoint = new Phaser.Math.Vector2(prevButton.x, prevButton.y);

        // create curve back to previous button
        this.curveLinkToPreviousButton = new Phaser.Curves.CubicBezier(
            startPoint, controlPoint1, controlPoint2,endPoint,
        );

        // Create control point lines and draw them
        this.controlPointAline = new Phaser.Geom.Line(startPoint.x, startPoint.y, controlPoint1.x, controlPoint1.y);
        this.controlPointBline = new Phaser.Geom.Line(endPoint.x, endPoint.y, controlPoint2.x, controlPoint2.y);
        
        // draw curve 
        this.redrawCurve();

        // we also need to set the previous buttons next button to this button
        prevButton.nextButton = this;

        // add another curve but reverse it (will be useful for animation). Don't need to draw it though.
        this.curveLinkFromPreviousButton = new Phaser.Curves.CubicBezier(
            endPoint, controlPoint2, controlPoint1,startPoint,
        );

        // create our control point images
        this.controlPointA = this.scene.add.image(controlPoint1.x, controlPoint1.y, GREY_CIRCLE_SHADED)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(getGameWidth(this.scene)*0.05, getGameWidth(this.scene)*0.05)
            .setDepth(DEPTH_WORLD_MAP+1)
            .setVisible(process.env.NODE_ENV === 'development')
            .setInteractive()
            .on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                if (this.controlPointA) {
                    // reset our control point a
                    this.controlPointA.x = dragX;
                    this.controlPointA.y = dragY;
        
                    // update curve to match
                    if (this.curveLinkToPreviousButton) {
                        this.curveLinkToPreviousButton.p1.x = dragX;
                        this.curveLinkToPreviousButton.p1.y = dragY;
                        this.redrawCurve();
                    }

                    // update bezier lines to match
                    if (this.controlPointAline) {
                        this.controlPointAline.x2 = dragX;
                        this.controlPointAline.y2 = dragY;
                    }
                }
            });

        this.controlPointB = this.scene.add.image(controlPoint2.x, controlPoint2.y, GREY_CIRCLE_SHADED)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(getGameWidth(this.scene)*0.05, getGameWidth(this.scene)*0.05)
            .setDepth(DEPTH_WORLD_MAP+1)
            .setVisible(process.env.NODE_ENV === 'development')
            .setInteractive()
            .on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                if (this.controlPointB) {
                    // reset our control point a
                    this.controlPointB.x = dragX;
                    this.controlPointB.y = dragY;
        
                    // update curve to match
                    if (this.curveLinkToPreviousButton) {
                        this.curveLinkToPreviousButton.p2.x = dragX;
                        this.curveLinkToPreviousButton.p2.y = dragY;
                        this.redrawCurve();
                    }

                    // update bezier lines to match
                    if (this.controlPointBline) {
                        this.controlPointBline.x2 = dragX;
                        this.controlPointBline.y2 = dragY;
                    }
                }
            });

        this.scene.input.setDraggable([this.controlPointA, this.controlPointB])

        // make some level text
        this.controlPointAtext = this.scene.add.text(this.x, this.y, 'level text!', 
        { font: this.displayHeight*0.5+'px Courier', color: '#ffffff' })
                .setOrigin(0.5,0.5)
                .setStroke('#000000', 2)
                .setShadow(0, 2, "#333333", 3, true, true)
                .setDepth(DEPTH_WORLD_MAP+1)
                .setVisible(process.env.NODE_ENV === 'development')

        this.controlPointBtext = this.scene.add.text(this.x, this.y, 'level text!', 
        { font: this.displayHeight*0.5+'px Courier', color: '#ffffff' })
                .setOrigin(0.5,0.5)
                .setStroke('#000000', 2)
                .setShadow(0, 2, "#333333", 3, true, true)
                .setDepth(DEPTH_WORLD_MAP+1)
                .setVisible(process.env.NODE_ENV === 'development')
    }

    setDepth(depth: number) {
        super.setDepth(depth);
        this.levelText.setDepth(depth + 1);
        this.curveGraphics.setDepth(depth-1);
        return this;
    }

    public setLocked(locked: boolean) {
        this.locked = locked;
        if (this.locked) {
            this.setTexture(GREY_CIRCLE_SHADED);
        } else {
            if (!this.isSelected) {
                this.setTexture(RED_CIRCLE_SHADED);
            } else {
                this.setTexture(GREEN_CIRCLE_SHADED);
            }
        }
    }

    public isLocked() {
        return this.locked;
    }

    public getLevelNumber() {
        return this.levelNumber;
    }

    public getBezierCurveLinkedTo(linkedButton: LevelButton) {
        // return a curve that goes to the linked button
        if (linkedButton === this.prevButton) {
            return this.curveLinkToPreviousButton;
        } else {
            return this.nextButton?.curveLinkFromPreviousButton;
        }
    }

    public isNextToButton(button: LevelButton) {
        // return this.buttonLinks.find( bl => bl === button);
        return this.prevButton === button || this.nextButton === button;
    }

    public setSelected(selected: boolean) {
        if (!this.locked) {
            this.isSelected = selected;
            if (this.isSelected) this.setTexture(GREEN_CIRCLE_SHADED);
            else this.setTexture(RED_CIRCLE_SHADED);
        }
    }

    public getSelected() { return this.isSelected; }

    // our update function that runs every cycle
    update() {
        super.update();

        // update level text position
        this.levelText.setPosition(this.x, this.y-this.displayHeight*0.05);
        
        // update our debug text if in debug mode
        if (process.env.NODE_ENV === 'development' && this.debugText && this.worldWidth && this.worldHeight && this.controlPointAtext && this.controlPointBtext && this.controlPointA && this.controlPointB) {
            this.debugText.setPosition(this.x, this.y + getGameHeight(this.scene)*0.05)
            this.debugText.text = 'X: ' + (this.x/this.worldWidth).toFixed(3).toString() + '\nY: ' + (this.y/this.worldHeight).toFixed(3).toString();
        
            this.controlPointAtext.setPosition(this.controlPointA.x, this.controlPointA.y + getGameHeight(this.scene)*0.05)
            this.controlPointAtext.text = 'X: ' + (this.controlPointA.x/this.worldWidth).toFixed(3).toString() + '\nY: ' + (this.controlPointA.y/this.worldHeight).toFixed(3).toString();
        
            this.controlPointBtext.setPosition(this.controlPointB.x, this.controlPointB.y + getGameHeight(this.scene)*0.05)
            this.controlPointBtext.text = 'X: ' + (this.controlPointB.x/this.worldWidth).toFixed(3).toString() + '\nY: ' + (this.controlPointB.y/this.worldHeight).toFixed(3).toString();
        }
    }
}