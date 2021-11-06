import { AavegotchiGameObject, AavegotchiObject, Tuple } from "types";
import { getGameHeight, getGameWidth } from "game/helpers";
import { assets, SpritesheetAsset } from "game/assets";
import { constructSpritesheet } from "../helpers/spritesheet";
import { customiseSvg } from "helpers/aavegotchi";
import { Socket } from "socket.io-client";

interface AavegotchiWithSvg extends AavegotchiObject {
  svg: Tuple<string, 4>;
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Boot",
};

/**
 * The initial scene that loads all necessary assets to the game.
 */
export class BootScene extends Phaser.Scene {
  private socket?: Socket;
  private connected?: boolean;
  private assetsLoaded?: boolean;
  private gotchi?: AavegotchiGameObject;
  private randomGotchis?: AavegotchiGameObject[] = [];
  private loadIndex: number;
  private randomLoadCounter: number;
  private progressBarContainer?: Phaser.GameObjects.Rectangle;
  private progressBar?: Phaser.GameObjects.Rectangle;
  private loadingText?: Phaser.GameObjects.Text;

  constructor() {
    super(sceneConfig);
    this.loadIndex = 0;
    this.randomLoadCounter = 0;
  }

  public preload = (): void => {
    // Construct progress bar
    this.createProgressBar();

    // Construct gotchi game object from registry
    const selectedGotchi = this.game.registry.values
      .selectedGotchi as AavegotchiWithSvg;
    this.gotchi = {
      ...selectedGotchi,
      spritesheetKey: "PLAYER",
    };

    // construct random gotchis from registry
    const randomGotchiCopy: AavegotchiGameObject[] = [];
    const registryGotchis = this.game.registry.values.randomAavegotchis;
    for (let i = 0; i < registryGotchis.length; i++) {
      randomGotchiCopy[i] = { ...registryGotchis[i], spritesheetKey: "RANDOM_GOTCHI_" + i.toString() };
    }
    this.randomGotchis = randomGotchiCopy;
    

    // Checks connection to the server
    this.socket = this.game.registry.values.socket;
    !this.socket?.connected
      ? this.socket?.on("connect", () => {
          this.handleConnection();
        })
      : this.handleConnection();

    // Listener that triggers when an asset has loaded
    this.load.on(
      "filecomplete",
      (key: string) => {
        // As the spritesheet is the last asset to load in, we can attempt to start the game
        if (key === "PLAYER") {
          this.assetsLoaded = true;
          this.loadingText?.setText(`Connecting to server...`);
          this.startGame();
        }

        if (this.loadIndex === assets.length && this.gotchi && this.randomGotchis && this.randomGotchis.length === this.randomLoadCounter) {
          this.loadInGotchiSpritesheet(this.gotchi, true);
        } else if (this.loadIndex !== assets.length) {
          this.loadNextFile(this.loadIndex);
        } else if (this.loadIndex === assets.length && this.randomGotchis && this.randomGotchis.length !== this.randomLoadCounter) {
          console.log(this.randomLoadCounter);
          console.log(this.randomGotchis[this.randomLoadCounter]);
          this.loadInRandomGotchiSpritesheet(this.randomGotchis[this.randomLoadCounter], true);
          this.randomLoadCounter++;
        }
      },
      this
    );

    // start loading files
    this.loadNextFile(0);
  };

  /**
   * Submits gotchi data to the server and attempts to start game
   */
  private handleConnection = () => {
    const gotchi = this.game.registry.values.selectedGotchi as AavegotchiObject;
    this.connected = true;
    this.socket?.emit("setGotchiData", {
      name: gotchi.name,
      tokenId: gotchi.id,
    });

    this.startGame();
  };

  /**
   * If all the assets are loaded in, and user is connected to server, start game
   */
  private startGame = () => {
    if (this.assetsLoaded && this.connected) {
      this.scene.start("Game", { selectedGotchi: this.gotchi, randomGotchis: this.randomGotchis });
    }
  };

  /**
   * Renders UI component to display loading progress
   */
  private createProgressBar = () => {
    const width = getGameWidth(this) * 0.5;
    const height = 12;
    this.progressBarContainer = this.add
      .rectangle(
        getGameWidth(this) / 2,
        getGameHeight(this) / 2,
        width,
        height,
        0x12032e
      )
      .setOrigin(0.5);

    this.progressBar = this.add
      .rectangle(
        (getGameWidth(this) - width) / 2,
        getGameHeight(this) / 2,
        0,
        height,
        0x6d18f8
      )
      .setOrigin(0, 0.5);

    this.loadingText = this.add
      .text(getGameWidth(this) / 2, getGameHeight(this) / 2 - 32, "Loading...")
      .setFontSize(24)
      .setOrigin(0.5);
  };

  /**
   * Iterates through each file in the assets array
   */
  private loadNextFile = (index: number) => {
    const file = assets[index];
    this.loadIndex++;

    if (this.loadingText && this.progressBar && this.progressBarContainer) {
      this.loadingText.setText(`Loading: ${file.key}`);
      this.progressBar.width =
        (this.progressBarContainer.width / assets.length) * index;
    }

    switch (file.type) {
      case "IMAGE":
        this.load.image(file.key, file.src);
        break;
      case "SVG":
        this.load.svg(file.key, file.src);
        break;
      case "AUDIO":
        this.load.audio(file.key, [file.src]);
        break;
      case "SPRITESHEET":
        this.load.spritesheet(
          file.key,
          file.src,
          (file as SpritesheetAsset).data
        );
        break;
      default:
        break;
    }
  };

  /**
   * Constructs and loads in the Aavegotchi spritesheet, you can use customiseSVG() to create custom poses and animations
   */
  private loadInGotchiSpritesheet = async (
    gotchiObject: AavegotchiGameObject, startLoader: boolean,
  ) => {
    if (!gotchiObject.svg) {
      alert('No svg data for ' + gotchiObject.id);
    } else {
      const svg = gotchiObject.svg;
      const spriteMatrix = [
        // front
        [
          customiseSvg(svg[0], { removeBg: true }),
          customiseSvg(svg[0], {
            armsUp: true,
            eyes: "happy",
            float: true,
            removeBg: true,
          }),
        ],
        // Left
        [
          customiseSvg(svg[1], { removeBg: true }),
          customiseSvg(svg[1], {
            armsUp: true,
            eyes: "happy",
            float: true,
            removeBg: true,
          }),
        ],
        // back
        [
          customiseSvg(svg[2], { removeBg: true }),
          customiseSvg(svg[2], {
            armsUp: true,
            eyes: "happy",
            float: true,
            removeBg: true,
          }),
        ],
        // Right
        [
          customiseSvg(svg[3], { removeBg: true }),
          customiseSvg(svg[3], {
            armsUp: true,
            eyes: "happy",
            float: true,
            removeBg: true,
          }),
        ]
      ];

      const { src, dimensions } = await constructSpritesheet(spriteMatrix);
      try {
        this.load.spritesheet(gotchiObject.spritesheetKey, src, {
          frameWidth: dimensions.width / dimensions.x,
          frameHeight: dimensions.height / dimensions.y,
        });
      } catch (err: any) {
        alert(err.message);
        alert("Offending Gotchi: " + gotchiObject.name + " at address " + gotchiObject.owner);
      }

      if (startLoader) this.load.start();
    }
  };

  // load function for random gotchis
  private loadInRandomGotchiSpritesheet = async (
    gotchiObject: AavegotchiGameObject, startLoader: boolean,
  ) => {
    if (!gotchiObject.svg && this.randomGotchis && this.randomLoadCounter < this.randomGotchis.length) {
      // alert("No svg data for " + gotchiObject.id);
      this.randomLoadCounter++;
      this.loadInRandomGotchiSpritesheet(this.randomGotchis[this.randomLoadCounter], true);
    } else if (gotchiObject.svg) {
      const svg = gotchiObject.svg;
      const spriteMatrix = [
        // front_normal
        [
          customiseSvg(svg[0], { removeBg: true }),
          customiseSvg(svg[0], { float: true, removeBg: true, }),
        ],
        // left_normal
        [
          customiseSvg(svg[1], { removeBg: true }),
          customiseSvg(svg[1], { float: true, removeBg: true, }),
        ],
        // back_normal
        [
          customiseSvg(svg[2], { removeBg: true }),
          customiseSvg(svg[2], { float: true, removeBg: true, }),
        ],
        // right_normal
        [
          customiseSvg(svg[3], { removeBg: true }),
          customiseSvg(svg[3], { float: true, removeBg: true, }),
        ],
        // front_happy
        [
          customiseSvg(svg[0], { armsUp: true, eyes: "happy", float: false, removeBg: true, }),
          customiseSvg(svg[0], { armsUp: true, eyes: "happy", float: true, removeBg: true, }),
        ],
        // left_happy
        [
          customiseSvg(svg[1], { armsUp: true, eyes: "happy", float: false, removeBg: true, }),
          customiseSvg(svg[1], { armsUp: true, eyes: "happy", float: true, removeBg: true, }),
        ],
        // back_happy
        [
          customiseSvg(svg[2], { armsUp: true, eyes: "happy", float: false, removeBg: true, }),
          customiseSvg(svg[2], { armsUp: true, eyes: "happy", float: true, removeBg: true, }),
        ],
        // right_happy
        [
          customiseSvg(svg[3], { armsUp: true, eyes: "happy", float: false, removeBg: true, }),
          customiseSvg(svg[3], { armsUp: true, eyes: "happy", float: true, removeBg: true, }),
        ],
      ];

      const { src, dimensions } = await constructSpritesheet(spriteMatrix);
      try {
        this.load.spritesheet(gotchiObject.spritesheetKey, src, {
          frameWidth: dimensions.width / dimensions.x,
          frameHeight: dimensions.height / dimensions.y,
        });
      } catch (err: any) {
        alert(err.message);
        alert("Offending Gotchi: " + gotchiObject.name + " at address " + gotchiObject.owner);
      }

      if (startLoader) this.load.start();
    }
  };
}
