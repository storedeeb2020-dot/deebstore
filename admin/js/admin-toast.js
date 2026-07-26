// ================================================
// 🔔 Admin Toast Notification Module
// ================================================

export function adminToast(msg, type = 'info') {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:50%;transform:translateX(50%);z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;width:90%;max-width:360px';
    document.body.appendChild(container);
  }
  const colors = { success:'rgba(67,160,71,0.9)', error:'rgba(229,57,53,0.9)', info:'rgba(30,136,229,0.9)', warning:'rgba(251,140,0,0.9)' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:${colors[type]||colors.info};color:#fff;padding:12px 20px;border-radius:8px;font-family:Cairo,sans-serif;font-size:0.9rem;font-weight:600;pointer-events:all;animation:fadeIn 0.3s ease`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; setTimeout(()=>toast.remove(),300); }, 3000);
}

window.adminToast = adminToast;
