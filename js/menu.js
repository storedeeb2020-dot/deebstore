// ================================================
// ☰ Navigation Menu Drawer Module
// ================================================

export function openMenu() {
  document.getElementById('menu-drawer')?.classList.add('open');
  document.getElementById('menu-overlay')?.classList.add('active');
}

export function closeMenu() {
  document.getElementById('menu-drawer')?.classList.remove('open');
  document.getElementById('menu-overlay')?.classList.remove('active');
}

window.openMenu = openMenu;
window.closeMenu = closeMenu;
