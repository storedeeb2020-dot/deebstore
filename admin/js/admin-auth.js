// ================================================
// 🔐 Admin Auth Module
// ================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
export const auth = getAuth(app);

export async function doLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const pass = document.getElementById('login-pass')?.value;
  const btnText = document.getElementById('login-btn-text');
  const errDiv = document.getElementById('login-error');

  if (btnText) btnText.textContent = 'جاري الدخول...';
  if (errDiv) errDiv.style.display = 'none';

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch(e) {
    const msgs = {
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
      'auth/invalid-email': 'البريد الإلكتروني غير صالح',
      'auth/too-many-requests': 'كثير من المحاولات. انتظر قليلاً',
    };
    if (errDiv) {
      errDiv.textContent = msgs[e.code] || 'خطأ في تسجيل الدخول';
      errDiv.style.display = 'block';
    }
  } finally {
    if (btnText) btnText.textContent = 'دخول';
  }
}

export async function doLogout() {
  await signOut(auth);
}

window.doLogin = doLogin;
window.doLogout = doLogout;
