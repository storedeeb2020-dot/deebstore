// ================================================
// ELDEEB STORE — Main Modular Orchestrator
// ================================================

import { logEvent, analytics } from './js/firebase-config.js';
import { initErrorLogger } from './js/error-logger.js';
import { initIntro } from './js/intro.js';
import { loadSettings } from './js/settings.js';
import { loadCategories } from './js/categories.js';
import { loadProducts } from './js/products.js';
import { updateCartBadge } from './js/cart.js';
import { updateWishlistBadge } from './js/wishlist.js';
import { initGSAP } from './js/animations.js';

// Navbar scroll listener
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
});

// App Initialization
async function init() {
  initErrorLogger();
  initIntro();
  initGSAP();

  await loadSettings();
  await loadCategories();
  await loadProducts();

  updateCartBadge();
  updateWishlistBadge();

  logEvent(analytics, 'page_view', { page_title: 'Home' });
}

init();
