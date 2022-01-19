// go-inactive.ts - just a place keeper class to hold the 'inactive' type

import { GO_Props, GridObject } from 'game/objects';

export class GO_Inactive extends GridObject {

    constructor({ scene, gridLevel, gridRow, gridCol, key, gridSize }: GO_Props) {
        super({scene, gridLevel, gridRow, gridCol, key, gridSize, objectType: 'INACTIVE'});

        // just make inactive objects completely invisible
        this.setVisible(false);
    }

    update(): void {
        // do stuff
    }
}
  