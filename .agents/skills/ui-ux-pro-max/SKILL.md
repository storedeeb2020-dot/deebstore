---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Searchable local database with 84 styles, 192 color palettes, 74 font pairings, 192 product types, 98 UX guidelines, 104 icon entries, 16 GSAP motion presets, and 25 chart types across 22 stacks (React, Next.js, Vue, Nuxt, Svelte, Astro, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, Jetpack Compose, Angular, Laravel, JavaFX, WPF, WinUI, Avalonia, Uno Platform, UWP, Three.js, and HTML/CSS). Integrated with 21st.dev MCP for fetching production-grade React/Tailwind/Magic UI components."
---

# UI/UX Pro Max - Design Intelligence & 21st.dev MCP Integration

Searchable database of UI/UX design rules with priority-based recommendations: 84 styles, 192 color palettes, 74 font pairings, 192 product types with reasoning rules, 98 UX guidelines, 104 icon entries, 16 GSAP motion presets, and 25 chart types across 22 technology stacks.

## 🚀 21st.dev MCP Integration
Antigravity AI is connected to the **21st.dev MCP Server** (`https://21st.dev/api/mcp`).
- **Purpose**: Fetch, inspect, and integrate production-grade React / Next.js / Tailwind components, Magic UI effects, 3D elements, and micro-interactions directly into web applications.
- **Workflow**: Combine `ui-ux-pro-max` design intelligence with `21st.dev` ready-to-use component library for maximum visual quality and rapid execution.

## Rule Categories by Priority

| Priority | Category | Impact | Domain | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | `ux` | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | `ux` | Min size 44×44px, 8px+ spacing, Loading feedback | Reliance on hover only, Instant state changes (0ms) |
| 3 | Performance | HIGH | `ux` | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | `style`, `product` | Match product type, Consistency, SVG icons (no emoji) | Mixing flat & skeuomorphic randomly, Emoji as icons |
| 5 | Layout & Responsive | HIGH | `ux` | Mobile-first breakpoints, Viewport meta, No horizontal scroll | Horizontal scroll, Fixed px container widths, Disable zoom |
| 6 | Typography & Color | MEDIUM | `typography`, `color` | Base 16px, Line-height 1.5, Semantic color tokens | Text < 12px body, Gray-on-gray, Raw hex in components |
| 7 | Animation | MEDIUM | `ux`, `gsap` | Duration 150–300ms, Motion conveys meaning, Spatial continuity | Decorative-only animation, Animating width/height, No reduced-motion |
| 8 | Forms & Feedback | MEDIUM | `ux` | Visible labels, Error near field, Helper text, Progressive disclosure | Placeholder-only label, Errors only at top, Overwhelm upfront |
| 9 | Navigation Patterns | HIGH | `ux` | Predictable back, Bottom nav ≤5, Deep linking | Overloaded nav, Broken back behavior, No deep links |
| 10 | Charts & Data | LOW | `chart` | Legends, Tooltips, Accessible colors | Relying on color alone to convey meaning |

---

## Workflow

### Step 1: Analyze User Requirements & Query 21st.dev
- **Product type**: SaaS, e-commerce, portfolio, dashboard, tools, etc.
- **21st.dev Search**: Fetch tailored Tailwind / React component primitives from 21st.dev MCP repository when needed.

### Step 2: Apply Design Intelligence Rules
1. **Typography**: Pair display font with legible body font (e.g. Geist Display + Geist Sans).
2. **Color Palette**: Lock one brand accent color with semantic contrast (4.5:1 minimum).
3. **Motion**: Use spring physics (`120 stiffness`, `18 damping`) and GPU-accelerated properties (`transform`, `opacity`, `filter`).
4. **Layout**: Responsive grid math, `min-h-[100dvh]` for hero sections, and clean spacing.
