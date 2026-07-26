// ================================================
// 🛍️ Product Size/Color Selector Modal Module
// ================================================

import { state } from './state.js';
import { addToCart } from './cart.js';
import { toggleWishlist } from './wishlist.js';
import { showToast } from './toast.js';

let currentProductId = null;
let selectedSize = null;
let selectedColor = null;

export function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  currentProductId = productId;
  selectedSize = product.sizes && product.sizes.length === 1 ? product.sizes[0] : null;
  selectedColor = product.colors && product.colors.length === 1 ? product.colors[0] : null;

  const displayPrice = product.salePrice || product.price;

  let overlay = document.getElementById('product-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'product-modal-overlay';
    overlay.className = 'product-modal-overlay';
    overlay.innerHTML = `<div class="product-modal" id="product-modal-inner"></div>`;
    overlay.onclick = function(e) { if (e.target === overlay) closeProductModal(); };
    document.body.appendChild(overlay);
  }

  const inner = document.getElementById('product-modal-inner');
  inner.innerHTML = `
    <div class="pm-header">
      <div>
        <div class="pm-name">${product.name}</div>
        <div class="pm-price">${displayPrice.toLocaleString('ar-EG')} جنيه${product.salePrice ? ` <span style="font-size:0.8rem;color:var(--gray);text-decoration:line-through">${product.price.toLocaleString('ar-EG')}</span>` : ''}</div>
      </div>
      <button class="drawer-close" onclick="closeProductModal()">✕</button>
    </div>
    ${product.sizes && product.sizes.length > 1 ? `
    <div class="pm-label">اختر المقاس</div>
    <div class="pm-sizes" id="pm-sizes">
      ${product.sizes.map(s => `<button class="pm-size-btn${selectedSize===s?' selected':''}" onclick="selectSize('${s}',this)">${s}</button>`).join('')}
    </div>` : ''}
    ${product.colors && product.colors.length > 1 ? `
    <div class="pm-label">اختر اللون</div>
    <div class="pm-colors" id="pm-colors">
      ${product.colors.map(c => `<button class="pm-color-btn${selectedColor===c?' selected':''}" onclick="selectColor('${c}',this)">${c}</button>`).join('')}
    </div>` : ''}
    <div style="display:flex;gap:12px;margin-top:8px">
      <button class="btn-checkout" style="flex:1" onclick="addCurrentToCart()">🛒 أضف للسلة</button>
      <button class="btn-gold" onclick="toggleWishlist('${product.id}')" style="padding:16px 20px;border-radius:8px;font-size:1.2rem">❤️</button>
    </div>
  `;

  overlay.classList.add('open');
}

export function closeProductModal() {
  const overlay = document.getElementById('product-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('#pm-sizes .pm-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

export function selectColor(color, btn) {
  selectedColor = color;
  document.querySelectorAll('#pm-colors .pm-color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

export function addCurrentToCart() {
  const product = state.products.find(p => p.id === currentProductId);
  if (!product) return;

  if (product.sizes && product.sizes.length > 1 && !selectedSize) {
    showToast('من فضلك اختر المقاس', 'warning'); return;
  }
  if (product.colors && product.colors.length > 1 && !selectedColor) {
    showToast('من فضلك اختر اللون', 'warning'); return;
  }

  addToCart(product, selectedSize || product.sizes?.[0] || '', selectedColor || product.colors?.[0] || '');
  closeProductModal();
}

window.closeProductModal = closeProductModal;
window.selectSize = selectSize;
window.selectColor = selectColor;
window.addCurrentToCart = addCurrentToCart;
