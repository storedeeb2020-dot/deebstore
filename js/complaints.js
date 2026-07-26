// ================================================
// 📬 Complaint & Support Form Module
// ================================================

import { db } from './firebase-config.js';
import { showToast } from './toast.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function openComplaint() {
  const overlay = document.getElementById('complaint-overlay');
  const modal = document.getElementById('complaint-modal');
  if (overlay) {
    overlay.classList.add('open');
    overlay.style.display = 'flex';
  }
  if (modal) modal.style.display = 'block';
}

export function closeComplaint() {
  const overlay = document.getElementById('complaint-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
  }
}

export async function submitComplaint() {
  const name = document.getElementById('comp-name')?.value.trim();
  const email = document.getElementById('comp-email')?.value.trim();
  const type = document.getElementById('comp-type')?.value;
  const msg = document.getElementById('comp-msg')?.value.trim();

  if (!name || !email || !msg) {
    showToast('⚠️ أكمل جميع الحقول المطلوبة', 'warning');
    return;
  }

  try {
    await addDoc(collection(db, 'complaints'), {
      name, email, type, message: msg,
      read: false,
      createdAt: serverTimestamp()
    });
    showToast('✅ تم إرسال رسالتك بنجاح', 'success');
    if (document.getElementById('comp-name')) document.getElementById('comp-name').value = '';
    if (document.getElementById('comp-email')) document.getElementById('comp-email').value = '';
    if (document.getElementById('comp-msg')) document.getElementById('comp-msg').value = '';
    closeComplaint();
  } catch(e) {
    showToast('❌ حدث خطأ في الإرسال', 'error');
    console.error(e);
  }
}

window.openComplaint = openComplaint;
window.closeComplaint = closeComplaint;
window.submitComplaint = submitComplaint;
