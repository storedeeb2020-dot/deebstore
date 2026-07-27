# 02 — هيكل المجلدات والـ Routing

## 🗂️ هيكل المجلدات الكامل

```
deep-store/
│
├── app/                          ← Next.js App Router (الصفحات)
│   ├── (store)/                  ← Route Group للمتجر العام
│   │   ├── layout.tsx            ← Layout المتجر (Header + Footer)
│   │   ├── page.tsx              ← الصفحة الرئيسية
│   │   ├── products/             ← صفحة تفاصيل منتج
│   │   ├── shop/                 ← صفحة كل المنتجات
│   │   ├── cart/                 ← صفحة السلة
│   │   ├── checkout/             ← صفحة إتمام الطلب
│   │   ├── about/                ← صفحة عن المتجر
│   │   ├── contact/              ← صفحة تواصل معنا
│   │   ├── order-success/        ← صفحة نجاح الطلب
│   │   ├── privacy/              ← سياسة الخصوصية
│   │   └── terms/                ← الشروط والأحكام
│   │
│   ├── (admin)/                  ← Route Group للأدمن
│   │   └── admin/
│   │       ├── layout.tsx        ← Layout الأدمن (Sidebar + Auth)
│   │       ├── page.tsx          ← داشبورد الأدمن
│   │       ├── products/         ← إدارة المنتجات
│   │       ├── orders/           ← إدارة الطلبات
│   │       ├── categories/       ← إدارة الكاتيجوريز
│   │       ├── customers/        ← إدارة العملاء
│   │       ├── messages/         ← الرسائل
│   │       ├── shipping/         ← إعدادات الشحن
│   │       ├── settings/         ← إعدادات المتجر
│   │       ├── login/            ← تسجيل دخول الأدمن
│   │       └── errors/           ← صفحة الأخطاء
│   │
│   ├── api/                      ← API Routes
│   │   └── chat/                 ← ChatBot API (AI)
│   │
│   ├── layout.tsx                ← Root Layout (Providers)
│   ├── globals.css               ← CSS العام
│   ├── sitemap.ts                ← SEO Sitemap
│   └── robots.ts                 ← SEO Robots
│
├── components/                   ← المكونات المشتركة
│   ├── admin/                    ← مكونات لوحة الإدارة
│   ├── cart/                     ← مكونات السلة
│   ├── checkout/                 ← مكونات إتمام الطلب
│   ├── home/                     ← مكونات الصفحة الرئيسية
│   ├── intros/                   ← شاشات الإدخال (Intro Animations)
│   ├── layout/                   ← Header, Footer, AnnouncementBar
│   ├── products/                 ← مكونات المنتجات
│   ├── store/                    ← مكونات المتجر
│   ├── ui/                       ← مكونات UI الأساسية
│   └── wishlist/                 ← مكونات المفضلة
│
├── features/                     ← Business Logic منفصل
│   ├── auth/                     ← منطق المصادقة
│   ├── cart/                     ← CartProvider (Context)
│   ├── theme/                    ← ThemeProvider
│   └── wishlist/                 ← WishlistProvider (Context)
│
├── lib/                          ← المكتبات والأدوات
│   ├── firebase/
│   │   ├── config.ts             ← إعداد Firebase
│   │   └── firestore.ts          ← كل دوال قاعدة البيانات
│   ├── cloudinary.ts             ← رفع الصور
│   ├── utils.ts                  ← دوال مساعدة عامة
│   ├── syncAssets.ts             ← مزامنة الأصول
│   └── validations/              ← Zod Schemas
│
├── types/                        ← TypeScript Types
│   ├── product.ts                ← نوع المنتج
│   ├── order.ts                  ← نوع الطلب
│   ├── category.ts               ← نوع الكاتيجوري
│   └── user.ts                   ← نوع المستخدم
│
├── hooks/                        ← Custom React Hooks
├── constants/                    ← القيم الثابتة
├── public/                       ← الملفات الثابتة (صور، favicon)
└── report/                       ← التوثيق (هذا المجلد)
```

---

## 🛣️ نظام الـ Routing

### Route Groups
المشروع يستخدم **Route Groups** في Next.js:

| المجموعة | الوصف | Layout |
|---|---|---|
| `(store)` | صفحات المتجر العام | Header + Footer + Providers |
| `(admin)` | صفحات الأدمن | Sidebar + Auth Guard |

> **Route Groups** لا تؤثر على الـ URL — مثلاً `(store)/page.tsx` هو `/` مش `/(store)/`

### كيف يعمل الـ Admin Guard؟
```
طلب → /admin/* 
  ↓
middleware.ts يتحقق من Cookie
  ↓
إذا مفيش Auth Cookie → /admin/login
إذا فيه Auth → يعدي للصفحة
```

### الـ Layout Hierarchy
```
app/layout.tsx          ← Root (Providers: Cart, Wishlist, Theme, Auth)
  └── (store)/layout.tsx    ← Store (AnnouncementBar + Header + Footer)
       └── page.tsx / products/page.tsx / ...

  └── (admin)/admin/layout.tsx  ← Admin (Sidebar + AuthGuard)
       └── admin/page.tsx / admin/products/page.tsx / ...
```
