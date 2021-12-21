import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import { SubmitScoreReq, HighScore } from 'types';
import fb from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID,
 };

interface IServerContext {
  highscores?: Array<HighScore>;
  handleSubmitScore?: (
    score: number,
    gotchiData: SubmitScoreReq
  ) => void;
}

export const ServerContext = createContext<IServerContext>({});

export const ServerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [highscores, setHighscores] = useState<Array<HighScore>>();
  const [firebase, setFirebase] = useState<fb.app.App>();

  const sortByScore = (a: HighScore, b: HighScore) => b.score - a.score;

  const converter = {
    toFirestore: (data: HighScore) => data,
    fromFirestore: (snap: fb.firestore.QueryDocumentSnapshot) =>
      snap.data() as HighScore,
  }

  useEffect(() => {
    const getHighscores = async (_firebase: fb.app.App) => {
      const db = _firebase.firestore();
      const highscoreRef = db
        .collection("gotchis")
        .withConverter(converter);
      const snapshot = await highscoreRef.get();

      const highscoreResults: Array<HighScore> = [];
      snapshot.forEach((doc) => highscoreResults.push(doc.data()));
      setHighscores(highscoreResults.sort(sortByScore));
    };

    if (!firebase) {
      const firebaseInit = fb.initializeApp(firebaseConfig);
      setFirebase(firebaseInit);
      getHighscores(firebaseInit);
    }
  }, [firebase]);

  return (
    <ServerContext.Provider
      value={{
        highscores,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
 };

 export const useServer = () => useContext(ServerContext);