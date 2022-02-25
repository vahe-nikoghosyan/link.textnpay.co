import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyBeG0nUWIlrcYvQMZBQ-cR6fmYSDUD6cFw",
    authDomain: "paiboard.firebaseapp.com",
    databaseURL: "https://paiboard.firebaseio.com",
    projectId: "paiboard",
    storageBucket: "paiboard.appspot.com",
    messagingSenderId: "817162207908",
    appId: "1:817162207908:web:8eec0480fd922b0cf3dc31",
    measurementId: "G-QFBKNK11J1"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// export default app
