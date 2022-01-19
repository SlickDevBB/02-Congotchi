// go-empty.ts - basic empty class, main just need it for the type

import { GO_Props, GridObject, } from 'game/objects';

  
export class GO_Empty extends GridObject {

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize, }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize, objectType: 'EMPTY'});

        // empty objects should just be invisible
        this.setVisible(false);
    }

    update(): void {
        // Do stuff
    }
}
  