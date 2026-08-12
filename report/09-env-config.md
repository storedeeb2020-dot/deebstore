# 09 — متغيرات البيئة والإعدادات (Environment Variables)

يعتمد مشروع **DEEP STORE** على مجموعة من متغيرات البيئة للربط مع الخدمات السحابية (Firebase و Cloudinary) وحماية البيانات السرية.

---

## 🔑 1. ملف متغيرات البيئة (`.env.local`)

يجب إنشاء ملف باسم `.env.local` في جذر المشروع يحتوي على المتغيرات التالية:

```env
# ─── Firebase Client Configurations ─────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ─── Firebase Admin SDK Configurations (For Server Side) ──
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."

# ─── Cloudinary Configurations (For Image Uploads) ────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ─── Admin Access Configuration ───────────────────────────
ADMIN_PASSWORD=your_dashboard_secure_password
```

> ⚠️ **ملاحظة أمنية:** لا يجب أبداً رفع ملف `.env.local` على GitHub أو أي نظام لإدارة النسخ. تأكد من إضافته في ملف `.gitignore`.

---

## ⚙️ 2. ملفات إعدادات الأدوات

### Next.js Config (`next.config.ts`)
يحتوي على إعدادات استضافة الصور لـ Cloudinary و Firebase Storage للسماح لـ Next.js بتحسين الصور:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }
    ],
  },
  experimental: {
    // تفعيل الـ server actions للميزات المتقدمة
    serverActions: true,
  }
};

export default nextConfig;
```

### Tailwind Config (`tailwind.config.ts`)
يحتوي على الألوان الرسمية للمتجر (Pure Black `#000000` والأصفر الكهرماني `amber-400`).

### Firebase Config (`lib/firebase/config.ts`)
يتحقق من وجود إعدادات Firebase ويقوم بتهيئة تطبيق Firebase للعميل (Client SDK) وقاعدة البيانات `db` والمصادقة `auth`.

---

### 💻 التطوير والتصميم
> **الموقع مصمم بواسطة: يوسف أسامة**  
> 📞 **رقم الهاتف:** `01020451206`
