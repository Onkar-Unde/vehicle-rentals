import { initializeApp } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCA_WPPwciit3qpFwTDy1Krdmq0aQoks3o",
    authDomain: "car-bike-rentalswebapp.firebaseapp.com",
    projectId: "car-bike-rentalswebapp",
    storageBucket: "car-bike-rentalswebapp.appspot.com",
    messagingSenderId: "899988377829",
    appId: "1:899988377829:web:c2664058a74472275ec40c",
};


const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

export { db };