import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCw5AMIJrPUi8fl-DJLXBgioKiy7Fm8mUU",
    authDomain: "todo-list-de5ed.firebaseapp.com",
    projectId: "todo-list-de5ed",
    storageBucket: "todo-list-de5ed.appspot.com",
    messagingSenderId: "389088808104",
    appId: "1:389088808104:web:a1e625225861081f46469d",
    measurementId: "G-M9CN3ZKXMF"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, db };
