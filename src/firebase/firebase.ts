import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBw_PtAi_liZifbsJKRijvE4SpG3wdJ5Gg",
  authDomain: "burgerlendar.firebaseapp.com",
  projectId: "burgerlendar",
  storageBucket: "burgerlendar.appspot.com",
  messagingSenderId: "274471444744",
  appId: "1:274471444744:web:55952acc217ae738ae4cbd"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firestore = getFirestore(app);

