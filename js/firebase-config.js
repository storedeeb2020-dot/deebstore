// ================================================
// 🔴 Firebase Configuration & Initialization
// ================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGbFTxHQuEqb9X8XN4OMhARbzoD3yvxX4",
  authDomain: "deebstore-c8bfa.firebaseapp.com",
  projectId: "deebstore-c8bfa",
  storageBucket: "deebstore-c8bfa.firebasestorage.app",
  messagingSenderId: "213870702317",
  appId: "1:213870702317:web:af638fc4a61728c4ba26e4",
  measurementId: "G-YK5MM1JYNE"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export { logEvent };
