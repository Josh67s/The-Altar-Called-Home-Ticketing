// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getFunctions,
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-functions.js";

import {

    getAuth,

    onAuthStateChanged,

    signInWithEmailAndPassword,

    signOut

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {

    apiKey: "AIzaSyC7fniSXD59e8i075WMRigstpKXSjOCDHA",

    authDomain: "the-altar-called-home-tickets.firebaseapp.com",

    projectId: "the-altar-called-home-tickets",

    storageBucket: "the-altar-called-home-tickets.firebasestorage.app",

    messagingSenderId: "489275007247",

    appId: "1:489275007247:web:3490cd4b1eb97cf24b9e7a"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const functions = getFunctions(app);

const auth = getAuth(app);

// Export Firestore
export {

    db,
    auth,
    functions,
    httpsCallable,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp

};