import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "na-kirraak-adda.firebaseapp.com",
  projectId: "na-kirraak-adda",
  storageBucket: "na-kirraak-adda.firebasestorage.app",
  messagingSenderId: "835723013490",
  appId: "1:835723013490:web:3576e4f370a6a6480881eb",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);