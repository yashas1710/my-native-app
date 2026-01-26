// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgv3LPwD2WfQCEDrKFSTDaUtd3SfvOTCk",
  authDomain: "unplango-app-b3db1.firebaseapp.com",
  projectId: "unplango-app-b3db1",
  storageBucket: "unplango-app-b3db1.appspot.com",   //fixed this
  messagingSenderId: "675941417104",
  appId: "1:675941417104:web:24492d7d5de6fd46f3d815",
  measurementId: "G-GTD1W3FFCR"
};

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Storage 
export const storage = getStorage(app);

// Auth with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to local");
  })
  .catch((err) => {
    console.error("Auth persistence error:", err);
  });
