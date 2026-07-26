// ================================================
// ❤️ Wishlist Module
// ================================================

import { state, saveWishlistToStorage } from './state.js';
import { addToCart } from './cart.js';
import { renderProducts } from './products.js';
import { showToast } from './toast.js';

export function saveWishlist() {
  saveWishlistToStorage();
  updateWishlistBadge();
  renderWishlist();
}

export function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-count');
  if (badge) {
    badge.textContent = state.wishlist.length;
    badge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
  }
}

export function toggleWishlist(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const idx = state.wishlist.findIndex(w => w.id === productId);

  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast('تمت الإزالة من المفضلة', 'info');
  } else {
    state.wishlist.push({ id: product.id, name: product.name, price: product.salePrice || product.price, image: product.image });
    showToast('❤️ أُضيف إلى المفضلة', 'success');
  }

  saveWishlist();
  const filtered = state.activeCategory === 'all' ? state.products : state.products.filter(p => p.category === state.activeCategory);
  renderProducts(filtered);
}

export function renderWishlist() {
  const itemsDiv = document.getElementById('wishlist-items');
  const empty = document.getElementById('wishlist-empty');
  if (!itemsDiv) return;

  if (state.wishlist.length === 0) {
    itemsDiv.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  itemsDiv.innerHTML = state.wishlist.map(item => `
    <div class="wishlist-item">
      <img class="wishlist-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70'" />
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${item.name}</div>
        <div class="wishlist-item-price">${item.price.toLocaleString('ar-EG')} جنيه</div>
        <div class="wishlist-actions">
          <button class="btn-move-cart" onclick="moveToCart('${item.id}')">🛒 نقل للسلة</button>
          <button class="btn-remove-wish" onclick="removeFromWishlist('${item.id}')">حذف</button>
        </div>
      </div>
    </div>
  `).join('');
}

export function moveToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (product) {
    addToCart(product, product.sizes?.[0] || '', product.colors?.[0] || '');
  }
  removeFromWishlist(productId);
}

export function removeFromWishlist(productId) {
  state.wishlist = state.wishlist.filter(w => w.id !== productId);
  saveWishlist();
}

export function openWishlist() {
  renderWishlist();
  document.getElementById('wishlist-drawer')?.classList.add('open');
  document.getElementById('wishlist-overlay')?.classList.add('active');
}

export function closeWishlist() {
  document.getElementById('wishlist-drawer')?.classList.remove('open');
  document.getElementById('wishlist-overlay')?.classList.remove('active');
}

window.openWishlist = openWishlist;
window.closeWishlist = closeWishlist;
window.toggleWishlist = toggleWishlist;
window.moveToCart = moveToCart;
window.removeFromWishlist = removeFromWishlist;
