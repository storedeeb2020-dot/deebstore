# NXT Store — Core Features

This document provides a detailed breakdown of all the premium features and interactive capabilities implemented inside the **NXT** fashion store.

---

## 🌓 Dynamic Light & Dark Mode
NXT features a comprehensive, system-aware dark mode that allows users to seamlessly switch themes without any page refresh:
* **Zero-Flash Reload**: Injected a blocking script inside the HTML `<head>` which reads the theme from `localStorage` or OS settings and applies the `.dark` class to `document.documentElement` before the browser starts rendering, preventing the ugly white flash during page reloads in dark mode.
* **Smart Contrast Header**: When the header is scrolled, it changes styles dynamically:
  * **Light Mode**: White translucent background (`bg-white/95`) with charcoal gray text.
  * **Dark Mode**: Black translucent background (`bg-black/95`) with white text.
* **Fluid Theme Icons**: Transition button switches smoothly between a Sun and Moon icon using custom Framer Motion animations.
* **Mobile Drawer Support**: The mobile navigation slide-in menu adapts its background and link divider colors dynamically to prevent contrast failures on dark backgrounds.

---

## 🌀 Cinematic Loading Intro & 3D Logo
To give the website a highly premium editorial feel:
* **3D Logo Extrusion**: We created a custom React component (`components/ui/Logo3D.tsx`) that stacks **15 layers of the brand logo image** along the Z-axis using CSS `transformStyle: "preserve-3d"`. It includes a dynamic lighting simulation filter (progressively darkening deeper layers) and a slow rotating tilted spin.
* **Cinematic Entrance**: On page refresh, a full-screen black overlay blocks the page and loads the rotating 3D logo surrounded by three animated orbit rings. It expands into the brand tagline "DEFINE YOUR STYLE" before fading out to reveal the main website.

---

## 📐 Unified Single-Page Catalog
The shopping flow is simplified to keep user friction as close to zero as possible:
* **Instant Shop Scroll**: The Hero section displays a sleek minimal subtitle `next is yours` at the top and a prominent centered "Shop Now" white button in the middle. Clicking this scrolls the window down smoothly (`scrollIntoView: smooth`) to the products container.
* **Unified Collection**: Removed the multi-step `/shop` filter page and displayed all active products directly on the home page inside `Our Collection`.
* **Zero-Bailout Redirect**: If users try to access the old `/shop` URL directly, they are seamlessly redirected back to the main catalog section `/#products` on the homepage.

---

## 🛒 Interactive Shopping Cart & Checkout
* **Glassmorphic Slide-out Cart**: A responsive side drawer (`CartSidebar.tsx`) slides out from the right on screen. It features dynamic dark mode styling, quantity controls, product images, and auto-computed prices.
* **Dynamic Checkout**: Checks if the cart contains items before loading. If empty, it redirects back to the main store. Once billing details are completed, the order is registered directly in Firestore and a dynamic order success page is displayed.

---

## 🖼️ Adaptive Theme Banners
* **Banner Light Mode**: Features the editorial white apparel image (`banner_light.png`).
* **Banner Dark Mode**: Features the black industrial background branding image (`banner.png`).
* The system automatically detects active theme changes and swaps the banner background image instantly to fit the design aesthetic!
