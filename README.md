# ELDEEB STORE — Setup Guide

## 🔗 Firebase Setup

1. افتح [Firebase Console](https://console.firebase.google.com/project/deebstore-c8bfa)
2. **Authentication** → Enable Email/Password → أضف `storedeeb2020@gmail.com`
3. **Firestore Database** → Create Database → Start in Test Mode
4. **Firestore Rules** — ضع هذه القواعد:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for products, categories, settings, shipping
    match /products/{id} { allow read: if true; allow write: if request.auth != null; }
    match /categories/{id} { allow read: if true; allow write: if request.auth != null; }
    match /settings/{id} { allow read: if true; allow write: if request.auth != null; }
    
    // Orders: anyone can create, only admin can read/update
    match /orders/{id} { allow create: if true; allow read, update, delete: if request.auth != null; }
    
    // Complaints: anyone can create, only admin can read/manage
    match /complaints/{id} { allow create: if true; allow read, update, delete: if request.auth != null; }
    
    // Coupons: read for validation, write for admin only
    match /coupons/{id} { allow read: if true; allow write: if request.auth != null; }
    
    // Errors: anyone can write, only admin can read
    match /errors/{id} { allow create: if true; allow read, delete: if request.auth != null; }
  }
}
```

## 🚀 Vercel Deployment

1. سجّل في [vercel.com](https://vercel.com)
2. اربط بـ GitHub → ارفع المجلد `deep-store`
3. أو استخدم Vercel CLI:
   ```bash
   npm i -g vercel
   cd d:/deep/deep-store
   vercel
   ```

## 🤖 Val.town Chatbot

1. سجّل في [val.town](https://www.val.town/)
2. أنشئ HTTP Val جديد باسم `eldeeb_chat`
3. ضع هذا الكود:

```javascript
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

export default async function handler(req) {
  const { message } = await req.json();
  
  const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `أنت مساعد متجر ELDEEB STORE لملابس الستريت وير الفاخرة.
  أجب بالعربية بشكل ودود ومختصر.
  إذا سأل عن منتج → اقترح التواصل على واتساب.
  إذا سأل عن طلب → اطلب رقم الطلب.
  سؤال العميل: ${message}`;
  
  const result = await model.generateContent(prompt);
  const reply = result.response.text();
  
  return Response.json({ reply });
}
```

4. أضف متغير `GEMINI_API_KEY` في Val.town Environment Variables
5. انسخ URL الـ endpoint وضعه في إعدادات الأدمن

## 📁 File Structure
```
deep-store/
├── index.html       ← الموقع الرئيسي
├── styles.css       ← التصميم
├── app.js           ← منطق الموقع
├── vercel.json      ← إعدادات Vercel
├── package.json
└── admin/
    ├── index.html   ← لوحة التحكم
    ├── admin.css    ← تصميم الأدمن
    └── admin.js     ← منطق الأدمن
```
