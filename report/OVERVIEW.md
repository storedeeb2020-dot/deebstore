# NXT Store — Project Overview

Welcome to **NXT**, a state-of-the-art, premium fashion e-commerce platform designed for modern minimalism and luxury. The website features an ultra-responsive single-page shopping interface, fluid 3D cinematic animations, complete dark/light mode compatibility, and a fully integrated Firebase backend.

---

## 📁 Project Architecture & Directory Structure

The project is built on **Next.js 15 (App Router)** and follows a structured, clean, and modular folder layout:

```text
nxt/
├── app/                        # Next.js App Router root
│   ├── (admin)/                # Administrative routes (Dashboard, settings)
│   │   └── admin/              # Admin dashboard pages
│   ├── (store)/                # E-commerce store routes
│   │   ├── about/              # Brand story/about page
│   │   ├── checkout/           # Checkout & billing page
│   │   ├── contact/            # Customer support & social handles
│   │   ├── order-success/      # Post-purchase confirmation page
│   │   └── products/           # Dynamic product detail screens ([slug])
│   ├── api/                    # Serverless API routes (Authentication, Admin SDK)
│   ├── globals.css             # Root Tailwind styles & CSS theme variables
│   └── layout.tsx              # Root HTML wrapper with providers
│
├── components/                 # Reusable UI & Layout Components
│   ├── cart/                   # Shopping cart sidebar and logic drawer
│   ├── home/                   # Homepage components (Hero, Intro screen, collection)
│   ├── layout/                 # Main structure layout (Header, Footer)
│   ├── products/               # Product display items (Cards, Grid, details)
│   └── ui/                     # Generic reusable controls (Buttons, 3D Logo, spin)
│
├── features/                   # Core business logic providers & state hooks
│   ├── auth/                   # User authentication state (AuthProvider)
│   ├── cart/                   # Shopping cart state management (CartProvider)
│   └── theme/                  # Dark/light theme state machine (ThemeProvider)
│
├── hooks/                      # Custom React hooks (useScroll, etc.)
│   
├── lib/                        # Integrations & Utilities
│   ├── firebase/               # Firebase Client & Admin SDK initializers
│   ├── utils.ts                # Tailwind merge helper
│   └── validations/            # Zod validation schemas
│
├── public/                     # Static media assets (Logo, dynamic banners)
│
└── push_to_github.bat          # Automated deployment helper script
```

---

## 🚀 Key Design Philosophies

1. **Cinematic First Impression**: A fluid, floating 3D logo animation greets the user on first load, accompanied by a expanding ring animation to establish brand prestige.
2. **Seamless Navigation**: Simplified into a clean single-page catalog directly under the header. No unnecessary clicks, filters, or page reloads.
3. **Responsive Glassmorphism & Contrast**: Adapts beautifully to mobile, desktop, and tablets. Uses dynamic backdrops, glass blurs, and adaptive inverting logo images to remain highly legible on both light and dark backgrounds.
4. **Instant Actionable Checkout**: Simplifies order placement into a single billing form that records orders on Firestore securely and automatically redirects upon completion.
