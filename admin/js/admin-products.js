// ================================================
// 📦 Admin Products CRUD Module
// ================================================

import { db } from './admin-auth.js';
import { adminToast } from './admin-toast.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let productsData = [];

export async function loadAdminProducts(categories = []) {
  const snap = await getDocs(collection(db, 'products'));
  productsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderProductsTable(categories);
  const badge = document.getElementById('products-count-badge');
  if (badge) badge.textContent = productsData.length;
  return productsData;
}

export function renderProductsTable(categories = []) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  if (productsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--gray);padding:20px">لا توجد منتجات</td></tr>';
    return;
  }
  tbody.innerHTML = productsData.map(p => {
    const cat = categories.find(c => c.id === p.category);
    return `
    <tr>
      <td><img src="${p.image}" class="product-thumb" onerror="this.src=''" /></td>
      <td style="font-weight:600;max-width:180px">${p.name}</td>
      <td>${cat ? cat.name : (p.categoryName || p.category || '—')}</td>
      <td>${(p.price||0).toLocaleString('ar-EG')} ج</td>
      <td>${p.salePrice ? p.salePrice.toLocaleString('ar-EG')+' ج' : '—'}</td>
      <td style="font-size:0.8rem;color:var(--gray)">${(p.sizes||[]).join(', ')}</td>
      <td>
        <span class="status-badge ${p.inStock!==false ? 'status-delivered' : 'status-cancelled'}">
          ${p.inStock!==false ? 'متوفر' : 'نفذ'}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-icon btn-edit" onclick="editProduct('${p.id}')" title="تعديل">✏️</button>
          <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}')" title="حذف">🗑️</button>
          <button class="btn-icon btn-view" onclick="toggleStock('${p.id}')" title="تغيير التوفر">
            ${p.inStock!==false ? '📦' : '❌'}
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

export function openProductForm() {
  document.getElementById('product-form-title').textContent = 'إضافة منتج جديد';
  document.getElementById('edit-product-id').value = '';
  clearProductForm();
  document.getElementById('product-form-overlay').style.display = 'flex';
}

export function closeProductForm() {
  document.getElementById('product-form-overlay').style.display = 'none';
}

export function editProduct(id) {
  const p = productsData.find(x => x.id === id);
  if (!p) return;
  document.getElementById('product-form-title').textContent = 'تعديل المنتج';
  document.getElementById('edit-product-id').value = id;
  document.getElementById('p-name').value = p.name || '';
  document.getElementById('p-price').value = p.price || '';
  document.getElementById('p-sale-price').value = p.salePrice || '';
  document.getElementById('p-image').value = p.image || '';
  document.getElementById('p-colors').value = (p.colors||[]).join('، ');
  document.getElementById('p-bestseller').checked = !!p.bestSeller;
  document.getElementById('p-instock').checked = p.inStock !== false;

  const catSel = document.getElementById('p-category');
  if (catSel) catSel.value = p.category || '';

  document.querySelectorAll('.p-size').forEach(cb => {
    cb.checked = (p.sizes||[]).includes(cb.value);
  });

  document.getElementById('product-form-overlay').style.display = 'flex';
}

export async function saveProduct(categories = []) {
  const id = document.getElementById('edit-product-id').value;
  const name = document.getElementById('p-name').value.trim();
  const category = document.getElementById('p-category').value;
  const price = parseFloat(document.getElementById('p-price').value);
  const salePriceRaw = document.getElementById('p-sale-price').value;
  const salePrice = salePriceRaw ? parseFloat(salePriceRaw) : null;
  const image = document.getElementById('p-image').value.trim();
  const colors = document.getElementById('p-colors').value.split(/[,،]/).map(s=>s.trim()).filter(Boolean);
  const sizes = [...document.querySelectorAll('.p-size:checked')].map(cb => cb.value);
  const bestSeller = document.getElementById('p-bestseller').checked;
  const inStock = document.getElementById('p-instock').checked;

  if (!name || !price || !image || !category) {
    alert('أكمل البيانات المطلوبة'); return;
  }

  const catObj = categories.find(c => c.id === category);
  const data = {
    name, category, categoryName: catObj?.name || category,
    price, salePrice, image, colors, sizes, bestSeller, inStock,
    updatedAt: serverTimestamp()
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'products', id), data);
      adminToast('✅ تم تحديث المنتج', 'success');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'products'), data);
      adminToast('✅ تم إضافة المنتج', 'success');
    }
    closeProductForm();
    await loadAdminProducts(categories);
  } catch(e) {
    adminToast('❌ خطأ في الحفظ: ' + e.message, 'error');
  }
}

export async function deleteProduct(id, categories = []) {
  if (!confirm('هل تريد حذف هذا المنتج نهائياً؟')) return;
  try {
    await deleteDoc(doc(db, 'products', id));
    adminToast('🗑️ تم حذف المنتج', 'success');
    await loadAdminProducts(categories);
  } catch(e) {
    adminToast('❌ خطأ في الحذف', 'error');
  }
}

export async function toggleStock(id, categories = []) {
  const p = productsData.find(x => x.id === id);
  if (!p) return;
  const newVal = p.inStock === false;
  await updateDoc(doc(db, 'products', id), { inStock: newVal });
  adminToast(newVal ? '✅ المنتج متوفر الآن' : '❌ تم إخفاء المنتج', 'info');
  await loadAdminProducts(categories);
}

function clearProductForm() {
  ['p-name','p-price','p-sale-price','p-image','p-colors'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  document.querySelectorAll('.p-size').forEach(cb => cb.checked = false);
  const bs = document.getElementById('p-bestseller'); if(bs) bs.checked = false;
  const is = document.getElementById('p-instock'); if(is) is.checked = true;
}

window.openProductForm = openProductForm;
window.closeProductForm = closeProductForm;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.toggleStock = toggleStock;
