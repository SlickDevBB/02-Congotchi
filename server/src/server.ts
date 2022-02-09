// server.ts
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
// require('dotenv').config();
import { Socket } from 'socket.io';

import { levels } from './levels';

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

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// create a level data score submission object
interface ScoreSubmission {
  tokenId: string,
  name: string,
  level: number,
  score: number,
  stars: number,
}

let isPreviewGotchi = false;

io.on('connection', function (socket: Socket) {
    // store userId and connected gotchi
    const userId = socket.id;
    connectedGotchis[userId] = {id: userId};

    // output data to console
    console.log('A user connected: ' + userId);
    console.log('Server running in "' + process.env.NODE_ENV + '" mode.');

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
          1, 1, [],
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

        const currentLevel = addressDoc.exists ? addressDoc.data().currentLevel : 1;
        const unlockedLevels = addressDoc.exists ? addressDoc.data().unlockedLevels : 1;

        // emit our data
        socket.emit('fetchProgressDataResponse', currentLevel, unlockedLevels, levelScores);

        // store data in our connected gotchi
        connectedGotchis[userId].unlockedLevels = unlockedLevels;

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
    const setUnlockedLevels = async (unlockedLevels) => {
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
    }

    // setHighScore() tries to update the high score when a level completes
    socket.on('setHighScore', async (level, score, stars) => {
      // if preview gotchi return as we don't log scores
      if (isPreviewGotchi) return;

      // if level being submitted is higher than what is unlocked, return and call out cheating
      if (level > connectedGotchis[userId].unlockedLevels) {
        alert("You haven't unlocked level " + level + " yet!");
        return;
      }

      // if level is higher than what exists, call out cheating
      if (level > levels.length) {
        alert("Level " + level + " hasn't been created yet!");
        return;
      }
      
      // ok output that level is complete and try submit new score
      console.log('Level complete, attempting to submit new score...')

      // construct a high score data object to be submitted
      const highScoreData = { tokenId: connectedGotchis[userId].gotchi.tokenId, name: connectedGotchis[userId].gotchi.name,
        level, score, stars, }

      // if we are on the last level and stars > 0 we can unlock the next level
      if (stars > 0 && level === connectedGotchis[userId].unlockedLevels) {
        setUnlockedLevels(level+1);
      }
      
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

      // finally do a check and see if we need to update the number of unlocked levels

    })

    // getLevelConfigs() returns the level config object to the client
    socket.on('getLevelConfigs', () => {
      socket.emit('getLevelConfigsResponse', levels);
    })

});

http.listen(port, function () {
    console.log(`Listening on - PORT:${port}`);
});

