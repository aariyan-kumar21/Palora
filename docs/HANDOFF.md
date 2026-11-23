# Palora Storefront - Architecture & Developer Handoff

Welcome to the **Palora Handcrafted Gifts** web application codebase. This project has been migrated from vanilla HTML/CSS/JS into a high-performance **Vite + React 18 + TypeScript** architecture with **plain CSS** (no Tailwind, pure design tokens).

---

## 1. Architecture Overview

### Technology Stack
- **Framework**: React 18 with TypeScript 5
- **Bundler & Dev Server**: Vite 6
- **Routing**: `react-router-dom` v6 with route-level code-splitting (`React.lazy` + `Suspense`)
- **Styling**: Pure CSS powered by design tokens (`src/styles/tokens.css`, `base.css`, and modular page stylesheets)
- **Interactive UI Components**:
  - **React Bits CardNav**: Top animated expandable search bar with "palora" literal hex palette, live filtering of products, categories, and collections, and direct QuickView launch.
  - **React Bits ClickSpark**: Canvas burst engine configured with `trigger="none"` and operated via `SparkProvider` + `useSpark()` hook for heart wishlist toggles and QuickView Add-to-Cart buttons.
  - **DepthCarousel**: 3D category carousel with auto-advance (3.5s), drag, touch, keyboard, and pause controls.

### Directory Structure
```
Palora/
├── dist/                      # Production build output
├── legacy/                    # Read-only archive of the original vanilla site (reference only)
├── public/
│   └── assets/                # Static images, icons, and hero artwork
├── src/
│   ├── components/            # Reusable shared UI components
│   │   ├── CardNav/           # React Bits CardNav search component & styles
│   │   ├── CartModal/         # Slide-out cart modal & WhatsApp checkout action
│   │   ├── ClickSpark/        # Canvas spark effect & SparkProvider context
│   │   ├── DepthCarousel/     # 3D category carousel
│   │   ├── FloatingWhatsApp/  # Floating WhatsApp quick button
│   │   ├── Footer/            # Global footer with 5 columns & watermark
│   │   ├── Header/            # Desktop navbar (--nav-h: 92px)
│   │   ├── Icon/              # Verified SVG icon library
│   │   ├── MenuDrawer/        # Slide-out navigation drawer (488px, literal hex)
│   │   ├── ProductCard/       # Card component ('slider' & 'catalogue' variants)
│   │   ├── QuickView/         # Native <dialog> modal with personalization input
│   │   ├── SavedPanel/        # Wishlist drawer with live counter
│   │   ├── ScrollToHash/      # Smooth scroll helper for hash anchors
│   │   ├── SearchPanel/       # CardNav integration layer with lazy prefetching
│   │   └── Toast/             # Global feedback toast notifications
│   ├── context/               # React Context providers (UIContext, CartContext, SavedContext)
│   ├── data/                  # Typed data models (products.ts, categories.ts, collections.ts, config.ts)
│   ├── features/
│   │   ├── home/              # Hero, Benefits, Bestsellers, Below-the-fold
│   │   └── collections/       # Collections & filtering catalog page
│   ├── hooks/                 # Custom React hooks (usePageMeta)
│   ├── pages/                 # Static pages (Story, Help, Privacy, NotFound)
│   ├── styles/                # CSS stylesheets (tokens, base, home, catalogue, pages, story)
│   ├── App.tsx                # Main application wrapper with providers
│   ├── main.tsx               # DOM entry point
│   └── routes.tsx             # Route definitions with lazy loading
├── scripts/
│   └── parity.mjs             # Visual regression & DOM bounding verification suite
├── docs/                      # Documentation and handoff guides
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 2. Configuration & Store Settings (`src/data/config.ts`)

Store business details are centralized in `src/data/config.ts`:

- **WhatsApp Phone Number**: Set `WHATSAPP_NUMBER` (e.g., `'919876543210'`). When empty (`''`), the UI automatically disables WhatsApp checkout ("WhatsApp ordering coming soon") and hides direct WhatsApp contact buttons.
- **Instagram**: Set `INSTAGRAM_URL` and `INSTAGRAM_HANDLE`.
- **Email**: Set `EMAIL` (optional).

---

## 3. How-To Guides for Developers

### How to Add or Edit a Product
Open `src/data/products.ts` and add an entry to the `PRODUCTS` array conforming to the `Product` interface:
```typescript
{
  id: 'custom-wooden-frame',
  name: 'Custom Wooden Frame',
  price: 899,
  badge: 'Personalizable',
  collection: 'frames-letters',
  category: 'designed-frames',
  occasions: ['anniversaries', 'birthdays'],
  customizable: true,
  featured: true, // Set to true to include in Home Bestsellers slider
  image: '/assets/products/custom-wooden-frame.jpg',
  description: 'Handmade wooden frame with personalized engraving.'
}
```

### How to Add a New Category
1. Open `src/data/categories.ts`.
2. Add an entry to the `CATEGORIES` array:
```typescript
{
  slug: 'wooden-crafts',
  label: 'Wooden Crafts',
  type: 'product', // 'product' matches product.category; 'occasion' matches product.occasions
  summary: 'Handcrafted wood carvings and keepsake decor.'
}
```
3. Add the corresponding icon in `src/components/Icon/Icon.tsx` if a new symbol is needed.

### How to Add a New Route
1. Create your page component in `src/pages/YourPage/YourPage.tsx`.
2. Open `src/routes.tsx` and register a lazy import:
```typescript
const YourPage = lazy(() => import('./pages/YourPage/YourPage'));
```
3. Add `<Route path="/your-path" element={<YourPage />} />` inside `<Routes>`.

---

## 4. Key Performance & Architecture Rules

1. **Literal Hex Colors on Dark Surfaces**:
   Always use literal hex values (e.g. `#5E2A31`, `#5A1F29`, `#4A2328`, `rgba(...)`) for dark backgrounds and text on dark surfaces. Never use CSS variables on dark surfaces to prevent browser background painting dropouts.
2. **Drawer & Modal Out-of-Layout State**:
   When closed, drawers and panels must have `visibility: hidden`, `transform: translateX(100%)`, `pointer-events: none`, no box shadow, and carry the `hidden` attribute.
3. **Route & Below-The-Fold Code Splitting**:
   All routes are loaded via `React.lazy`. The homepage splits above-the-fold (`Hero` + `Benefits`) and below-the-fold content (`HomeBelowFold`) via `IntersectionObserver` with reserved min-height placeholders to eliminate Cumulative Layout Shift (CLS).

---

## 5. Development & Testing Commands

```bash
# Start Vite development server
npm run dev

# Run TypeScript type check and production build
npm run build

# Preview production build locally
npm run preview

# Run automated parity, visual screenshot & bounding rect verification suite
npm run parity
```
