// ================================================
// 🚨 Automatic Error Tracking Module
// ================================================

import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function initErrorLogger() {
  window.onerror = async (msg, src, line, col, err) => {
    try {
      await addDoc(collection(db, 'errors'), {
        message: msg, source: src, line, col,
        error: err ? err.toString() : '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });
    } catch(e) { /* silent fallback */ }
  };

  window.onunhandledrejection = async (e) => {
    try {
      await addDoc(collection(db, 'errors'), {
        message: 'Unhandled Promise Rejection',
        error: e.reason ? e.reason.toString() : '',
        url: window.location.href,
        timestamp: serverTimestamp()
      });
    } catch(x) { /* silent fallback */ }
  };
}
