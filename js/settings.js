// ================================================
// ⚙️ WordPress-style Site Settings Module
// ================================================

import { db } from './firebase-config.js';
import { state } from './state.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loadSettings() {
  try {
    const docRef = doc(db, 'settings', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      state.settings = snap.data();
    } else {
      state.settings = {
        storeName: 'ELDEEB STORE',
        heroTitle: 'ارتقِ بأسلوبك',
        heroSubtitle: 'أفخر ملابس الستريت وير — تصميم يليق بك',
        whatsapp: '',
        freeShippingMin: 2000,
        defaultShippingPrice: 60,
        goldColor: '#D4AF37',
        facebook: 'https://www.facebook.com/share/1BeVGnopec/',
        instagram: 'https://www.instagram.com/eldeeb_st0re',
        tiktok: '',
        chatbotEndpoint: '',
      };
      await setDoc(docRef, state.settings);
    }
    applySettings();
  } catch(e) {
    console.error('Settings load error:', e);
    state.settings = { storeName: 'ELDEEB STORE', heroTitle: 'ارتقِ بأسلوبك', heroSubtitle: 'أفخر ملابس الستريت وير', freeShippingMin: 2000, defaultShippingPrice: 60 };
    applySettings();
  }
}

export function applySettings() {
  const s = state.settings;
  if (!s) return;

  const name = s.storeName || 'ELDEEB STORE';
  document.title = `${name} | متجر الديب`;
  const footerName = document.getElementById('footer-store-name');
  if (footerName) footerName.textContent = name;

  const heroTitle = document.getElementById('hero-title');
  const heroSub = document.getElementById('hero-subtitle');
  if (heroTitle && s.heroTitle) heroTitle.textContent = s.heroTitle;
  if (heroSub && s.heroSubtitle) heroSub.textContent = s.heroSubtitle;

  const waLink = document.getElementById('whatsapp-link');
  if (waLink && s.whatsapp) {
    waLink.href = `https://wa.me/${s.whatsapp.replace(/\D/g,'')}`;
  }

  if (s.goldColor) {
    document.documentElement.style.setProperty('--gold', s.goldColor);
  }

  const menuFb = document.getElementById('menu-fb');
  const menuIg = document.getElementById('menu-ig');
  const menuTt = document.getElementById('menu-tt');
  if (menuFb && s.facebook) menuFb.href = s.facebook;
  if (menuIg && s.instagram) menuIg.href = s.instagram;
  if (menuTt && s.tiktok) menuTt.href = s.tiktok;

  if (s.heroImage) {
    const heroImg = document.getElementById('hero-bg-img');
    if (heroImg) heroImg.src = s.heroImage;
  }

  if (s.logoUrl) {
    const logoImgs = document.querySelectorAll('#site-logo-img, .nav-logo img, .footer-logo img');
    logoImgs.forEach(img => { img.src = s.logoUrl; });
  }
}
