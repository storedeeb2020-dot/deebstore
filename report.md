# تقرير مشروع متجر الملابس العربي الفاخر — ديب ستور (DEEP STORE)

## 📌 1. نظرة عامة على المشروع (Project Overview)
**ديب ستور (DEEP STORE)** هو متجر إلكتروني فاخر متخصص في موضة وملابس الـ Streetwear الفاخرة باللغة العربية. تم تصميمه ببنية جديدة تماماً وشكل استثنائي يعتمد على **الـ Dark Obsidian Mode (أسود فاخر `#050505`)** مع **لمسات ذهبية ملكية (Royal Gold Palette `#D4AF37`)** وتجربة شراء تفاعلية فائقة السلاسة.

### 🌟 الهوية والخصائص الرئيسية:
- **أنترو سينمائي مخصص بالفيديو (Intro Video)**: تشغيل الفيديو السينمائي الخاص بالبراند (`assets/intro.mp4`) عند الدخول الأول للموقع مع زر لدخول المتجر، تخطي، وأدوات الصوت والتقدم.
- **كروت المنتجات العائمة (Floating Borderless Cards)**: كروت منتجات بدون أي حواف أو إطارات خارجية (`border: none`). خلفية الصور سوداء استوديو تندمج تماماً مع أرضية الموقع لتعطي إحساس طفو المنتج الفاخر في الهواء.
- **ثيم دارك وذهبي فاخر (Dark Obsidian & Gold)**: ألوان ملكية ناعمة تعتمد على التدرج الذهبي (`#D4AF37` و `#FFF3A8` و `#AA771C`) على أرضية سوداء عصرية.
- **واجهة كاملة باللغة العربية (RTL System)**: دعم كامل للاتجاه من اليمين إلى اليسار مع الخط العربي الملكي `Cairo`.
- **أدوات التسوق السريعة (Cart + Wishlist + Menu)**:
  - سلة تسوق جانبية تفاعلية (Cart Drawer) لحساب الكميات وتطبيق الخصومات وإتمام الطلب.
  - قائمة المفضلة الجانبية (Wishlist Drawer) لحفظ القطع المميزة مع إمكانية نقلها للسلة بنقرة واحدة.
  - منيو وقائمة جانبية (Navigation Menu Drawer) وشريط بحث فوري ذكي.
- **لوحة تحكم شاملة للمتجر (Arabic Admin Dashboard)**:
  - إحصائيات وتقارير المبيعات، عدد الطلبات، والمنتجات.
  - إدارة المنتجات (إضافة منتج، تعديل، حذف، تغيير التوفر، الأسعار بالجنيه المصري EGP، المقاسات S/M/L/XL/XXL والألوان).
  - إدارة كافة طلبات العملاء وتعديل حالة الشحن والتوصيل.

---

## 🗄️ 2. هيكل البيانات (Database Schema & Catalog)

### أ. المنتجات (`products` dataset)
```json
[
  {
    "id": "prod_1",
    "name": "هودي أسود فاخر — Deep Royal Gold Hoodie",
    "price": 1850,
    "salePrice": 1450,
    "category": "hoodies",
    "categoryName": "هوديز",
    "inStock": true,
    "bestSeller": true,
    "featured": true,
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["أسود ملكي", "ذهبي مطفي"],
    "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop"
  },
  {
    "id": "prod_2",
    "name": "تيشيرت أوفراسايز ذهبي — Deep Gold Oversized Tee",
    "price": 950,
    "salePrice": 750,
    "category": "t-shirts",
    "categoryName": "تيشيرتات",
    "inStock": true,
    "bestSeller": true,
    "featured": true,
    "sizes": ["M", "L", "XL"],
    "colors": ["أسود", "أبيض عاجي"],
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop"
  },
  {
    "id": "prod_3",
    "name": "جاكيت جلد التمساح — Black Obsidian Leather Jacket",
    "price": 3200,
    "salePrice": null,
    "category": "jackets",
    "categoryName": "جاكيتات",
    "inStock": true,
    "bestSeller": false,
    "featured": true,
    "sizes": ["M", "L", "XL"],
    "colors": ["أسود فحم"],
    "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop"
  },
  {
    "id": "prod_4",
    "name": "بنطال كارجو ستريت وير — Deep Cargo Streetwear",
    "price": 1150,
    "salePrice": 950,
    "category": "pants",
    "categoryName": "بناطيل",
    "inStock": true,
    "bestSeller": true,
    "featured": false,
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["أسود", "زيتي غامق"],
    "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop"
  },
  {
    "id": "prod_5",
    "name": "طقم المخمل الذهبي المحدود — Gold Velvet Limited Edition",
    "price": 4500,
    "salePrice": 3900,
    "category": "gold-collection",
    "categoryName": "التشكيلة الذهبية",
    "inStock": true,
    "bestSeller": true,
    "featured": true,
    "sizes": ["M", "L", "XL"],
    "colors": ["ذهبي ملكي"],
    "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop"
  }
]
```

### ب. الطلبات (`orders` dataset)
```json
[
  {
    "id": "ORD-DEEP-901",
    "customerName": "أحمد محمود",
    "phone": "01012345678",
    "governorate": "القاهرة",
    "address": "شارع التحرير، الدقي",
    "total": 1500,
    "status": "pending",
    "createdAt": "2026-07-26T21:30:00Z"
  }
]
```

---

## 🏗️ 3. البنية البرمجية والملفات (`d:/deep/deep-store`)
- **[index.html](file:///d:/deep/deep-store/index.html)**: الهيكل العربي الكامل RTL مع الانترو السينمائي، المعرض، السلة، المفضلة، المنيو، واستمارة إتمام الطلب ولوحة التحكم.
- **[styles.css](file:///d:/deep/deep-store/styles.css)**: النمط الذهبي الفاخر `#D4AF37` على الخلفية السوداء `#050505` مع تأثيرات كروت المنتجات العائمة بدون حواف والإضاءة الذهبية.
- **[app.js](file:///d:/deep/deep-store/app.js)**: منطق التطبيق (تفاعلات الانترو بالفيديو، الفلترة الفورية، سلة التسوق، قائمة المفضلة، إتمام الطلب، ولوحة التحكم بالكامل مع التزامن التلقائي).

---

### 💻 التطوير والتصميم
> **الموقع مصمم بواسطة: يوسف أسامة**  
> 📞 **رقم الهاتف:** `01020451206`
