import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { Product } from "@/types/product";
import type { Order, OrderStatus, CreateOrderInput } from "@/types/order";
import type { Category } from "@/types/category";
import type { GomlaCategory, GomlaProduct } from "@/types/gomla";
import { deleteFromCloudinary } from "../cloudinary";
import { sendOrderTelegramAlert } from "../telegram";

// ─── Helpers ──────────────────────────────────────────────

export function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (
    obj instanceof Date ||
    typeof (obj as any).toMillis === "function" ||
    typeof (obj as any).isEqual === "function"
  ) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj as Record<string, any>)) {
    const val = (obj as Record<string, any>)[key];
    if (val !== undefined) {
      cleaned[key] = cleanUndefined(val);
    }
  }
  return cleaned as T;
}

// ─── Products ──────────────────────────────────────────

export async function deleteFakeProducts(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const deletePromises: Promise<void>[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const name = (data.name || "").toLowerCase();
      const isFake =
        !data.mainImage ||
        data.mainImage === "" ||
        name.includes("deep royal gold") ||
        name.includes("هودي") ||
        name.includes("المخمل") ||
        name.includes("تيشيرت") ||
        name.includes("كارجو") ||
        name.includes("بنطال") ||
        !data.createdAt;

      if (isFake) {
        deletePromises.push(deleteDoc(doc(db, "products", docSnap.id)));
      }
    }
    await Promise.all(deletePromises);
  } catch (e) {
    console.error("Failed to delete fake products:", e);
  }
}

export async function deleteAllProducts(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "products", docSnap.id));
    }
  } catch (e) {
    console.error("Failed to wipe products collection:", e);
  }
}

export async function getProducts(filters?: {
  featured?: boolean;
  bestSeller?: boolean;
  category?: string;
  limitCount?: number;
}): Promise<Product[]> {
  try {
    // Await deletion of old fake seed documents once
    await deleteFakeProducts();

    const snapshot = await getDocs(collection(db, "products"));
    let items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product);

    // Hard filter out any fake test products missing mainImage
    items = items.filter((p) => p.mainImage && p.mainImage.trim() !== "");

    const getMillis = (val: any): number => {
      if (!val) return 0;
      if (typeof val.toMillis === "function") return val.toMillis();
      if (typeof val.getTime === "function") return val.getTime();
      return 0;
    };

    items.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));

    if (filters?.featured) items = items.filter((p) => p.featured);
    if (filters?.bestSeller) items = items.filter((p) => p.bestSeller);
    if (filters?.category) items = items.filter((p) => p.category === filters.category);
    if (filters?.limitCount) items = items.slice(0, filters.limitCount);

    return items;
  } catch (err: any) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export function subscribeToLiveProducts(
  callback: (products: Product[]) => void,
  filters?: {
    featured?: boolean;
    bestSeller?: boolean;
    category?: string;
    limitCount?: number;
  }
) {
  const q = collection(db, "products");
  return onSnapshot(
    q,
    (snapshot) => {
      let items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product);

      items = items.filter((p) => p.mainImage && p.mainImage.trim() !== "");

      const getMillis = (val: any): number => {
        if (!val) return 0;
        if (typeof val.toMillis === "function") return val.toMillis();
        if (typeof val.getTime === "function") return val.getTime();
        return 0;
      };

      items.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));

      if (filters?.featured) items = items.filter((p) => p.featured);
      if (filters?.bestSeller) items = items.filter((p) => p.bestSeller);
      if (filters?.category) items = items.filter((p) => p.category === filters.category);
      if (filters?.limitCount) items = items.slice(0, filters.limitCount);

      callback(items);
    },
    (err) => {
      console.error("Live products subscription error:", err);
    }
  );
}

export async function getProductBySlug(slugParam: string): Promise<Product | null> {
  if (!slugParam) return null;

  try {
    const decodedParam = decodeURIComponent(slugParam).trim().toLowerCase();

    // 1. Try fetching directly by document ID first
    const byId = await getProductById(slugParam);
    if (byId) return byId;

    // 2. Try matching by full slug field
    const q1 = query(collection(db, "products"), where("slug", "==", slugParam), limit(1));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const d = snap1.docs[0];
      return { id: d.id, ...d.data() } as Product;
    }

    // 3. Try clean slug without SKU suffix
    const skuPattern = /-nxt-[a-z0-9]{4}$/i;
    const cleanSlug = slugParam.replace(skuPattern, "");
    if (cleanSlug !== slugParam) {
      const q2 = query(collection(db, "products"), where("slug", "==", cleanSlug), limit(1));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const d = snap2.docs[0];
        return { id: d.id, ...d.data() } as Product;
      }
    }

    // 4. Fallback: Fetch all products and match strictly by ID, slug, or SKU
    const allProducts = await getProducts();
    if (allProducts.length === 0) return null;

    // First try strict exact match
    const exactMatched = allProducts.find((p) => {
      const pId = (p.id || "").toLowerCase();
      const pSlug = (p.slug || "").toLowerCase();
      const pSku = (p.sku || "").toLowerCase();
      return (
        pId === decodedParam ||
        pSlug === decodedParam ||
        pSku === decodedParam
      );
    });
    if (exactMatched) return exactMatched;

    // Second try name exact match
    const nameMatched = allProducts.find(
      (p) => (p.name || "").toLowerCase().trim() === decodedParam
    );
    if (nameMatched) return nameMatched;

    // Third try partial slug or name match
    const partialMatched = allProducts.find((p) => {
      const pSlug = (p.slug || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      return pSlug.includes(decodedParam) || pName.includes(decodedParam);
    });
    if (partialMatched) return partialMatched;
  } catch (err) {
    console.error("Error fetching product by slug/id:", err);
  }

  return null;
}


export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, "products", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "products"), cleanUndefined({
    ...data,
    createdAt: Timestamp.now(),
  }));
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "products", id), cleanUndefined(data));
}

export async function deleteProduct(id: string): Promise<void> {
  // Fetch product to collect image URLs before deletion
  try {
    const product = await getProductById(id);
    if (product) {
      const allImages = [
        product.mainImage,
        ...(product.variants?.map((v) => v.image) || []),
      ].filter(Boolean) as string[];

      if (allImages.length > 0) {
        deleteFromCloudinary(allImages).catch(console.error);
      }
    }
  } catch (err) {
    console.error("Error collecting product images for Cloudinary deletion:", err);
  }

  await deleteDoc(doc(db, "products", id));
}

// ─── Orders ─────────────────────────────────────────────

export async function createOrder(data: CreateOrderInput): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), cleanUndefined({
    ...data,
    customerPhone: data.phone,
    status: "pending" as OrderStatus,
    createdAt: Timestamp.now(),
  }));

  const orderId = docRef.id;

  // Trigger Telegram Bot order alert asynchronously
  sendOrderTelegramAlert({
    id: orderId,
    ...data,
    status: "pending",
    createdAt: new Date(),
  }).catch((err) => console.error("Telegram alert error:", err));

  return orderId;
}

export async function getOrders(statusFilter?: OrderStatus): Promise<Order[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (statusFilter) constraints.push(where("status", "==", statusFilter));

  const q = query(collection(db, "orders"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(db, "orders", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status });
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, "orders", id));
}

export function subscribeToLiveOrders(
  onNext: (orders: Order[], changes: { type: "added" | "modified" | "removed"; order: Order }[]) => void
) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(25));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order);
      const changes = snapshot.docChanges().map((change) => ({
        type: change.type,
        order: { id: change.doc.id, ...change.doc.data() } as Order,
      }));
      onNext(orders, changes);
    },
    (err) => {
      console.warn("Live orders subscription notice:", err?.message || err);
    }
  );
}

// ─── Categories ──────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category);
}

export async function createCategory(
  data: Omit<Category, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, "categories"), cleanUndefined(data));
  return docRef.id;
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id">>
): Promise<void> {
  await updateDoc(doc(db, "categories", id), cleanUndefined(data));
}

export async function updateCategoryOrder(
  items: { id: string; order: number }[]
): Promise<void> {
  const promises = items.map((item) =>
    updateDoc(doc(db, "categories", item.id), { order: item.order })
  );
  await Promise.all(promises);
}

export interface GlobalSizeChart {
  id: string;
  name: string;      // اسم جدول المقاسات (مثلاً: جدول مقاسات التيشيرتات)
  imageUrl: string;  // رابط الصورة المرفوعة
}

export interface SiteSettings {
  storeName?: string;
  logoUrl?: string;         // رابط لوغو المتجر الرسمي
  heroTagline?: string;
  heroButtonText?: string;
  heroMediaType?: "image" | "video";
  heroVideoUrlLight?: string;
  heroVideoUrlDark?: string;
  heroMobileImageUrl?: string;   // صورة الهيرو الإضافية للموبايل أسفل الفيديو
  heroImagesLight?: string[];
  heroImagesDark?: string[];
  featuredTitle?: string;
  featuredSubtitle?: string;
  introTagline?: string;
  introImages?: string[];
  footerDescription?: string;
  storeEmail?: string;
  storePhone?: string;
  vodafoneCash?: string;
  instapayUsername?: string;
  onlinePaymentEnabled?: boolean;  // تفعيل/إيقاف الدفع الأونلاين أونلاين بكروت البنك
  vodafoneCashEnabled?: boolean;   // تفعيل/إيقاف فودافون كاش
  instapayEnabled?: boolean;       // تفعيل/إيقاف انستاباي
  codEnabled?: boolean;            // تفعيل/إيقاف الدفع عند الاستلام COD
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  currency?: string;

  // Global Size Charts CMS
  sizeCharts?: GlobalSizeChart[];

  // About Page CMS
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutSection1Title?: string;
  aboutSection1Text?: string;
  aboutSection1Image?: string;
  aboutSection2Title?: string;
  aboutSection2Text?: string;
  aboutSection2Image?: string;

  // Legal & Privacy CMS
  privacyPolicyText?: string;
  termsOfServiceText?: string;

  // Announcement Bar
  announcementEnabled?: boolean;    // تفعيل/إيقاف شريط الإعلانات
  announcementText?: string;        // نص شريط الإعلان
  announcementColor?: string;       // لون الخلفية hex e.g. "#F59E0B"
  announcementLink?: string;        // رابط اختياري عند الضغط
  whatsappNumber?: string;          // رقم واتساب الطلبات

  // Free Shipping CMS
  freeShippingEnabled?: boolean;   // تفعيل ميزة الشحن المجاني عند الوصول للحد
  freeShippingThreshold?: number;  // الحد الأدنى للمبلغ للحصول على الشحن المجاني (مثلاً 500)

  // Telegram Bot Notifications
  telegramEnabled?: boolean;       // تفعيل/إيقاف إشعارات تليجرام
  telegramBotToken?: string;      // توكين البوت من BotFather
  telegramChatId?: string;        // معرف الشات أو الجروب

  // Wholesale / Gomla CMS
  gomlaEnabled?: boolean;         // تفعيل/إيقاف قسم الجملة بالموقع
  gomlaWhatsappNumber?: string;   // رقم واتساب الجملة الخاص بتلقي الطلبات
  gomlaIntroText?: string;        // نص ترحيبي لقسم الجملة
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, "site_settings", "general");
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as SiteSettings;
  } catch (err) {
    console.error("Failed to fetch site settings:", err);
    return null;
  }
}

export function subscribeToSiteSettings(
  callback: (settings: SiteSettings | null) => void
): () => void {
  const docRef = doc(db, "site_settings", "general");
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as SiteSettings);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error("Failed to subscribe to site settings:", err);
    }
  );
}

export async function updateSiteSettings(
  data: Partial<SiteSettings>
): Promise<void> {
  const docRef = doc(db, "site_settings", "general");
  await setDoc(docRef, cleanUndefined(data), { merge: true });
}

// ─── Shipping Rates (Governorates) ──────────────────────

import { DEFAULT_EGYPT_GOVERNORATES, type GovernorateRate } from "@/constants/governorates";

export async function getShippingRates(): Promise<GovernorateRate[]> {
  try {
    const docRef = doc(db, "site_settings", "shipping");
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return DEFAULT_EGYPT_GOVERNORATES;
    const data = snapshot.data();
    if (data?.rates && Array.isArray(data.rates)) {
      return data.rates as GovernorateRate[];
    }
    return DEFAULT_EGYPT_GOVERNORATES;
  } catch (err) {
    console.error("Failed to fetch shipping rates:", err);
    return DEFAULT_EGYPT_GOVERNORATES;
  }
}

export function subscribeToShippingRates(
  callback: (rates: GovernorateRate[]) => void
): () => void {
  const docRef = doc(db, "site_settings", "shipping");
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(DEFAULT_EGYPT_GOVERNORATES);
        return;
      }
      const data = snapshot.data();
      if (data?.rates && Array.isArray(data.rates)) {
        callback(data.rates as GovernorateRate[]);
      } else {
        callback(DEFAULT_EGYPT_GOVERNORATES);
      }
    },
    (err) => {
      console.error("Failed to subscribe to shipping rates:", err);
    }
  );
}

export async function updateShippingRates(rates: GovernorateRate[]): Promise<void> {
  const docRef = doc(db, "site_settings", "shipping");
  await setDoc(docRef, cleanUndefined({ rates, updatedAt: Timestamp.now() }), { merge: true });
}

// ─── Contact Messages & Complaints ──────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "unread" | "read";
  createdAt: any;
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  message: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "contact_messages"), cleanUndefined({
    ...data,
    status: "unread",
    createdAt: Timestamp.now(),
  }));
  return docRef.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ContactMessage);
  } catch (err) {
    console.error("Failed to load contact messages:", err);
    return [];
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: "unread" | "read"
): Promise<void> {
  await updateDoc(doc(db, "contact_messages", id), { status });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, "contact_messages", id));
}

// ─── System Error Logs ─────────────────────────────────

export interface SystemErrorLog {
  id: string;
  message: string;
  stack?: string;
  url?: string;
  path?: string;
  userAgent?: string;
  context?: string;
  resolved: boolean;
  createdAt: any;
}

export async function createSystemErrorLog(data: {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  context?: string;
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "system_errors"), cleanUndefined({
      message: data.message || "Unknown Runtime Error",
      stack: data.stack || "",
      url: data.url || (typeof window !== "undefined" ? window.location.href : ""),
      userAgent: data.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : ""),
      context: data.context || "Client Runtime",
      resolved: false,
      createdAt: Timestamp.now(),
    }));
    return docRef.id;
  } catch (err) {
    console.error("Failed to log system error to Firestore:", err);
    return "";
  }
}

export async function getSystemErrorLogs(): Promise<SystemErrorLog[]> {
  try {
    const q = query(collection(db, "system_errors"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as SystemErrorLog);
  } catch (err) {
    console.error("Failed to fetch system errors:", err);
    return [];
  }
}

export async function updateSystemErrorStatus(
  id: string,
  resolved: boolean
): Promise<void> {
  await updateDoc(doc(db, "system_errors", id), { resolved });
}

export async function deleteSystemErrorLog(id: string): Promise<void> {
  await deleteDoc(doc(db, "system_errors", id));
}

export async function clearAllSystemErrors(): Promise<void> {
  const snapshot = await getDocs(collection(db, "system_errors"));
  const deletePromises = snapshot.docs.map((docItem) => deleteDoc(docItem.ref));
  await Promise.all(deletePromises);
}

// ─── Gomla (Wholesale) Management ────────────────────────

export async function getGomlaCategories(): Promise<GomlaCategory[]> {
  let categories: GomlaCategory[] = [];

  try {
    const res = await fetch("/api/gomla/categories", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.categories && Array.isArray(data.categories)) {
        categories = data.categories;
      }
    }
  } catch {}

  if (categories.length === 0) {
    try {
      const q = query(collection(db, "gomla_categories"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      categories = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GomlaCategory);
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem("nxt_gomla_categories");
      if (local) {
        const parsed = JSON.parse(local) as GomlaCategory[];
        const map = new Map<string, GomlaCategory>();
        categories.forEach((c) => map.set(c.id, c));
        parsed.forEach((c) => map.set(c.id, c));
        categories = Array.from(map.values());
      }
    } catch {}
  }

  return categories;
}

export async function createGomlaCategory(data: {
  name: string;
  nameAr: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
}): Promise<string> {
  const newId = "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newCategory: GomlaCategory = {
    id: newId,
    ...data,
    createdAt: new Date() as any,
  };

  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nxt_gomla_categories");
      const list: GomlaCategory[] = existing ? JSON.parse(existing) : [];
      list.push(newCategory);
      localStorage.setItem("nxt_gomla_categories", JSON.stringify(list));
    } catch {}
  }

  try {
    const res = await fetch("/api/gomla/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.category?.id) return result.category.id;
    }
  } catch {}

  try {
    const docRef = await addDoc(collection(db, "gomla_categories"), cleanUndefined({
      ...data,
      createdAt: Timestamp.now(),
    }));
    return docRef.id;
  } catch {
    return newId;
  }
}

export async function updateGomlaCategory(
  id: string,
  data: Partial<GomlaCategory>
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nxt_gomla_categories");
      if (existing) {
        const list: GomlaCategory[] = JSON.parse(existing);
        const updated = list.map((c) => (c.id === id ? { ...c, ...data } : c));
        localStorage.setItem("nxt_gomla_categories", JSON.stringify(updated));
      }
    } catch {}
  }

  try {
    await fetch("/api/gomla/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
  } catch {}

  try {
    await updateDoc(doc(db, "gomla_categories", id), cleanUndefined(data));
  } catch {}
}

export async function deleteGomlaCategory(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nxt_gomla_categories");
      if (existing) {
        const list: GomlaCategory[] = JSON.parse(existing);
        const filtered = list.filter((c) => c.id !== id);
        localStorage.setItem("nxt_gomla_categories", JSON.stringify(filtered));
      }
    } catch {}
  }

  try {
    await fetch(`/api/gomla/categories?id=${id}`, { method: "DELETE" });
  } catch {}

  try {
    await deleteDoc(doc(db, "gomla_categories", id));
  } catch {}
}

export async function getGomlaProducts(categoryId?: string): Promise<GomlaProduct[]> {
  let products: GomlaProduct[] = [];

  try {
    const res = await fetch("/api/gomla/products", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        products = data.products;
      }
    }
  } catch {}

  if (products.length === 0) {
    try {
      const snapshot = await getDocs(collection(db, "gomla_products"));
      products = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as GomlaProduct);
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem("nxt_gomla_products");
      if (local) {
        const parsed = JSON.parse(local) as GomlaProduct[];
        const map = new Map<string, GomlaProduct>();
        products.forEach((p) => map.set(p.id, p));
        parsed.forEach((p) => map.set(p.id, p));
        products = Array.from(map.values());
      }
    } catch {}
  }

  if (categoryId && categoryId !== "all") {
    products = products.filter((p) => p.categoryId === categoryId);
  }

  return products;
}

export async function getGomlaProductById(id: string): Promise<GomlaProduct | null> {
  try {
    const products = await getGomlaProducts();
    const found = products.find((p) => p.id === id);
    if (found) return found;

    const docRef = doc(db, "gomla_products", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as GomlaProduct;
  } catch {
    return null;
  }
}

export async function createGomlaProduct(data: Omit<GomlaProduct, "id" | "createdAt">): Promise<string> {
  const newId = "prod_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newProduct: GomlaProduct = {
    id: newId,
    ...data,
    createdAt: new Date() as any,
  };

  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nxt_gomla_products");
      const list: GomlaProduct[] = existing ? JSON.parse(existing) : [];
      list.push(newProduct);
      localStorage.setItem("nxt_gomla_products", JSON.stringify(list));
    } catch {}
  }

  try {
    const res = await fetch("/api/gomla/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.product?.id) return result.product.id;
    }
  } catch {}

  try {
    const docRef = await addDoc(collection(db, "gomla_products"), cleanUndefined({
      ...data,
      createdAt: Timestamp.now(),
    }));
    return docRef.id;
  } catch {
    return newId;
  }
}

export async function updateGomlaProduct(
  id: string,
  data: Partial<GomlaProduct>
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nxt_gomla_products");
      if (existing) {
        const list: GomlaProduct[] = JSON.parse(existing);
        const updated = list.map((p) => (p.id === id ? { ...p, ...data } : p));
        localStorage.setItem("nxt_gomla_products", JSON.stringify(updated));
      }
    } catch {}
  }

  try {
    await fetch("/api/gomla/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
  } catch {}

  try {
    await updateDoc(doc(db, "gomla_products", id), cleanUndefined(data));
  } catch {}
}

export async function deleteGomlaProduct(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nxt_gomla_products");
      if (existing) {
        const list: GomlaProduct[] = JSON.parse(existing);
        const filtered = list.filter((p) => p.id !== id);
        localStorage.setItem("nxt_gomla_products", JSON.stringify(filtered));
      }
    } catch {}
  }

  try {
    await fetch(`/api/gomla/products?id=${id}`, { method: "DELETE" });
  } catch {}

  try {
    await deleteDoc(doc(db, "gomla_products", id));
  } catch {}
}



