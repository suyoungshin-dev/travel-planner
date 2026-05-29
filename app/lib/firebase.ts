import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-funV5m2Yji5pdPgk9pxS4Qv0x2X_7N0",
  authDomain: "travel-eleven-8bdab.firebaseapp.com",
  projectId: "travel-eleven-8bdab",
  storageBucket: "travel-eleven-8bdab.firebasestorage.app",
  messagingSenderId: "286500270664",
  appId: "1:286500270664:web:a2b96934212562e4fa9e7d",
  measurementId: "G-BBNJVFKRQ4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);