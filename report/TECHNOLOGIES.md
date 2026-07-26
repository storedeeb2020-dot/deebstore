# NXT Store — Technologies Stack

NXT leverages modern frontend paradigms, client-side animations, and serverless database providers to ensure extremely fast loading times, complete type safety, and zero deployment friction.

---

## 🛠️ Core Technologies

| Technology | Purpose | Description |
| :--- | :--- | :--- |
| **Next.js 15.5** | App Framework | React framework providing server rendering, static site generation, client-side navigation, and optimized production builds. |
| **React 19** | UI Library | Handles component states, hydration, context providers, and dynamic rendering logic. |
| **Tailwind CSS 3** | Styling Engine | Utility-first CSS processing that handles dark mode states via root classes (`.dark`) and theme color mappings. |
| **Framer Motion** | Physics Animations | Orchestrates fluid animations, slide-out drawer spring curves, logo entry transitions, and badge counts. |
| **Firebase Client SDK** | Backend-as-a-Service | Real-time SDK linking user queries directly to Firestore databases, Storage buckets, and Client Authentication. |
| **Firebase Admin SDK** | Serverless Backend | Safe backend administration initialized lazy-only at runtime to bypass Next.js build-time prerendering bailouts. |
| **Lucide Icons** | SVG Vector Assets | High-quality, responsive vector icons used for menus, shopping bags, trash, and sun/moon toggles. |
| **Sonner** | Toasters | Highly polished, minimal notification popups for cart additions, errors, and successful checkout states. |
| **TypeScript** | Type Safety | Enforces strict compiler rules on data structures, checkout forms, product properties, and hook returns. |

---

## 🔒 Firebase Integration Architecture

To guarantee the e-commerce store runs smoothly on client side, we use a dual Firebase strategy:

### 1. Client-Side Firebase (`lib/firebase/config.ts`)
* Uses direct, public config keys to initialize the client app.
* Enforces smart singleton logic to prevent re-initialization warnings during development hot-reloads.
* Automatically exports `auth` (Authentication), `db` (Firestore), and `storage` (File uploads).

### 2. Server-Side Firebase Admin (`lib/firebase/admin.ts`)
* Wraps dangerous Admin SDK methods in lazy-loading proxy accessors.
* **Build-Safety**: Next.js pre-compiles server layouts during static builds. By lazy-initializing `adminAuth` and `adminDb` only when API routes are actively requested, we prevent the Next.js build server from crashing when environment keys are absent.
