// ================================================
// 📦 Products Catalog Module
// ================================================

import { db } from './firebase-config.js';
import { state } from './state.js';
import { openProductModal } from './product-modal.js';
import { toggleWishlist } from './wishlist.js';
import { showToast } from './toast.js';
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill('<div class="skeleton skeleton-card"></div>').join('');

  try {
    const snap = await getDocs(collection(db, 'products'));
    state.products = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.inStock !== false);

    if (state.products.length === 0) {
      state.products = getDefaultProducts();
      for (const p of state.products) {
        await addDoc(collection(db, 'products'), p);
      }
      const snap2 = await getDocs(collection(db, 'products'));
      state.products = snap2.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.inStock !== false);
    }

    renderProducts(state.products);
  } catch(e) {
    console.error('Products load error:', e);
    state.products = getDefaultProducts();
    renderProducts(state.products);
    showToast('تحميل المنتجات من البيانات المحلية', 'warning');
  }
}

export function getDefaultProducts() {
  return [
    { id: 'prod_1', name: 'هودي أسود فاخر — Deep Royal Gold', price: 1850, salePrice: 1450, category: 'hoodies', categoryName: 'هوديز', inStock: true, bestSeller: true, sizes: ['S','M','L','XL','XXL'], colors: ['أسود ملكي','ذهبي مطفي'], image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod_2', name: 'تيشيرت أوفراسايز ذهبي', price: 950, salePrice: 750, category: 't-shirts', categoryName: 'تيشيرتات', inStock: true, bestSeller: true, sizes: ['M','L','XL'], colors: ['أسود','أبيض عاجي'], image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod_3', name: 'جاكيت جلد التمساح', price: 3200, salePrice: null, category: 'jackets', categoryName: 'جاكيتات', inStock: true, bestSeller: false, sizes: ['M','L','XL'], colors: ['أسود فحم'], image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod_4', name: 'بنطال كارجو ستريت وير', price: 1150, salePrice: 950, category: 'pants', categoryName: 'بناطيل', inStock: true, bestSeller: true, sizes: ['S','M','L','XL'], colors: ['أسود','زيتي غامق'], image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod_5', name: 'طقم المخمل الذهبي المحدود', price: 4500, salePrice: 3900, category: 'gold-collection', categoryName: 'التشكيلة الذهبية', inStock: true, bestSeller: true, sizes: ['M','L','XL'], colors: ['ذهبي ملكي'], image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop' },
  ];
}

export function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  const noProds = document.getElementById('no-products');
  if (!grid) return;

  if (!products || products.length === 0) {
    grid.innerHTML = '';
    if (noProds) noProds.style.display = 'block';
    return;
  }

  if (noProds) noProds.style.display = 'none';

  grid.innerHTML = products.map((p, i) => {
    const isWished = state.wishlist.some(w => w.id === p.id);
    const displayPrice = p.salePrice ? p.salePrice : p.price;
    const hasSale = p.salePrice && p.salePrice < p.price;
    const discount = hasSale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

    return `
    <div class="product-card" style="animation-delay:${i * 0.08}s" onclick="openProductModal('${p.id}')">
      <div class="product-card-img-wrap">
        ${p.bestSeller ? '<span class="product-badge badge-bestseller">الأكثر مبيعاً</span>' : ''}
        ${hasSale ? `<span class="product-badge badge-sale" style="top:${p.bestSeller?'48':'14'}px">خصم ${discount}%</span>` : ''}
        <button class="card-wishlist-btn ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${p.id}')" title="${isWished ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">
          <svg viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=400'" />
        <button class="card-add-btn" onclick="event.stopPropagation(); openProductModal('${p.id}')">أضف للسلة</button>
      </div>
      <div class="product-card-info">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-meta">
          <span class="product-price">${displayPrice.toLocaleString('ar-EG')} جنيه</span>
          ${hasSale ? `<span class="product-original-price">${p.price.toLocaleString('ar-EG')} جنيه</span>` : ''}
        </div>
        ${p.sizes && p.sizes.length ? `<div class="product-sizes">${p.sizes.map(s => `<span class="size-chip">${s}</span>`).join('')}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

export function liveSearch(query) {
  if (!query.trim()) {
    renderProducts(state.products);
    return;
  }
  const q = query.toLowerCase();
  const filtered = state.products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.categoryName && p.categoryName.includes(q))
  );
  renderProducts(filtered);
}

window.liveSearch = liveSearch;
window.openProductModal = openProductModal;
