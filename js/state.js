// ================================================
// 📦 Global Store State
// ================================================

export const state = {
  products: [],
  categories: [],
  settings: {},
  shipping: {},
  cart: JSON.parse(localStorage.getItem('eldeeb_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('eldeeb_wishlist') || '[]'),
  activeCategory: 'all',
  couponDiscount: 0,
  appliedCoupon: null,
  selectedGov: '',
  shippingCost: 0,
};

export function saveCartToStorage() {
  localStorage.setItem('eldeeb_cart', JSON.stringify(state.cart));
}

export function saveWishlistToStorage() {
  localStorage.setItem('eldeeb_wishlist', JSON.stringify(state.wishlist));
}
