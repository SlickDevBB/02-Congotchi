// server.ts
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
// require('dotenv').config();
import { Socket } from 'socket.io';


import { POINTS_SAVE_GOTCHI,
  POINTS_SAVE_ROFL_COMMON,
  POINTS_CONGA_JUMP,
  POINTS_EXPLODE_GRENADE,
  POINTS_DESTROY_CACTII,
  POINTS_SLURP_MILKSHAKE,
  POINTS_SPARE_MOVE, 
  POINTS_BURN_DAMAGE} from './src/constants';


const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const port = process.env.PORT || 8080;
const connectedGotchis = {};
const levelData = [];
import { LevelConfig, levels } from './src/level-configs';

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

let isPreviewGotchi = false;

io.on('connection', function (socket: Socket) {
    const userId = socket.id;

    console.log('A user connected: ' + userId);
    connectedGotchis[userId] = {id: userId};

    console.log('And server running in ' + process.env.NODE_ENV);

    socket.on('handleDisconnect', () => {
      socket.disconnect();
    })

    socket.on('setGotchiData', (gotchi) => {
      connectedGotchis[userId].gotchi = gotchi;

      // check if we've got a preview gotchi
      isPreviewGotchi = connectedGotchis[userId].gotchi.tokenId === 'OG' || connectedGotchis[userId].gotchi.tokenId === 'None' || connectedGotchis[userId].gotchi.tokenId === 'l33T';
    })

    socket.on('disconnect', function () {
      console.log('A user disconnected: ' + userId);
      isPreviewGotchi = false;
      delete connectedGotchis[userId];
    });

    // fetchProgressData() makes a call to firebase to establish:
    // - currentLevel = last level played by user
    // - unlockedLevels = number of levels unlocked by user
    // - levelScores = scores on each level for users selected gotchi
    socket.on('fetchProgressData', async () => {
      // check if we're using a preview gotchi, if so respond with level 1, 1 and return
      if (isPreviewGotchi) {
        socket.emit('fetchProgressDataResponse', 
          1, 1, [], levels,
        );
        return;
      }

      // array for level scores
      const levelScores = [];
      try {
        console.log('Fetching previous progress data...');

        // get address ref and doc
        const addressRef = db.collection(process.env.DB_USER_COLLECTION).doc(connectedGotchis[userId].gotchi.owner.id.toString());
        const addressDoc = await addressRef.get();

        const levelDataRef = db.collection(process.env.DB_GOTCHI_COLLECTION).doc(connectedGotchis[userId].gotchi.tokenId.toString()).collection('levelData');
        const levelDataColl = await levelDataRef.get();
    
        // fill out the levelData object
        let i = 0;
        levelDataColl.forEach( doc => {
          levelScores[i] = {
            levelNumber: doc.data().levelNumber,
            highScore: doc.data().highScore,
            stars: doc.data().stars,
          }
          i++;
        });

        // emit our data
        socket.emit('fetchProgressDataResponse', 
          addressDoc.exists ? addressDoc.data().currentLevel : 1,
          addressDoc.exists ? addressDoc.data().unlockedLevels : 1,
          levelScores,
          levels
        );

        // output what we've sent out
        console.log("Current Level: " + addressDoc.exists ? addressDoc.data().currentLevel : 1);
        console.log("Unlocked Levels: " + addressDoc.exists ? addressDoc.data().unlockedLevels : 1);
        console.log('Previous score history for "' +connectedGotchis[userId].gotchi.name + '"')
        console.log(levelScores);
        
      } catch (err) {
        console.log(err);
      }
    })

    // setCurrentLevel() sets the current level in database for when the game is loaded in the future
    socket.on('saveCurrentLevel', async (levelNumber) => {
      // if preview gotchi return
      if (isPreviewGotchi) return;

      console.log('Attempting to set current level to: ' + levelNumber);
      const saveOwner = connectedGotchis[userId].gotchi.owner.id;
      try {
        // get address ref and doc
        const addressRef = db.collection(process.env.DB_USER_COLLECTION).doc(saveOwner.toString());
        const addressDoc = await addressRef.get();

        // if we've got an existing address use the existing unlocked levels data
        if (addressDoc.exists) {
          const docData = { 
            owner: saveOwner,
            unlockedLevels: addressDoc.data().unlockedLevels,
            currentLevel: levelNumber,
          }
          await addressRef.set(docData);
        } else {
          const docData = { 
            owner: saveOwner,
            unlockedLevels: 1,
            currentLevel: 1,
          }
          await addressRef.set(docData);
        }
      } catch (err) {
        console.log(err);
      }
    });

    // setUnlockedLevels() sets how many levels unlocked
    socket.on('setUnlockedLevels', async (unlockedLevels) => {
      // if preview gotchi return
      if (isPreviewGotchi) return;

      console.log('Setting unlocked level number...');
      try {
        // try get a new address ref and doc
        const addressRef = db.collection(process.env.DB_USER_COLLECTION).doc(connectedGotchis[userId].gotchi.owner.id.toString());
        const addressDoc = await addressRef.get();
        
        // create a new address data boject
        const addressData = { 
          owner: connectedGotchis[userId].gotchi.owner.id,
          unlockedLevels: unlockedLevels,
          currentLevel: unlockedLevels-1, // we'll be on the level one less than unlocked level number
        }
        
        // set the new unlocked level number
        await addressRef.set(addressData);

      } catch (err) {
        console.log(err);
      }
    })

    // setHighScore() tries to update the high score when a level completes
    socket.on('setHighScore', async (level, score, stars) => {
      // if preview gotchi return
      if (isPreviewGotchi) return;
      
      console.log('Level complete, attempting to submit new score...')

      // construct a high score data object to be submitted
      const highScoreData = { tokenId: connectedGotchis[userId].gotchi.tokenId, name: connectedGotchis[userId].gotchi.name,
        level, score, stars, }
      
      // try set the new highscore
      try {
        // get the existing doc ref and actual doc for current gotchis level data
        const levelRef = db.collection(process.env.DB_GOTCHI_COLLECTION+'/').doc(highScoreData.tokenId.toString()).collection('/levelData/').doc(level.toString());
        const levelDoc = await levelRef.get();
        
        // if no existing data or highscore is less than score achieved we need to write a new score
        if (!levelDoc.exists || levelDoc.data().highScore < score) {
          console.log('New high score! Writing to database');

          const deltaScore = score - (levelDoc.exists ? levelDoc.data().highScore : 0);

          // create a new document data object to be written
          const docData = { name: highScoreData.name, levelNumber: level, highScore: score, stars: stars, };

          // try write to the doc ref
          try {
            await levelRef.set(docData);
            console.log('Successfully wrote new level data and high score. Updating total score...');

            // we now also have to update our total score by the delta of new high score - old score
            const gotchiRef = db.collection(process.env.DB_GOTCHI_COLLECTION).doc(connectedGotchis[userId].gotchi.tokenId.toString());
            const gotchiDoc = await gotchiRef.get();

            if (gotchiDoc.exists) {
              await gotchiRef.set( { tokenId: connectedGotchis[userId].gotchi.tokenId, score: gotchiDoc.data().score + deltaScore, name: connectedGotchis[userId].gotchi.name})
            } else {
              await gotchiRef.set( { tokenId: connectedGotchis[userId].gotchi.tokenId, score: score, name: connectedGotchis[userId].gotchi.name });
            }

            return {
              status: 200,
              error: undefined,
            }
          } catch (err) {
            console.log(`Error writing new level data: ${err}`)
            return {
              status: 400,
              error: err,
            }
          }

          

        } else {
          // we didn't beat high score so just send a note to the console and return.
          console.log('Previous score not beaten, no write to database.')
          return {
            status: 200,
            error: undefined,
          }
        }
      } catch (err) {
        console.log(`Error reading level from database: ${err}`);
        return {
          status: 400,
          error: err,
        }
      }
    });

    // actions for tracking score
    socket.on('gridObjectMoved', () => {
      connectedGotchis[userId].actionsRemaining--;
      console.log('Actions Remaining: ' + connectedGotchis[userId].actionsRemaining);
      socket.emit('updateActionsRemaining', connectedGotchis[userId].actionsRemaining);
    });

    // on level start
    socket.on('levelStarted', (levelNumber: number) => {
      const level: LevelConfig = levels[levelNumber-1];

      if (level) {
        connectedGotchis[userId].actionsRemaining = level.actionsRemaining;
        connectedGotchis[userId].score = 0;

        // Output some level started data
        console.log('Started Level: ' + levelNumber);
        console.log('Action Points Allowed: ' + level.actionsRemaining);
        console.log('Max Possible Score: ' + level.maxPointsPossible);

        // tell the game about the new score and actions remaining
        socket.emit('updateScore', connectedGotchis[userId].score);
        socket.emit('updateActionsRemaining', connectedGotchis[userId].actionsRemaining);
      }
    });

    socket.on('levelFinished', () => {
      connectedGotchis[userId].score += POINTS_SPARE_MOVE * connectedGotchis[userId].actionsRemaining;
    })

    // now go through all the functions that score points
    socket.on('saveGotchi', () => {
      connectedGotchis[userId].score += POINTS_SAVE_GOTCHI;
      socket.emit('updateScore', connectedGotchis[userId].score);
    });

    socket.on('saveCommonRofl', () => {
      connectedGotchis[userId].score += POINTS_SAVE_ROFL_COMMON;
    });

    socket.on('congaJump', () => {
      connectedGotchis[userId].score += POINTS_CONGA_JUMP;
    });

    socket.on('explodeGrenade', () => {
      connectedGotchis[userId].score += POINTS_EXPLODE_GRENADE;
    });

    socket.on('destroyCactii', () => {
      connectedGotchis[userId].score += POINTS_DESTROY_CACTII;
    });

    socket.on('cactiiSpike', () => {
      connectedGotchis[userId].score += POINTS_DESTROY_CACTII;
    });

    socket.on('burnDamage', () => {
      connectedGotchis[userId].score += POINTS_BURN_DAMAGE;
    });

    socket.on('slurpMilkshake', () => {
      connectedGotchis[userId].score += POINTS_SLURP_MILKSHAKE;
    });

});

http.listen(port, function () {
    console.log(`Listening on - PORT:${port}`);
});