
// bring in firebase stuff
const serviceAccount = require('./service-account.json');
const admin = require('firebase-admin');
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

interface ScoreSubmission {
  tokenId: string,
  name: string,
  level: number,
  score: number,
  stars: number,
}

const submitScore = async ({tokenId, name, level, score, stars}: ScoreSubmission) => {
 const gotchiCollection = db.collection('test-gotchi-collection');
 const gotchiDoc = gotchiCollection.doc(tokenId);
 const levelCollection = gotchiDoc.collection('level');
 const levelDoc = await levelCollection.get().catch(err => {return {status: 400, error: err}});

 if ('error' in levelDoc) return levelDoc;

 if (!levelDoc.exists || levelDoc.data().score < score) {
   try {
     await levelCollection.set({
       tokenId,
       name,
       level,
       score,
       stars
     });
     return {
       status: 200,
       error: undefined
     }
   } catch (err) {
     return {
       status: 400,
       error: err
     };
   }
 } else {
   return {
     status: 400,
     error: "Score not larger than original"
   }
 }
}

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
import { Socket } from 'socket.io';
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

io.on('connection', function (socket: Socket) {
    const userId = socket.id;

    console.log('A user connected: ' + userId);
    connectedGotchis[userId] = {id: userId};

    socket.on('handleDisconnect', () => {
      socket.disconnect();
    })

    socket.on('setGotchiData', (gotchi) => {
      connectedGotchis[userId].gotchi = gotchi;
    })

    socket.on('disconnect', function () {
      console.log('A user disconnected: ' + userId);
      delete connectedGotchis[userId];
    });

    // add our logic for level start and finish
    socket.on('levelStarted', () => {
      console.log('level started!');
    });

    socket.on('levelOver', async ({level, score, stars}: {level: number, score: number, stars: number}) => {
      console.log('level over!');
      const highscoreData = {
        tokenId: connectedGotchis[userId].gotchi.tokenId,
        name: connectedGotchis[userId].gotchi.name,
        level,
        score,
        stars,
      }
      console.log("Submit score: ", highscoreData);
  
      try {
        const res = await submitScore(highscoreData);
        if (res.status !== 200) throw res.error;
        console.log("Successfully updated database");
      } catch (err) {
        console.log(err);
      }
    })
});

http.listen(port, function () {
    console.log(`Listening on - PORT:${port}`);
});

