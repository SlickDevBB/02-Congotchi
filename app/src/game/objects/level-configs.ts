// level-configs.ts
// this file defines all the different levels

// upon creation, each grid level should be passed this "levels" config object that defines how to set all the levels up
// the config will be a 2d matrix that defines what element will be in each grid cell initially

// 0 = no grid cell
// 1 = empty grid cell

// 2 = gotchi down
// 3 = gotchi left
// 4 = gotchi up
// 5 = gotchi right

// 6 = portal

// 7 = grenade
// 8 = milkshake

export interface LevelConfig {
    levelNumber: number,
    gridObjectLayout: Array<number[]>,
    levelDescription: string,
}

export const levels: Array<LevelConfig> = [
    {
        levelNumber: 1,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 2, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 2, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 2, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 6, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        'Welcome aadventurer! Our frens are lost throughout the gotchiverse and we need your help to save them!' +
        "\n\n" +
        'Tip: Arrange gotchis into conga lines and open portals to bring them home :)'
    },
    {
        levelNumber: 2,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 3, 3, 5, 0, 0],
        [0, 0, 6, 2, 2, 1, 4, 0, 0],
        [0, 0, 1, 1, 1, 1, 4, 0, 0],
        [0, 0, 1, 1, 1, 5, 5, 0, 0],
        [0, 0, 1, 2, 5, 4, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "Phew! So far so good. The GRID is a bit more dangerous though and you'll need to learn how to spin." +
        "\n\n" +
        "Tip: Single click on gotchis to point them in the right direction",
    },
    {
        levelNumber: 3,
        gridObjectLayout: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 8, 1, 1, 0],
        [0, 1, 3, 1, 1, 1, 1, 1, 0],
        [0, 0, 3, 1, 1, 1, 1, 0, 0],
        [0, 0, 4, 1, 2, 2, 4, 0, 0],
        [0, 0, 5, 1, 1, 6, 1, 0, 0],
        [0, 1, 1, 8, 1, 1, 4, 1, 0],
        [0, 1, 1, 1, 1, 1, 2, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: 
        "The DAARK FOREST beckons... but on the way there, keep your eyes peeled for milkshakes." +
        "\n\n" +
        "Tip: Position shakes next to gotchis and click them to give nearby frens a boost!"
    },
    {
        levelNumber: 4,
        gridObjectLayout: [
        [0, 0, 0, 1, 2, 1, 0, 0, 0],
        [0, 1, 1, 7, 6, 1, 1, 1, 0],
        [0, 1, 7, 2, 7, 1, 1, 1, 0],
        [0, 0, 1, 4, 1, 1, 1, 0, 0],
        [0, 0, 1, 3, 1, 7, 2, 0, 0],
        [0, 0, 1, 2, 1, 7, 2, 0, 0],
        [0, 7, 7, 1, 7, 1, 4, 5, 0],
        [0, 6, 7, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        ],
        levelDescription: 
        "A final test before we enter the DAARK FOREST. This level is littered with grenades!" +
        "\n\n" +
        "Tip: BEFORE you open any portals PLEASE make sure grenades are moved far away from your frens!"
    },
    {
        levelNumber: 5,
        gridObjectLayout: [
        [0, 0, 0, 1, 4, 1, 0, 0, 0],
        [0, 0, 1, 3, 1, 7, 1, 0, 0],
        [0, 1, 3, 0, 1, 0, 1, 1, 0],
        [0, 1, 7, 0, 1, 0, 2, 1, 0],
        [0, 2, 4, 1, 6, 5, 8, 5, 0],
        [0, 8, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 1, 2, 1, 2, 1, 0],
        [0, 1, 0, 4, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        levelDescription: "The TREE OF FUD! OK fren... no need to panic... it's just a smiling, giant, purple, terrifying, gotchi eating tree..." +
        "\n\n" +
        "Tip: Use all your skills to get our frens home safely!"
    }
];