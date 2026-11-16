# Working Rules & Ownership

## Chat 1 (Current Agent) Scope
Owns:
- `index.html`
- `css/home.css`
- `js/home.js`
- `css/base.css`
- `js/config.js`
- `js/products.js`
- `js/icons.js`
- `js/slider.js`
- `js/layout.js`
- `js/cart.js`
- `js/product-ui.js`
- `js/nav.js`
- `js/saved.js`
- `js/depth-carousel.js`
- `assets/categories/`
- `docs/*`

Do NOT touch Chat 2's files. Do not run git commands.

## Chat 2 Scope
Owns:
- `catalogue.html`
- `css/catalogue.css`
- `js/catalogue.js`
- `story.html`
- `help.html`
- `privacy.html`
- `css/story.css`
- `css/pages.css`
- `js/help.js`

## Page Contract
- Pages:
  - `index.html` (home)
  - `catalogue.html` (query params: `?collection=<slug>`, `?category=<slug>`, `?customizable=1`)
  - `story.html`
  - `help.html` (anchors: `#how-to-order`, `#personalization`, `#shipping`, `#returns`, `#faqs`, `#contact`)
  - `privacy.html`
- Every page format:
  - `<body data-page="home|catalogue|story|help|privacy">`
  - `<header id="site-header"></header>`
  - `<main id="main">`
  - `<footer id="site-footer"></footer>`
  - Shared scripts in order before page script:
    1. `js/config.js`
    2. `js/products.js`
    3. `js/icons.js`
    4. `js/slider.js`
    5. `js/layout.js`
    6. `js/cart.js`
    7. `js/product-ui.js`
    8. `js/nav.js`
    9. `js/saved.js`
    Followed by page script (e.g. `js/depth-carousel.js`, `js/home.js`).

## Shared Helpers Available
- `CATEGORIES`
- `productsInCategory(slug)`
- `countInCategory(slug)`
- `COLLECTIONS`
- `PRODUCTS`
- `hasWhatsApp()`
- `waLink(text)`
- `INSTAGRAM_URL`
- `INSTAGRAM_HANDLE`
- `icon(name, options)`
- `renderProductCard(product, index, variant)`
