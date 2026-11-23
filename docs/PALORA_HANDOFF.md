# Palora Website: Project Handoff (read this first)

Last updated: 2026-11-23. This file carries the context of a very long previous chat so the work can continue in a new chat/account. **The most important thing is Section 1: the project is switching from a plain HTML/CSS/JS site to a React (Vite + TypeScript) site.** Everything else is context you need to execute that shift without breaking the approved design.

---

## 0. How to work with this user (assistant rules; follow strictly)

- The user is a freelancer building a website for a small business (the client). They build with **Google Anti-Gravity IDE** (agent "chats"), using **Gemini 3.8 Flash**. They ask **me (Claude)** to write **prompts** that they paste into Anti-Gravity. Recommended thinking level for Gemini: **Medium** by default, **Low** for mechanical prompts (git commit/push), **High** only after Medium fails twice or for huge multi-file refactors.
- **Never write a prompt or take action until the user explicitly says so.** When new requirements arrive: first give decisions/suggestions (short, honest, unbiased), then wait for "go ahead". This was stated as a strict rule.
- **Follow the stated requirements literally.** Do not substitute own ideas (the user got annoyed when I did). Offer opinions as suggestions, then do what they decide. Ask at most one question per reply.
- **Laptop view only** for all prompts until the user says to start the tablet/mobile pass.
- **Port, do not redesign.** The design was approved after many iterations; "design drift" caused big trouble before. Wherever a reference screenshot exists, match it exactly.
- Prompts are given in **code blocks** so they can be pasted. Every prompt: scope line (laptop only), ownership header (which files this chat may edit), "Do not run git commands" (commits are separate git prompts), "Do not ask questions", a VERIFY section (screenshots at 1900x868, console checks), and a request for a short summary at the end.
- The user works in **two parallel Anti-Gravity chats** (Chat 1 = Main, Chat 2 = Secondary) to move faster. Rules: strict file ownership, shared files edited by Chat 1 only, a `docs/WORKING_RULES.md` + `docs/HANDOFF.md` handoff file, rounds with a test + commit between them. Git prompts: run Chat 1's commit/push first, then Chat 2's, never in parallel; stage by explicit path only (never `git add -A`), never force-push.
- The user types by dictation: messages can be garbled ("R's R's 2 story" = "Our Story"). Interpret kindly; state the interpretation briefly when ambiguous.
- Icons/SVGs were drawn by me and **verified by rendering them** (Playwright screenshot) before being put into prompts, because Gemini's own drawn icons were bad. Keep doing that for any new icon.
- Lesson learned (bug): an undefined CSS variable inside a `background` makes the whole declaration invalid, leaving the element transparent (this made the footer and drawer text invisible). For dark surfaces use **literal hex values**, not CSS variables.
- The user is the sole owner of the codebase; the client does **not** want code access, only an admin panel.

---

## 1. THE LATEST SHIFT: migrate the site to React (this is the plan now)

### Why
The user wants a smoother, more alive, more animated site using ready-made **React Bits** components (reactbits.dev). The client does not touch code, so "keep it simple plain JS for handoff" no longer matters; the code stays with the user. Note for honesty: React itself does not make a site smoother; the animation libraries and careful performance do. React gives access to the components and a clean structure for admin-driven data.

### Decisions already made
- **Full migration to React**: Vite + React + **TypeScript** + React Router + **plain CSS** (no Tailwind; use the "TS-CSS" variants of React Bits components). State via React Context (cart, saved items, UI panels), persisted in localStorage.
- **The site structure and design stay EXACTLY as they are now** (all pages, sections, copy, spacing, colors, behavior). Changes come only when the user asks in later prompts. The old site is the visual reference: tag it `v1-vanilla`, work on a new branch, move the old code into a read-only `legacy/` folder, and build a **parity script** (`npm run parity`) that screenshots each legacy page vs the React page at 1900x868 side by side. Every round must pass `npm run build` and the visual parity check.
- **Load speed is a top priority** ("really fast from the code side"): only load what the current page needs, and load more as the user scrolls (see Performance plan).
- **Slide Commit** (React Bits micro-interaction "slide to confirm") is used for placing the order: **it confirms sending the order on WhatsApp, not payment** (there is no payment gateway). Label: "Slide to place order on WhatsApp". **Phone: swipe the handle. Laptop: the same slider, working by mouse drag OR by a click** (the click animates the handle to the end and runs the action). Also keyboard accessible (Enter/Space) and a hidden accessible button for screen readers. Because of iOS/Safari popup rules, on commit navigate to the WhatsApp link immediately (`location.href` / direct navigation), not after a long async delay. If no WhatsApp number is configured, the control is disabled ("WhatsApp ordering coming soon").
- **Click Spark** (burst of sparks): used only on the wishlist/saved heart toggles, not globally. Adapt so one shared canvas overlay fires from the heart's position when toggled (burgundy/pink sparks, short).
- **Animated Content** (scroll reveal): subtle site-wide section/card reveals (fade + rise, ~600ms, once per element), staggered; not on the hero/first screen; not wrapping the draggable slider track; respect `prefers-reduced-motion`. The user first suggested it for the bestsellers.
- **Depth Carousel** (React Bits) for the categories section: use the real component with our 11 categories, our card design, auto-advance ON (3.5s), pause on hover/focus/drag + pause button, links to `/collections?category=<slug>`.
- **Admin portal**: the client needs to add products, images, descriptions and prices. Plan: **two connected sites**: the store (React) and an admin site = **Sanity Studio** (hosted admin UI; no custom admin to build). Sanity free plan (as of Aug-Sep 2026 sources, verify before launch): 20 seats, 10,000 documents, 2 datasets (public only), 1M API CDN requests/month, 250k API requests/month, 100GB bandwidth and 100GB assets; **hard caps with no overages** (functionality is blocked when a quota is reached). Public dataset means never store private customer data there (orders stay in WhatsApp). Studio lives in its own `studio/` folder (ideal for the secondary chat).
- React Bits license is **MIT + Commons Clause**; the maintainer says using the components inside a commercial website bundled with Vite is allowed (the restriction is about repackaging/selling components or templates).

### Still undecided (defaults in brackets; confirm with the user before the relevant phase)
1. **Navbar**: React Bits **Card Nav** (bar that springs open into cards) **vs** keeping the current sidebar drawer that replicates the user's mockup. [Default: keep the sidebar drawer. They can't coexist on the same hamburger button.] Decide before Phase 2.
2. **Masonry** (image gallery with lightbox): the user wanted it for Collections; my advice: not for the product grid (uniform cards scan better with filters), use it as a gallery section on Our Story. [Default: Story gallery.] Decide before Phase 4.
3. **Fonts**: self-host (e.g. @fontsource, faster, fewer third-party requests; would require updating the Privacy page sentence that says fonts are loaded from Google Fonts) vs Google Fonts link. The user will research and decide. [Default if undecided: Google Fonts with preconnect, switch later.]
4. **Hosting** (Netlify or Vercel) and domain: later (Phase 6).
5. **Real WhatsApp number** (client will provide later) and optional email.

### Performance plan (user requirement: code-side speed, no lag; do not load what the page doesn't need)
- **Route-level code splitting**: every page is a lazy route (`React.lazy` + `Suspense`); opening Home loads only the Home chunk. Prefetch likely next routes on hover/idle (e.g. Collections when the nav link is hovered).
- **Inside Home**: above-the-fold (navbar, hero, benefits strip) in the initial chunk. Everything below (Bestselling, Categories depth carousel, How ordering works, Personalize banner, Footer) is lazy-loaded when it is near the viewport (IntersectionObserver, rootMargin about 600px), with reserved min-height placeholders to prevent layout shift. Heavy libraries (animation libs, carousel code) are imported only inside those lazy chunks.
- **Images**: modern formats (WebP/AVIF), explicit width/height, `loading="lazy"` below the fold, hero image preloaded with `fetchpriority="high"` and sized correctly; later Sanity CDN transformations. Placeholders are CSS gradients (no image requests).
- **Fonts**: only the weights/styles used, `font-display: swap`, preload critical ones.
- **Bundle budget** (targets): initial JS for Home about 150KB gzipped or less; Lighthouse mobile performance 90+ target; LCP under 2.5s on 4G, CLS under 0.1, INP under 200ms; check with a bundle analyzer after installing each React Bits component (they pull animation dependencies such as GSAP/Motion; dependency lists are not shown on their pages, check after install).
- **Animations**: transform/opacity only, short durations (400-700ms), once-only reveals, pause offscreen, no animation on the LCP element, honor `prefers-reduced-motion`, `will-change` sparingly.
- No third-party scripts. Cache headers/compression via Netlify/Vercel. Skeleton/loading/error states when products load from Sanity.

### Proposed stack and structure
```
src/
  main.tsx, App.tsx, routes.tsx (all pages pre-registered as lazy routes)
  styles/ tokens.css, base.css
  components/   shared UI: Header, Drawer (menu), Footer, SavedPanel, CartModal, ProductCard (variants), QuickView, FloatingWhatsApp, Toast, Icon      -> Chat 1
  context/      CartContext, SavedContext, UIContext                                                                                                      -> Chat 1
  data/         products.ts, categories, collections, config (typed)                                                                                      -> Chat 1
  lib/          later: Sanity client/data layer                                                                                                           -> Chat 1
  features/home/                                                                                                                                         -> Chat 1
  features/collections/, pages/Story, pages/Help, pages/Privacy                                                                                          -> Chat 2
studio/         Sanity Studio (separate package)                                                                                                         -> Chat 2
legacy/         the old plain-JS site, read-only reference
docs/           WORKING_RULES.md, HANDOFF.md
```
Hash anchors (`/help#shipping`) need a ScrollToHash helper; query params (`?category=`, `?collection=`, `?customizable=1`) via `useSearchParams`; per-page titles via a small `usePageMeta` hook; static Open Graph tags in `index.html` (Instagram previews); SPA redirect rule on the host.

### Phases (two-chat split)
| Phase | Chat 1 (Main) | Chat 2 (Secondary) |
|---|---|---|
| 0. Prep | Git prompt: commit/push, tag `v1-vanilla`, create branch (e.g. `react-migration`), move old site to `legacy/` | idle |
| 1. Foundation (Chat 1 alone) | Scaffold Vite+React+TS, tokens/base CSS ported from legacy, routes (all lazy), contexts (cart, saved, UI), typed data, icon component, docs files, parity script, build/lint gate | idle |
| 2. Shared parts | Header, Drawer, Footer, Cart modal, Saved panel, ProductCard, QuickView, FloatingWhatsApp, Toast | Sanity Studio (schema, validation, deploy config) + Story/Help/Privacy pages |
| 3. Main pages | Home page | Collections page |
| 4. Animation pass | Click Spark on hearts, Slide Commit in cart, nav animation (if Card Nav chosen) | Animated Content across pages, Masonry (placement TBD) |
| 5. Sanity connection | Store reads products from Sanity (loading/error states), data layer swap | Studio deployed, existing 12 products moved in, short how-to for the client |
| 6. Finish | Tablet/mobile pass, speed + accessibility checks, page titles, favicon, 404, deployment + domain, final QA | same for its pages |

Each round: build passes, parity check vs legacy, then the user tests and commits (git prompts per chat, in sequence).

### Immediate next steps for the new chat
1. Ask the user to confirm the defaults above (especially nav and Masonry) and the fonts decision when ready.
2. When the user says "go": write the **Phase 0 git prompt** (tag + branch + legacy move) and then the **Phase 1 foundation prompt** (Chat 1 only). Do not write anything before the go-ahead.
3. First, ask the user to verify the state of the vanilla site (see Section 8) before tagging it.

---

## 2. Project overview

**Palora**: boutique handmade gifting business (small client). Storefront for browsing handmade gifts, adding personalization notes per item, and ordering **without an account**. **No payment gateway**: the cart compiles items, prices, quantities and personalization notes into a text, URL-encodes it and opens **WhatsApp (`wa.me/<number>?text=...`)** so the owner finalizes the order. Traffic mostly comes from **Instagram on phones**, so mobile matters before launch (the mobile/tablet pass is postponed, laptop first).

Original spec (from `project_context.md`): vanilla HTML/CSS/JS, zero backend, mobile-first intended (min 44px touch targets, 16px inputs), "Thoughtful Pink" theme, product cards need an item-specific personalization text input (it lives in the Quick View dialog), cart modal slides in, value proposition bar (customizable gifts, handmade care, pan-India shipping). Client categories: Keychains, Home decor, Birthdays, Anniversaries, Just because, Bouquets & flowers, Crochet items, Designed frames, Letters and cards, Hampers, Festivals. Future phase (now being done): admin panel. Business Instagram: `https://www.instagram.com/palora.giftsstore` (handle `palora.giftsstore`). WhatsApp number: **pending from the client** (empty in config; every WhatsApp UI hides itself until set; the cart's WhatsApp button shows disabled "WhatsApp ordering coming soon"). Email: optional/empty.

## 3. Design tokens

- Fonts: **Cormorant Garamond** (all headings, nav, body, buttons; weights 400-700, italics 500/600) and **Jost** (500/600) for tiny uppercase tracked labels, eyebrows and numerals. Prices use lining numerals (`font-variant-numeric: lining-nums`; fallback Jost if Cormorant's digits stay old-style).
- Colors: page bg `#FAF0E9` (peach-cream), card surface `#FFFBF8`/`#FFF8F4`, deep burgundy headings `#6A1F2C`, deep text `#5A1623`, burgundy buttons `#722F37`, body brown `#572E2E`, cream text on dark `#FFF7F2`, dusty pink `#D7A7B1`, blush beige strip `#EAD3CB`, badge pill `#F2C4CE`, placeholder pink gradients `#F6D3D9 -> #EFBCC6 -> #E4A2B0`, hero fallback `#E3A8A4 / #E0A29E / #E5A9A5`, cart badge `#B5173A`.
- Dark surfaces (literal hex!): footer gradient `#5E2A31 -> #4A2328`; drawer base `#5A1F29` with radial highlight top-left and two soft circles (top-left ellipse `rgba(255,196,205,.07)`, bottom-right circle `rgba(255,150,170,.14)`).
- Icons: thin line, stroke currentColor, 1.5px (24px viewBox), rounded caps; all verified SVGs live in the legacy `js/icons.js` (key, house, mail, instagram, heart/filled, gift, yarn, gem, flower, frame, grid, sliders, chevrons, leaf, shield, truck, headset, chat, cake, hearts, lotus, pause/play...).
- Breakpoint scope for now: laptop (1024px+), main test size **1900x868** (also 1536x730).

## 4. Pages and structure to PRESERVE EXACTLY (the legacy site is the source of truth; exact copy lives in its files)

Pages: `index` (Home), `catalogue` (Collections), `story` (Our Story), `help` (Help & FAQs; anchors `#how-to-order #personalization #shipping #returns #faqs #contact`), `privacy`. Every page has the shared navbar + footer + floating WhatsApp + cart + saved panel.

**Navbar** (identical on all pages; one implementation): fixed, height was 115px, **user asked to reduce about 12% to 140px**; links `HOME  COLLECTIONS  OUR STORY` (Jost 500, 12px, uppercase, tracking .25em, #6A1F2C, 48px gap; active = weight 600 + 2px underline 6px below); centered wordmark `PALORA` (Cormorant 500, 30px, tracking .28em) over `HANDMADE GIFTS` (Jost 9px, tracking .3em); right: **Saved heart** (badge hidden at 0), **cart** (badge), **hamburger** ring button (48px circle, two lines, fills burgundy on hover, X when open). Transparent over the hero on Home (burgundy links, cream icons) and solid `#FAF0E9` with hairline after 40px scroll; solid from the start on other pages; page content starts exactly below the bar (no gap).

**Menu drawer** (replicates the user's mockup; width fixed **488px**, right side, full height; header fixed / nav area scrolls / footer block fixed): wordmark 38px + tagline; plain thin X close; MENU group: 01 Home, 02 Collections, 03 Our Story, 04 Bestsellers (labels Cormorant 500 white, numerals Jost); HELP: How ordering works, Shipping & delivery, Returns & personalized orders, (hairline), FAQs, Contact; CONNECT: Order on WhatsApp row (only if number set) + Instagram row (@palora.giftsstore); footer: italic tagline "Thoughtful, personalized handmade gifts turning simple moments into lasting memories." + Privacy Policy link; decorative corner shapes; **gift line-art illustration** bottom-right (replaced an earlier bow; white line, ~150x150). Pending tweaks requested (status unconfirmed): footer block lower and smaller text, menu labels about 15% smaller. Backdrop `rgba(58,12,24,.56)` + 1.5px blur; focus trap, Esc, backdrop click, scroll lock, focus return.

**Home** (section ids in order): `#hero`, `#benefits`, `#bestsellers`, `#categories`, `#how-it-works`, `#personalize`, footer.
- **Hero**: full-bleed photo `assets/hero.png` (gift box with burgundy ribbon and monogram tag, candle, baby's-breath flowers) anchored right at 85% width with a left fade mask into a matching gradient background (no seam); text block left edge at 9.5vw: eyebrow "THOUGHTFUL GIFTS FOR EVERY OCCASION" with a short line, headline **"MAKE EVERY / MOMENT / SPECIAL."** (uppercase Cormorant 500, SPECIAL. italic, ~54px at 868px height), italic subtext "Customizable, handmade gifts that turn simple moments into lasting memories." (2 lines), text link "EXPLORE OUR COLLECTIONS" with a long thin arrow (to Collections); **vertical SCROLL indicator** at the left (text reading bottom-to-top, a thin line, down arrow; links to `#bestsellers`). Hero + benefits strip fill the first screen exactly (benefits flush with the viewport bottom).
- **Benefits strip** (bg `#EAD3CB`, ~100px): Customizable Gift "Add a personal touch to every gift." / Handmade Gifts "Crafted with care and attention." / Pan India Shipping "Delivering happiness to your doorstep."; titles uppercase tracked Cormorant 600, descriptions italic; 44px verified icons (gift, hand-holding-heart, truck with speed lines); thin vertical dividers.
- **Bestselling**: eyebrow "CURATED FOR YOU", lined heading "Bestselling Collection" (thin line each side), slider with 4 cards visible, 44px round arrows outside the track, drag + arrows, then a text link "VIEW ALL PRODUCTS" to Collections. Card: surface `#FFFBF8`, radius 14, soft shadow, image area 3:2 with pink gradient placeholder + faint gift icon, badge pill top-left, name (Cormorant 700, 20px), price (600, 18px) with a heart at the right of the price row.
- **Categories** ("A Gift for Every Moment", eyebrow "EXPLORE OUR CATEGORIES", burgundy gradient section): **depth carousel of all 11 categories in the order listed above**, auto-advance ON (3.5s), pause on hover/focus/drag, pause button, arrows, dots, keyboard, drag; active card shows name, "N PIECES" and Explore; cards link to Collections filtered by category. The user said this section is good: keep as is.
- **How Ordering Works** (eyebrow "SIMPLE & PERSONAL"): 01 Choose "Browse our categories and pick the piece you love." / 02 Personalize "Add a name, message or colour preference. We'll make it yours." / 03 Confirm on WhatsApp "Send your order on WhatsApp. We confirm the details, delivery time and payment with you."; "Learn more" to Help.
- **Personalize banner**: pink gradient rounded panel, "Make It Truly Yours", "Add names, messages, colors and more to / create a gift as unique as your bond.", burgundy button "Start Personalizing →" (to Collections), ribbon/tag photo fading on the right; below it a 4-item trust strip: Handcrafted with Care / Order on WhatsApp / Reliable Delivery / Dedicated Support (the original "Secure Checkout" was removed because there is no payment gateway).
- **Footer** (dark gradient, must be readable): top band "Make every moment special." + "Browse our handmade gifts and make them yours." + "Explore Collections" button (+ WhatsApp button if number set); 5 columns: Brand (wordmark, tagline, Instagram/WhatsApp round buttons), Shop by category (All products + the 11 categories in two sub-columns, linking `?category=`), Help (anchors), Company (Our Story, Bestsellers, Privacy Policy), Get in touch (WhatsApp button if set, Instagram handle, email if set, "Delivering across India", "Every piece is made to order. Delivery timing is confirmed on WhatsApp when you place your order."); faint huge "PALORA" watermark; bottom bar with copyright, Privacy Policy, Back to top. No placeholder text; rows without data are not rendered.

**Collections page**: full-bleed banner (eyebrow "EXPLORE OUR", italic heading "Collections", 2-line subtext "A curated range of handcrafted gifts, each / made with care, creativity and a personal touch.", hero photo on the right with fade); centered pill row (All Collections + Crochet Crafts, Resin Keepsakes, Floral & Decor, Frames & Letters, Luxe Hampers, each with an icon; active pill burgundy); two columns: sticky **Filters** card (280px: Price Range dual slider Rs.100 to Rs.5,000+, Category = the 11 categories with counts, Personalization = Customizable (count), Clear all filters) and results (count text "N Products", Sort by select: Newest/Price low-high/Price high-low/Name A-Z), 4-column product grid (card variant: badge top-left, heart in a white circle top-right on the image, name, price). Filters combine with AND across groups, OR within categories. URL params: `?collection=`, `?category=a,b`, `?customizable=1`. Empty state "No pieces match these filters." Filters/pills are independent (pills = collection, sidebar = category).

**Our Story / Help & FAQs / Privacy**: shared page banner (same style as Collections: min-height ~280-340px, eyebrow Jost 13px tracked, italic heading one line, subtext). **Story copy was written by me with no invented facts** (no names, dates, locations, numbers, materials, certifications): "Made by Hand, Given with Love"; sections Why we make what we make / How each piece comes to life (Made to order, Made by hand, Made personal) / What we believe (4 values) / CTA band "Have something special in mind?" with Explore Collections (+ WhatsApp if set). **Help**: sticky anchor card + sections (How to order, Personalization, Shipping & delivery, Returns & personalized orders, FAQs as accessible `<details>`, Contact) with no numbers/timelines/fees promised. **Privacy**: plain-language (no accounts, no payments, cart/saved stored in browser, WhatsApp/Instagram third parties, Google Fonts mention [update if fonts change], no tracking cookies/analytics [update if added], "Last updated: November 2026").

**Cart / Saved / Quick view / extras**: cart modal slides in (items with quantity and personalization note; "Questions? See Help & FAQs" line; WhatsApp checkout builds the message); **Saved panel** (heart icon in navbar replaced the dead search icon; lists saved products from localStorage key `palora_wishlist`, live-updating badge, remove, quick view); **Quick view dialog** (native `<dialog>`: image, badge, name, price, description, "PERSONALIZE IT" input maxlength 120 with counter, quantity 1-10, Add to Cart; toast "Added to cart"; badge pulse); **floating WhatsApp button** bottom-right on every page (hidden if no number).

## 5. Data model (to be typed in `src/data`, later fed by Sanity)

`Product`: `id, name, price (number), badge ("Bestseller"|"New"|"Handmade"|"Personalizable"|"Luxe"), collection, category, occasions[], customizable (bool), featured (bool), image, description`. Prices format with `Intl.NumberFormat("en-IN")` (Rs.1,049). Default description: "Handmade to order with care. Add a personalization note below." Order = newest first; "Newest" sort uses the list order.

**COLLECTIONS (5)**: `crochet-crafts` Crochet Crafts (icon yarn), `resin-keepsakes` Resin Keepsakes (gem), `floral-decor` Floral & Decor (flower), `frames-letters` Frames & Letters (frame), `luxe-hampers` Luxe Hampers (gift).

**CATEGORIES (11, this exact order; type)**: keychains (product), home-decor (product), birthdays (occasion), anniversaries (occasion), just-because (occasion), bouquets-flowers (product), crochet-items (product), designed-frames (product), letters-cards (product), hampers (product), festivals (occasion). Labels: Keychains, Home decor, Birthdays, Anniversaries, Just because, Bouquets & flowers, Crochet items, Designed frames, Letters and cards, Hampers, Festivals. `productsInCategory(slug)`: product-type categories match `product.category`, occasion categories match `product.occasions`.

**PRODUCTS (12; first 8 are the ones from the user's mockups; the last 4 are SAMPLES to replace)**
| id | name | price | badge | collection | category | occasions | customizable | featured |
|---|---|---|---|---|---|---|---|---|
| crochet-sunflower-bouquet | Crochet Sunflower Bouquet | 899 | Bestseller | crochet-crafts | crochet-items | birthdays, just-because | no | yes |
| floral-resin-coasters | Floral Resin Coasters | 649 | New | resin-keepsakes | home-decor | festivals | yes | yes |
| crochet-bunny | Crochet Bunny | 1049 | Handmade | crochet-crafts | crochet-items | birthdays | no | yes |
| custom-photo-frame | Custom Photo Frame | 799 | Personalizable | frames-letters | designed-frames | anniversaries | yes | yes |
| self-care-hamper | The Self-Care Hamper | 2499 | Luxe | luxe-hampers | hampers | just-because | no | no |
| initial-resin-keychain | Initial Resin Keychain | 349 | Personalizable | resin-keepsakes | keychains | birthdays | yes | no |
| crochet-rose-bouquet | Crochet Rose Bouquet | 1199 | Bestseller | crochet-crafts | bouquets-flowers | anniversaries, just-because | no | no |
| scented-soy-candle | Scented Soy Candle | 599 | Handmade | floral-decor | home-decor | festivals, just-because | no | no |
| personalized-name-keychain (SAMPLE) | Personalized Name Keychain | 299 | Personalizable | resin-keepsakes | keychains | birthdays, anniversaries | yes | yes |
| letter-and-card-set (SAMPLE) | Handwritten Letter & Card Set | 349 | Handmade | frames-letters | letters-cards | anniversaries | yes | yes |
| festive-gift-hamper (SAMPLE) | Festive Gift Hamper | 1499 | New | luxe-hampers | hampers | festivals | no | yes |
| mini-floral-bouquet (SAMPLE) | Mini Floral Bouquet | 599 | Bestseller | floral-decor | bouquets-flowers | birthdays, just-because | no | yes |
Occasion tagging is placeholder (so every category has at least one product); the 8 `featured` products feed the Bestselling slider. Product photos do not exist yet (images go in `assets/products/<id>.jpg`; category photos in `assets/categories/<slug>.jpg`; story images in `assets/story/`); until then cards use pink gradient placeholders with a faint icon and `onerror` removes missing images. Use **real photos of the actual handmade items** (not AI-generated) before launch.

**Sanity schema (to build in `studio/`)**: product with `name`, `slug`, `price` (number, required, min), `badge` (select), `collection` (select of 5), `category` (select of the 7 product-type categories), `occasions` (multi-select of the 4 occasions), `customizable` (boolean), `featured` (boolean), `images` (array, first = main), `description` (text), plus an order/publish date for "Newest". Store reads via the CDN API with a data layer returning the same `Product` shape so pages do not change.

## 6. Verification habits (keep using)
Screenshots at **1900x868** (and 1536x730) for every round; print `getBoundingClientRect()` tables to prove the navbar is identical on all pages (within 1px); contrast checks (WCAG 4.5:1) on dark surfaces; console must be error-free; no horizontal scrollbar. A **dark gray vertical bar (~8x50px) at x~12, y~385** appears in every user screenshot: most likely a browser/screenshot-tool artifact, not a page element (confirm via `document.elementsFromPoint`).

## 7. Admin and hosting notes
- Admin = Sanity Studio (deployed separately, client logs in). Free plan figures in Section 1. Alternatives considered and rejected: custom Firebase admin (too much work, security rules), Google Sheets (poor for images).
- Hosting TBD (Netlify/Vercel, free tier, auto-deploy from GitHub). Needs SPA redirect rule. Env var for the Sanity project ID later.
- Before launch: real WhatsApp number in config, real photos, replace the 4 sample products, update Privacy page if fonts/analytics change, mobile/tablet pass, Lighthouse mobile check, favicon + Open Graph image, 404 page.

## 8. State of the plain-JS site at the time of this handoff (verify before tagging `v1-vanilla`)
Confirmed working in the last screenshots: new navbar structure with Saved heart, redesigned menu drawer (close to the mockup), depth carousel section, personalization banner + strip, Collections page layout, Our Story banner (had bugs listed below). **Unconfirmed (prompts were given but results not yet seen)**: restored original Home hero and Bestselling cards (they had drifted: hero photo seam/text position/size, Bestselling cards lost their styling and the card heart was broken), footer rebuild (its dark background was not painting; a fix prompt was given), navbar identical across pages (spacing differed between pages), Our Story page bug fixes (heading wrapped, mismatched banner), and the last small tweaks (gift illustration in the drawer, drawer footer block, smaller menu labels, navbar 160px to 140px). The user should check these (or send screenshots) before the migration starts, and those fixes are then carried over into the React port.

## 9. Known pitfalls to avoid in the React port
Undefined CSS variables on dark backgrounds (use literals); closed drawers/panels leaking into layout or shadows at the viewport edge (closed = `visibility:hidden`, off-screen, no shadow, `hidden` attribute); per-page differences in nav height/padding (one nav component, one `--nav-h`); CSS scoping leaks (variant styles like the catalogue card must be scoped to their class); invented facts in copy (never invent names, dates, numbers, materials or certifications); icon drift (reuse the verified SVGs).
