# NXT — Premium Fashion E-Commerce

> **Modern Luxury Fashion Platform** — Built with Next.js 15, Firebase, Cloudinary, and Framer Motion.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Fill in your Firebase and Cloudinary credentials
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Setup

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named `nxt`
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Copy your config to `.env.local`

### Firebase Admin (for session cookies)
1. Firebase Console → Project Settings → Service Accounts
2. Generate a new private key → download JSON
3. Copy `project_id`, `client_email`, `private_key` to `.env.local`

### Create Admin User
1. Go to Firebase Console → Authentication → Add user
2. Set their email/password
3. Copy their UID
4. In Firestore → Create collection `admins` → Add document with ID = UID

### Firestore Security Rules
1. Firestore Console → Rules tab
2. Copy contents of `firestore.rules` and publish

### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Add upload preset
3. Set name to `nxt_products`, mode = **Unsigned**
4. Copy your Cloud Name to `.env.local`

---

## 📁 Project Structure

```
nxt/
├── app/
│   ├── (store)/           # Public store pages
│   │   ├── page.tsx       # Home
│   │   ├── shop/          # Products listing
│   │   ├── products/[slug]/ # Product detail
│   │   ├── cart/          # Cart
│   │   ├── checkout/      # Checkout
│   │   ├── order-success/ # Confirmation
│   │   ├── contact/       # Contact
│   │   ├── privacy/       # Privacy
│   │   └── terms/         # Terms
│   ├── (admin)/           # Admin dashboard
│   │   └── admin/
│   │       ├── login/     # Admin login
│   │       ├── page.tsx   # Dashboard
│   │       ├── orders/    # Order management
│   │       ├── products/  # Product CRUD
│   │       ├── customers/ # Customers
│   │       ├── categories/
│   │       └── settings/
│   ├── api/
│   │   └── admin/auth/    # Session cookie API
│   ├── robots.ts
│   ├── sitemap.ts
│   └── globals.css
├── components/
│   ├── layout/            # Header, Footer
│   ├── home/              # Intro, Hero, Products, Collections
│   ├── products/          # ProductCard, ProductGrid
│   ├── cart/              # CartSidebar
│   ├── admin/             # ProductForm, ImageUploader
│   └── ui/                # Button, Input, Modal, Badge...
├── features/
│   ├── auth/              # AuthProvider
│   └── cart/              # CartProvider
├── hooks/                 # useScroll, useMediaQuery
├── lib/
│   ├── firebase/          # config, admin, auth, firestore
│   ├── validations/       # Zod schemas
│   └── cloudinary.ts
├── types/                 # TypeScript interfaces
├── middleware.ts          # Admin route protection
└── firestore.rules
```

---

## 🎨 Design System

### Color Palette
| Token | Value |
|-------|-------|
| Background | `#FFFFFF` |
| Foreground | `#000000` |
| Gray 100 | `#F5F5F5` |
| Accent | `#111111` |
| Muted | `#6B7280` |

### Product Card — Floating Effect
Product images are transparent PNGs that blend seamlessly on the white background using `mix-blend-mode: multiply`. This creates the "floating" product visual — no card borders, no background color.

```css
/* Applied to all product images */
.product-img {
  mix-blend-mode: multiply;
  object-fit: contain;
}
```

> ⚠️ **Important**: Upload PNG images with **transparent or white backgrounds** for best results. Images with colored backgrounds won't blend correctly.

---

## 🛡️ Firestore Collections

| Collection | Purpose |
|------------|---------|
| `products` | All product data |
| `categories` | Product categories |
| `orders` | Customer orders |
| `users` | Customer accounts |
| `admins` | Admin UIDs (document ID = Firebase UID) |
| `settings` | Store settings |

### Product Schema
```typescript
{
  name: string;
  slug: string;          // URL-friendly
  description: string;
  price: number;         // EGP
  salePrice?: number;
  category: string;
  brand: string;
  sizes: string[];       // ["S", "M", "L", "XL"]
  colors: { name: string; hex: string }[];
  stock: number;
  images: string[];      // Cloudinary URLs only
  featured: boolean;
  bestSeller: boolean;
  createdAt: Timestamp;
}
```

### Order Schema
```typescript
{
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: "vodafone_cash" | "instapay";
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  createdAt: Timestamp;
}
```

---

## 🚀 Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: complete DEEP STORE platform"
git remote add origin https://github.com/storedeeb2020-dot/deebstore.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add all environment variables from `.env.local`
4. Deploy!

### 3. Update Environment Variables
- Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL
- All other env vars from `.env.local`

---

## 📱 Features

### Store
- ✅ Cinematic intro screen (once per session)
- ✅ Full-screen hero with luxury imagery
- ✅ Floating product cards (transparent images, mix-blend-mode)
- ✅ Quick View on product hover
- ✅ Collections grid (Men, Women, New Arrivals, Best Sellers)
- ✅ Product filtering + sorting
- ✅ Product detail with image gallery, size/color picker
- ✅ Animated cart sidebar + full cart page
- ✅ Checkout with Vodafone Cash / InstaPay
- ✅ Order confirmation page

### Admin
- ✅ Secure admin login (Firebase Auth)
- ✅ Dashboard with stats
- ✅ Product CRUD with Cloudinary multi-upload
- ✅ Order management with status pipeline
- ✅ Customer list
- ✅ Category management

### Technical
- ✅ TypeScript throughout
- ✅ Zod validation
- ✅ Framer Motion animations
- ✅ Responsive (mobile, tablet, desktop)
- ✅ SEO metadata, sitemap, robots.txt
- ✅ Firebase Security Rules
- ✅ Session cookie auth for admin

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | Full-stack framework |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Firebase Auth | Authentication |
| Cloud Firestore | Database |
| Firebase Admin | Server-side auth |
| Cloudinary | Image hosting |
| React Hook Form | Forms |
| Zod | Validation |
| Sonner | Toast notifications |
| Lucide Icons | Icons |

---

## 📞 Support

For any issues, contact: nxteraa953@gmail.com

© 2026 NXT — All rights reserved.
