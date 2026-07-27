# 03 — قاعدة البيانات وعمليات Firestore

## 🗃️ نظام قاعدة البيانات (Firebase Firestore)

يستخدم مشروع **DEEP STORE** قاعدة بيانات **Firebase Firestore** وهي قاعدة بيانات NoSQL سحابية في الوقت الفعلي (Realtime). يتم تنظيم البيانات في مجموعات (Collections) ووثائق (Documents).

---

## 📂 المجموعات الرئيسية (Collections)

### 1. مجموعة المنتجات (`products`)
تخزن كافة المنتجات المعروضة بالمتجر.
- **الحقول:**
  - `id` (string): معرف فريد (تلقائي أو مخصص).
  - `name` (string): اسم المنتج بالكامل.
  - `slug` (string): الرابط اللطيف للمنتج (URL-friendly).
  - `description` (string): وصف تفصيلي للمنتج.
  - `price` (number): السعر الأساسي.
  - `salePrice` (number | null): سعر العرض/الخصم.
  - `mainImage` (string): الصورة الأساسية للمنتج.
  - `images` (string[]): معرض صور إضافية.
  - `category` (string): اسم الفئة (Category ID or slug).
  - `featured` (boolean): هل يظهر في المنتجات المميزة؟
  - `bestSeller` (boolean): هل هو الأكثر مبيعاً؟
  - `variants` (Array): مصفوفة الخيارات (ألوان، مقاسات، ستوك)
    - `colorName` (string): اسم اللون (أصفر، أسود، إلخ).
    - `colorHex` (string): كود اللون الـ Hex.
    - `image` (string): صورة هذا اللون المحددة.
    - `sizes` (Array): مصفوفة تحتوي على المقاس والستوك المتاح له:
      - `size` (string): المقاس (L, XL, XXL, إلخ).
      - `stock` (number): الستوك المتاح لهذا المقاس.
  - `createdAt` (Timestamp): تاريخ إنشاء المنتج.

### 2. مجموعة الطلبات (`orders`)
تخزن طلبات العملاء التي تم إنشاؤها.
- **الحقول:**
  - `id` (string): معرف فريد للطلب.
  - `customerName` (string): اسم العميل بالكامل.
  - `phone` (string): رقم هاتف العميل للتواصل.
  - `whatsappPhone` (string): رقم واتساب العميل.
  - `governorate` (string): محافظة الشحن (القاهرة، الإسكندرية، إلخ).
  - `city` (string): المدينة/المنطقة.
  - `address` (string): العنوان التفصيلي.
  - `notes` (string): ملاحظات إضافية حول التوصيل.
  - `paymentMethod` (string): طريقة الدفع (`cash_on_delivery`, `vodafone_cash`, `instapay`).
  - `transferPhone` (string | null): رقم المحفظة المحول منها (في حالة فودافون كاش).
  - `transferScreenshot` (string | null): رابط إثبات الدفع (صورة الإيصال مرفوعة على Cloudinary).
  - `items` (Array): المنتجات المطلوبة:
    - `productId`, `productName`, `productImage`, `price`, `quantity`, `selectedSize`, `selectedColor`.
  - `subtotal` (number): مجموع المنتجات قبل الشحن.
  - `shippingCost` (number): تكلفة التوصيل المحتسبة للمحافظة.
  - `total` (number): إجمالي الفاتورة النهائي.
  - `status` (string): حالة الطلب (`pending`, `confirmed`, `shipping`, `delivered`, `cancelled`).
  - `createdAt` (Timestamp): تاريخ إنشاء الطلب.

### 3. مجموعة الفئات (`categories`)
تخزن الفئات المتوفرة لفرز المنتجات (مثل: تيشيرتات، هوديز، بنطلونات).
- **الحقول:**
  - `id` (string): المعرف الفريد.
  - `name` (string): اسم الفئة (مثلاً: "تيشيرتات / T-Shirts").
  - `slug` (string): الاسم اللطيف في الرابط.
  - `image` (string): صورة تمثيلية للفئة.

### 4. مجموعة الإعدادات (`site_settings`)
وثيقة واحدة باسم `general` داخل هذه المجموعة تخزن إعدادات المتجر بالكامل (CMS):
- **الحقول الرئيسية:**
  - `storeName`, `logoUrl`, `heroTagline`, `heroButtonText`.
  - `instagramUrl`, `facebookUrl`, `tiktokUrl`.
  - `vodafoneCash`, `instapayUsername`, `whatsappNumber`.
  - `announcementEnabled`, `announcementText`, `announcementColor`, `announcementLink`.
  - تفعيل وسائل الدفع: `codEnabled`, `vodafoneCashEnabled`, `instapayEnabled`.

---

## 🛠️ ملف الدوال (`lib/firebase/firestore.ts`)

يحتوي هذا الملف على كافة دوال التواصل مع Firestore. بعض الدوال الهامة:

### دوال المنتجات:
- `getProducts(filters)`: جلب كل المنتجات مع دعم الفلترة (مثال: المميزة، الأكثر مبيعاً، أو فئة معينة).
- `getProductBySlug(slug)`: جلب منتج معين باستخدام رابط الـ slug الخاص به مع البحث الفوري ودعم الـ fallback.
- `createProduct(productData)`: إنشاء منتج جديد.
- `updateProduct(id, data)`: تحديث بيانات منتج قائم.
- `deleteProduct(id)`: حذف منتج من Firestore مع حذف صورته من Cloudinary لتوفر المساحة.

### دوال الطلبات:
- `createOrder(orderInput)`: تسجيل طلب جديد للعميل واحتسابه وحفظه في Firestore.
- `getOrders()`: جلب كل الطلبات للإدارة مرتبة من الأحدث للأقدم.
- `updateOrderStatus(id, status)`: تحديث حالة الطلب (مثلاً من "قيد الانتظار" إلى "تم الشحن").

### دوال الإعدادات:
- `getSiteSettings()`: جلب الإعدادات العامة للموقع.
- `updateSiteSettings(data)`: تحديث الإعدادات (البانر، اللوجو، الشحن، أرقام الكاش).
