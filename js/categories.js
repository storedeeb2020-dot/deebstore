// ================================================
// 🗂️ Categories Management Module
// ================================================

import { db } from './firebase-config.js';
import { state } from './state.js';
import { renderProducts } from './products.js';
import { closeMenu } from './menu.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loadCategories() {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    state.categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    state.categories = [];
  }
  renderCategoryFilter();
  renderMenuCategories();
}

export function renderCategoryFilter() {
  const filter = document.getElementById('category-filter');
  if (!filter) return;

  filter.innerHTML = `<button class="cat-btn active" data-cat="all" onclick="filterCategory('all', this)">الكل</button>`;

  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.setAttribute('data-cat', cat.id);
    btn.onclick = function() { filterCategory(cat.id, this); };
    btn.textContent = cat.name || cat.id;
    filter.appendChild(btn);
  });
}

export function renderMenuCategories() {
  const list = document.getElementById('menu-cats');
  if (!list) return;
  list.innerHTML = state.categories.map(cat => `
    <a href="#products" class="menu-cat-link" onclick="filterCategory('${cat.id}', null); closeMenu()">
      ${cat.icon || '•'} ${cat.name}
    </a>
  `).join('');
}

export function filterCategory(catId, btn) {
  state.activeCategory = catId;

  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const found = document.querySelector(`.cat-btn[data-cat="${catId}"]`);
    if (found) found.classList.add('active');
  }

  const filtered = catId === 'all'
    ? state.products
    : state.products.filter(p => p.category === catId);

  renderProducts(filtered);
}

window.filterCategory = filterCategory;
