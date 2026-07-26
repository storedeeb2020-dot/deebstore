// ================================================
// 📋 Checkout Order Modal Module
// ================================================

import { db, analytics, logEvent } from './firebase-config.js';
import { state } from './state.js';
import { closeCart, getCartSubtotal, updateCartTotals, saveCart } from './cart.js';
import { showToast } from './toast.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function openCheckout() {
  closeCart();
  renderCheckoutItems();
  const overlay = document.getElementById('checkout-overlay');
  const modal = document.getElementById('checkout-modal');
  if (overlay) {
    overlay.classList.add('open');
    overlay.style.display = 'flex';
  }
  if (modal) modal.style.display = 'block';
}

export function closeCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
  }
}

export function renderCheckoutItems() {
  const list = document.getElementById('checkout-items-list');
  if (!list) return;
  list.innerHTML = state.cart.map(item => `
    <div class="chk-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src=''" />
      <div class="chk-item-info">
        <div class="chk-item-name">${item.name}</div>
        <div class="chk-item-meta">${item.size || ''} ${item.color || ''} × ${item.qty}</div>
      </div>
      <span class="chk-item-price">${(item.price * item.qty).toLocaleString('ar-EG')} ج</span>
    </div>
  `).join('');

  updateCheckoutTotals();
}

export function updateShipping() {
  const govEl = document.getElementById('checkout-gov');
  if (!govEl) return;
  const gov = govEl.value;
  state.selectedGov = gov;

  const freeMin = state.settings.freeShippingMin || 2000;
  const sub = getCartSubtotal();

  if (sub >= freeMin) {
    state.shippingCost = 0;
  } else {
    const cairoGiza = ['القاهرة', 'الجيزة'];
    if (cairoGiza.includes(gov)) {
      state.shippingCost = state.settings.shippingCairoGiza || 40;
    } else if (gov) {
      state.shippingCost = state.settings.shippingOther || 60;
    } else {
      state.shippingCost = 0;
    }
  }

  updateCheckoutTotals();
  updateCartTotals();
}

export function updateCheckoutTotals() {
  const sub = getCartSubtotal();
  const disc = state.couponDiscount;
  const ship = state.shippingCost;
  const total = Math.max(0, sub - disc) + ship;

  const freeMin = state.settings.freeShippingMin || 2000;
  const shipText = state.shippingCost === 0 && sub >= freeMin ? 'مجاني 🎉' : (state.selectedGov ? `${ship} جنيه` : 'اختر المحافظة');

  const subEl = document.getElementById('chk-subtotal');
  const shipEl = document.getElementById('chk-shipping');
  const totEl = document.getElementById('chk-total');
  if (subEl) subEl.textContent = sub.toLocaleString('ar-EG') + ' جنيه';
  if (shipEl) shipEl.textContent = shipText;
  if (totEl) totEl.textContent = total.toLocaleString('ar-EG') + ' جنيه';

  const discRow = document.getElementById('chk-discount-row');
  if (discRow) discRow.style.display = disc > 0 ? 'flex' : 'none';
  const discEl = document.getElementById('chk-discount');
  if (discEl) discEl.textContent = `-${disc.toLocaleString('ar-EG')} جنيه`;
}

export async function submitOrder() {
  const name = document.getElementById('checkout-name')?.value.trim();
  const phone = document.getElementById('checkout-phone')?.value.trim();
  const gov = document.getElementById('checkout-gov')?.value;
  const address = document.getElementById('checkout-address')?.value.trim();
  const notes = document.getElementById('checkout-notes')?.value.trim();

  if (!name || !phone || !gov || !address) {
    showToast('⚠️ أكمل بيانات التوصيل', 'warning');
    return;
  }
  if (!/^01[0-9]{9}$/.test(phone)) {
    showToast('⚠️ رقم الهاتف غير صحيح', 'warning');
    return;
  }
  if (state.cart.length === 0) {
    showToast('السلة فارغة', 'error');
    return;
  }

  const btn = document.getElementById('order-btn-text');
  if (btn) btn.textContent = 'جاري الإرسال...';

  try {
    const sub = getCartSubtotal();
    const disc = state.couponDiscount;
    const ship = state.shippingCost;
    const total = Math.max(0, sub - disc) + ship;

    await addDoc(collection(db, 'orders'), {
      customerName: name,
      phone,
      governorate: gov,
      address,
      notes,
      items: state.cart,
      subtotal: sub,
      discount: disc,
      coupon: state.appliedCoupon?.code || '',
      shipping: ship,
      total,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    state.cart = [];
    state.couponDiscount = 0;
    state.appliedCoupon = null;
    state.shippingCost = 0;
    saveCart();

    closeCheckout();
    showToast('🎉 تم تأكيد طلبك بنجاح! سنتواصل معك قريباً', 'success');
    logEvent(analytics, 'purchase', { value: total });
  } catch(e) {
    showToast('❌ حدث خطأ. حاول مرة أخرى', 'error');
    console.error(e);
  } finally {
    if (btn) btn.textContent = 'تأكيد الطلب';
  }
}

window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.updateShipping = updateShipping;
window.submitOrder = submitOrder;
