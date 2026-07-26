// ================================================
// 🛒 Shopping Cart Module
// ================================================

import { db, analytics, logEvent } from './firebase-config.js';
import { state, saveCartToStorage } from './state.js';
import { showToast } from './toast.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function saveCart() {
  saveCartToStorage();
  updateCartBadge();
  renderCart();
}

export function updateCartBadge() {
  const total = state.cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

export function addToCart(product, size, color) {
  const key = `${product.id}_${size}_${color}`;
  const existing = state.cart.find(i => i.key === key);
  const displayPrice = product.salePrice || product.price;

  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({
      key, id: product.id, name: product.name,
      price: displayPrice, size, color, qty: 1,
      image: product.image
    });
  }

  saveCart();
  showToast(`✅ أُضيف "${product.name}" إلى السلة`, 'success');
  logEvent(analytics, 'add_to_cart', { item_name: product.name, value: displayPrice });
}

export function renderCart() {
  const itemsDiv = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  const empty = document.getElementById('cart-empty');
  if (!itemsDiv) return;

  if (state.cart.length === 0) {
    itemsDiv.innerHTML = '';
    if (footer) footer.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (footer) footer.style.display = 'block';
  if (empty) empty.style.display = 'none';

  itemsDiv.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.size ? 'مقاس: '+item.size : ''} ${item.color ? '| لون: '+item.color : ''}</div>
        <div class="cart-item-price">${(item.price * item.qty).toLocaleString('ar-EG')} جنيه</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.key}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
          <button class="remove-item-btn" onclick="removeFromCart('${item.key}')">حذف ✕</button>
        </div>
      </div>
    </div>
  `).join('');

  updateCartTotals();
}

export function changeQty(key, delta) {
  const item = state.cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
}

export function removeFromCart(key) {
  state.cart = state.cart.filter(i => i.key !== key);
  saveCart();
}

export function getCartSubtotal() {
  return state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function updateCartTotals() {
  const sub = getCartSubtotal();
  const disc = state.couponDiscount;
  const ship = state.shippingCost;
  const total = Math.max(0, sub - disc) + ship;

  const freeMin = state.settings.freeShippingMin || 2000;
  const shipText = ship === 0 && sub >= freeMin ? 'مجاني 🎉' : (ship > 0 ? `${ship} جنيه` : 'يُحسب عند الطلب');

  const subEl = document.getElementById('cart-subtotal');
  const shipEl = document.getElementById('cart-shipping');
  const totEl = document.getElementById('cart-total');
  if (subEl) subEl.textContent = sub.toLocaleString('ar-EG') + ' جنيه';
  if (shipEl) shipEl.textContent = shipText;
  if (totEl) totEl.textContent = total.toLocaleString('ar-EG') + ' جنيه';

  const discRow = document.getElementById('discount-row');
  if (discRow) discRow.style.display = disc > 0 ? 'flex' : 'none';
  const discEl = document.getElementById('cart-discount');
  if (discEl) discEl.textContent = `-${disc.toLocaleString('ar-EG')} جنيه`;
}

export async function applyCoupon() {
  const codeEl = document.getElementById('coupon-input');
  if (!codeEl) return;
  const code = codeEl.value.trim().toUpperCase();
  if (!code) { showToast('أدخل كود الخصم', 'warning'); return; }

  try {
    const snap = await getDocs(collection(db, 'coupons'));
    const coupons = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const coupon = coupons.find(c => c.code.toUpperCase() === code && c.active !== false);

    if (!coupon) { showToast('❌ الكود غير صحيح أو منتهي', 'error'); return; }

    const sub = getCartSubtotal();
    state.appliedCoupon = coupon;
    if (coupon.type === 'percent') {
      state.couponDiscount = Math.round(sub * coupon.value / 100);
    } else {
      state.couponDiscount = Math.min(coupon.value, sub);
    }

    showToast(`🎉 تم تطبيق كوبون ${coupon.value}${coupon.type === 'percent' ? '%' : ' جنيه'}`, 'success');
    updateCartTotals();
  } catch(e) {
    showToast('خطأ في التحقق من الكوبون', 'error');
  }
}

export function openCart() {
  renderCart();
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('active');
}

export function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('active');
}

window.openCart = openCart;
window.closeCart = closeCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.applyCoupon = applyCoupon;
