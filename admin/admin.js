// ================================================
// ELDEEB STORE — Main Admin Orchestrator
// ================================================

import { auth, onAuthStateChanged, doLogin, doLogout } from './js/admin-auth.js';
import { loadAdminProducts, saveProduct, deleteProduct, toggleStock } from './js/admin-products.js';
import { adminToast } from './js/admin-toast.js';

// Setup Auth state observer
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';
    const emailEl = document.getElementById('admin-email-display');
    if (emailEl) emailEl.textContent = user.email;
    await loadAdminProducts();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-app').style.display = 'none';
  }
});

window.showPage = function(pageId) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(`'${pageId}'`)) btn.classList.add('active');
  });

  document.getElementById('admin-sidebar')?.classList.remove('open');
};

window.toggleSidebar = function() {
  document.getElementById('admin-sidebar')?.classList.toggle('open');
};
