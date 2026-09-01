import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFfv8Z24e4umpVy1MViSFPof_MjSKq92M",
  authDomain: "smart-halkhata.firebaseapp.com",
  projectId: "smart-halkhata",
  storageBucket: "smart-halkhata.firebasestorage.app",
  messagingSenderId: "276951365189",
  appId: "1:276951365189:web:f7b0e4df015e4907f4d52c",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);