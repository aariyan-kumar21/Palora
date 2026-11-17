const fs = require('fs');
const { execSync } = require('child_process');

// Fetch the clean base.css before the corruption
const originalBase = execSync('git show 5cee2e7:css/base.css').toString('utf8');

// Let's inspect sections in originalBase
// 1. Tokens
// 2. Reset & Base Styles
// 3. Shared Utilities
// 4. Global Header (we will replace with restored header)
// 5. Hamburger Slide-In Drawer (we will replace with restored drawer)
// 6. Saved Items Panel
// 7. Cart Modal
// 8. QuickView Dialog
// 9. Floating WhatsApp Button
// 10. Global Footer (we will replace with restored footer)
// 11. Product Card & Badge Pill (we will replace with restored card)
// 12. Toast & Utilities

const tokensIdx = originalBase.indexOf('/* --------------------------------------------------------------------------\n   1. Design Tokens & CSS Variables');
const headerIdx = originalBase.indexOf('/* --------------------------------------------------------------------------\n   4. Global Header');
const savedIdx = originalBase.indexOf('/* --------------------------------------------------------------------------\n   6. Saved Items Panel (Slide-in)');
const footerIdx = originalBase.indexOf('/* --------------------------------------------------------------------------\n   10. Global Footer (5 columns)');
const toastIdx = originalBase.indexOf('/* Toast */');

console.log({ tokensIdx, headerIdx, savedIdx, footerIdx, toastIdx });

// Part 1: Tokens, Reset, Utilities (up to Global Header)
let part1 = originalBase.substring(0, headerIdx);
// Ensure --nav-h: 115px is in tokens
part1 = part1.replace('--header-height: 84px;', '--nav-h: 115px;\n  --header-height: var(--nav-h);');
// Add [hidden] { display: none !important; }
part1 += `
/* Accessibility fallback: hidden elements must never render in document flow */
[hidden] {
  display: none !important;
}
`;

// Part 2: Restored Header (Section 4)
const headerBlock = `
/* --------------------------------------------------------------------------
   4. Global Header (Fixed height 115px, exact geometry across all pages)
   -------------------------------------------------------------------------- */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--nav-h, 115px);
  z-index: 1000;
  display: flex;
  align-items: center;
  transition: background-color var(--transition-smooth), border-color var(--transition-smooth), box-shadow var(--transition-smooth);
}

/* Home page transparent header when at top */
body[data-page="home"] .site-header:not(.scrolled) {
  background-color: transparent;
  border-bottom: 1px solid rgba(114, 47, 55, 0.1);
  color: #5A1623;
}

/* Solid header state: on scroll or any page other than home */
.site-header.scrolled,
body:not([data-page="home"]) .site-header {
  background-color: #FAF0E9;
  border-bottom: 1px solid rgba(114, 47, 55, 0.1);
  box-shadow: 0 4px 20px rgba(87, 46, 46, 0.05);
  color: #5A1623;
}

.site-header .header-inner {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 4.5vw;
}

/* Nav Menu (Left) */
.nav-menu {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 48px;
}

.nav-link {
  font-family: var(--font-jost);
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: #6A1F2C;
  position: relative;
  padding-block: 6px;
  transition: color var(--transition-fast);
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #5A1623;
  transition: width var(--transition-fast);
}

.nav-link:hover {
  color: #5A1623;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-link.active {
  font-weight: 600;
  color: #5A1623;
}

/* Wordmark (Center) */
.site-wordmark {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 1;
  color: #5A1623 !important;
}

.wordmark-title {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 30px;
  letter-spacing: 0.28em;
  margin-right: -0.28em;
  color: #5A1623;
  line-height: 1;
}

.wordmark-tagline {
  font-family: var(--font-jost);
  font-weight: 500;
  font-size: 9px;
  letter-spacing: 0.3em;
  margin-right: -0.3em;
  margin-top: 5px;
  color: #5A1623;
  opacity: 0.85;
  line-height: 1;
}

/* Header Action Controls (Right) */
.header-actions {
  position: absolute;
  right: clamp(24px, 3.5vw, 67px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 28px;
}

.icon-btn {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: #6A1F2C;
  transition: background-color var(--transition-fast), transform var(--transition-fast), color var(--transition-fast);
}

.icon-btn:hover {
  background-color: rgba(114, 47, 55, 0.08);
  color: #5A1623;
}

/* Badge for Saved & Cart */
.saved-badge,
.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: var(--burgundy);
  color: var(--icon-cream);
  font-family: var(--font-jost);
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  padding-inline: 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Hamburger 2-line button (48px circle, 2 lines) */
.hamburger-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(114, 47, 55, 0.25);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  color: #5A1623;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.hamburger-btn:hover {
  border-color: rgba(114, 47, 55, 0.5);
  background-color: rgba(114, 47, 55, 0.05);
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 1.5px;
  background-color: #5A1623;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.hamburger-btn.is-open .hamburger-line:first-child {
  transform: translateY(4.25px) rotate(45deg);
}

.hamburger-btn.is-open .hamburger-line:last-child {
  transform: translateY(-4.25px) rotate(-45deg);
}
`;

// Part 3: Restored Menu Drawer (Section 5)
const drawerBlock = `
/* ==========================================================================
   /* ===== MENU DRAWER ===== */
   Slide-in drawer: 460px wide, full height, deep burgundy gradient, cream text
   ========================================================================== */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(40, 18, 22, 0.55);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), visibility 450ms ease;
}

.mobile-drawer-overlay.is-open {
  opacity: 1;
  visibility: visible;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 460px;
  max-width: 90vw;
  height: 100vh;
  height: 100dvh;
  background: radial-gradient(circle at top right, rgba(242, 196, 206, 0.16), transparent 60%),
              linear-gradient(165deg, #5E2A31 0%, #722F37 55%, #572E2E 100%);
  color: #FFF7F2;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  padding: 40px 44px;
  transform: translateX(110%);
  visibility: hidden;
  pointer-events: none;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), visibility 450ms ease;
  box-shadow: -12px 0 36px rgba(40, 18, 22, 0.35);
  overflow: hidden;
}

.mobile-drawer.is-open {
  transform: translateX(0);
  visibility: visible;
  pointer-events: auto;
}

.drawer-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 247, 242, 0.15);
  flex-shrink: 0;
}

.drawer-wordmark {
  display: flex;
  flex-direction: column;
}

.drawer-wordmark-title {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 26px;
  letter-spacing: 0.28em;
  color: #FFF7F2;
  line-height: 1;
}

.drawer-wordmark-tagline {
  font-family: var(--font-jost);
  font-weight: 500;
  font-size: 9px;
  letter-spacing: 0.3em;
  color: rgba(255, 247, 242, 0.8);
  margin-top: 4px;
  line-height: 1;
}

.drawer-close-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 247, 242, 0.35);
  color: #FFF7F2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.drawer-close-btn:hover {
  background-color: rgba(255, 247, 242, 0.12);
  border-color: #FFFFFF;
}

.drawer-scroll-content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 247, 242, 0.3) transparent;
  padding: 28px 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.drawer-scroll-content::-webkit-scrollbar {
  width: 5px;
}

.drawer-scroll-content::-webkit-scrollbar-thumb {
  background: rgba(255, 247, 242, 0.25);
  border-radius: 9999px;
}

.drawer-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-group--menu {
  gap: 12px;
}

.drawer-group--help {
  gap: 12px;
}

.drawer-group--connect {
  gap: 14px;
}

.drawer-group-label {
  font-family: var(--font-jost);
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 247, 242, 0.6);
}

.drawer-menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-menu-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  color: #FFF7F2;
  transition: transform 250ms ease, color 200ms ease;
  position: relative;
  width: fit-content;
  text-decoration: none;
  padding-block: 4px;
}

.drawer-menu-idx {
  font-family: var(--font-jost);
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  opacity: 0.7;
}

.drawer-menu-label {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: clamp(2rem, 3.2vh, 2.6rem);
  line-height: 1.1;
}

.drawer-menu-arrow {
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 200ms ease, transform 200ms ease;
  color: #F2C4CE;
  align-self: center;
}

.drawer-menu-row:hover {
  transform: translateX(10px);
  color: #F2C4CE;
}

.drawer-menu-row:hover .drawer-menu-arrow {
  opacity: 1;
  transform: translateX(0);
}

.drawer-menu-row.is-active {
  color: #F2C4CE;
}

.drawer-menu-row.is-active::before {
  content: "";
  position: absolute;
  left: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #F2C4CE;
}

/* Staggered Row Reveal Animation */
@keyframes drawerItemFade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-drawer.is-open .drawer-menu-row:nth-child(1) { animation: drawerItemFade 0.4s ease 0.08s both; }
.mobile-drawer.is-open .drawer-menu-row:nth-child(2) { animation: drawerItemFade 0.4s ease 0.14s both; }
.mobile-drawer.is-open .drawer-menu-row:nth-child(3) { animation: drawerItemFade 0.4s ease 0.20s both; }
.mobile-drawer.is-open .drawer-menu-row:nth-child(4) { animation: drawerItemFade 0.4s ease 0.26s both; }

.drawer-help-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-help-link {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: rgba(255, 247, 242, 0.85);
  transition: color var(--transition-fast);
  display: inline-block;
  text-decoration: none;
}

.drawer-help-link:hover {
  color: #FFFFFF;
  text-decoration: underline;
}

.drawer-wa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: transparent;
  border: 1px solid rgba(255, 247, 242, 0.5);
  color: #FFF7F2;
  min-height: 48px;
  padding: 0 24px;
  border-radius: 10px;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.1rem;
  transition: all var(--transition-fast);
  width: fit-content;
  text-decoration: none;
}

.drawer-wa-btn:hover {
  background-color: #FFF7F2;
  color: #722F37;
  border-color: #FFF7F2;
}

.drawer-ig-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-jost);
  font-size: 0.95rem;
  color: rgba(255, 247, 242, 0.85);
  margin-top: 4px;
  transition: color var(--transition-fast);
  text-decoration: none;
}

.drawer-ig-row:hover {
  color: #FFFFFF;
  text-decoration: underline;
}

.drawer-footer {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 247, 242, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.drawer-tagline {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.98rem;
  color: rgba(255, 247, 242, 0.8);
  line-height: 1.4;
}

.drawer-privacy-link {
  font-family: var(--font-jost);
  font-size: 0.85rem;
  color: rgba(255, 247, 242, 0.7);
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.drawer-privacy-link:hover {
  color: #FFFFFF;
}
`;

// Part 4: Saved Items, Cart Modal, QuickView, Floating WA (from savedIdx up to footerIdx)
const middlePart = originalBase.substring(savedIdx, footerIdx);

// Part 5: Restored Footer (Section 10)
const footerBlock = `
/* Page offset for non-home pages so content starts flush under 115px header */
body:not([data-page="home"]) #main {
  padding-top: var(--nav-h, 115px);
}

/* ==========================================================================
   /* ===== FOOTER ===== */
   Full-bleed deep burgundy gradient, top band, 5 columns grid, watermark, bottom bar
   ========================================================================== */
.site-footer {
  background: linear-gradient(180deg, #5E2A31 0%, #4A2328 100%);
  border-top: 1px solid rgba(215, 167, 177, 0.5);
  color: #FFF7F2;
  padding-top: 0;
  position: relative;
  overflow: hidden;
  font-family: var(--font-serif);
}

.footer-top-band {
  border-bottom: 1px solid rgba(255, 247, 242, 0.15);
  padding: 48px 0;
}

.footer-top-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.footer-top-text {
  display: flex;
  flex-direction: column;
}

.footer-top-heading {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 600;
  font-size: clamp(2rem, 3.4vw, 3.2rem);
  color: #FFF7F2;
  margin: 0 0 6px 0;
  line-height: 1.15;
}

.footer-top-subtext {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: rgba(255, 247, 242, 0.85);
  margin: 0;
}

.footer-top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.footer-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF7F2;
  color: #5A1623;
  min-height: 48px;
  padding: 0 28px;
  border-radius: 10px;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.05rem;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  text-decoration: none;
}

.footer-cta-btn:hover {
  background-color: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.footer-wa-outline-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid rgba(255, 247, 242, 0.45);
  color: #FFF7F2;
  min-height: 48px;
  padding: 0 24px;
  border-radius: 10px;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.05rem;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.footer-wa-outline-btn:hover {
  background-color: rgba(255, 247, 242, 0.15);
  border-color: #FFFFFF;
  color: #FFFFFF;
}

.footer-main-container {
  padding-top: 64px;
  padding-bottom: 56px;
  position: relative;
  z-index: 1;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1.6fr 1fr 1fr 1.4fr;
  gap: 40px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-col--brand {
  gap: 14px;
}

.footer-col--cats {
  gap: 14px;
}

.footer-col--contact {
  gap: 14px;
}

.footer-col-heading {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.3rem;
  color: #FFF7F2;
  margin-bottom: 14px;
  position: relative;
  width: fit-content;
}

.footer-col-heading::after {
  content: "";
  display: block;
  width: 28px;
  height: 1px;
  background-color: #D7A7B1;
  margin-top: 6px;
}

.footer-link-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 1.1rem;
  color: rgba(255, 247, 242, 0.8);
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  transition: color var(--transition-fast);
  text-decoration: none;
}

.footer-link:hover {
  color: #FFFFFF;
  text-decoration: underline;
}

/* Col 1: Brand */
.footer-brand-title {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 32px;
  letter-spacing: 0.28em;
  line-height: 1;
  margin-right: -0.28em;
  color: #FFF7F2;
}

.footer-brand-sub {
  font-family: var(--font-jost);
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 0.3em;
  opacity: 0.8;
  margin-top: 4px;
}

.footer-brand-tagline {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  color: rgba(255, 247, 242, 0.85);
  max-width: 28ch;
  line-height: 1.4;
  margin-top: 6px;
}

.footer-social-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

.footer-social-circle {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 247, 242, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--footer-text);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
  text-decoration: none;
}

.footer-social-circle:hover {
  background-color: rgba(255, 247, 242, 0.15);
  border-color: #FFFFFF;
}

/* Col 2: Categories Subgrid */
.footer-cats-all {
  margin-bottom: 6px;
}

.footer-cats-subgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.footer-cats-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Col 5: Get in touch */
.footer-wa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #FFF7F2;
  color: #722F37;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 8px;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.05rem;
  transition: background-color var(--transition-fast);
  width: fit-content;
  text-decoration: none;
}

.footer-wa-btn:hover {
  background-color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.footer-contact-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.footer-contact-link,
.footer-delivering-line {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 247, 242, 0.85);
  font-size: 1.05rem;
  text-decoration: none;
}

.footer-contact-link:hover {
  color: #FFFFFF;
  text-decoration: underline;
}

.footer-delivery-note {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: rgba(255, 247, 242, 0.7);
  line-height: 1.4;
  margin-top: 6px;
}

/* Faint Giant Watermark */
.footer-watermark {
  position: absolute;
  left: 50%;
  bottom: 45px;
  transform: translateX(-50%);
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(8rem, 17vw, 18rem);
  letter-spacing: 0.25em;
  color: rgba(255, 247, 242, 0.04);
  line-height: 0.8;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

/* Bottom Bar */
.footer-bottom-bar {
  border-top: 1px solid rgba(255, 247, 242, 0.15);
  padding: 24px 0;
  position: relative;
  z-index: 1;
}

.footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-bottom-copy {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: rgba(255, 247, 242, 0.75);
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer-bottom-link {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: rgba(255, 247, 242, 0.75);
  transition: color var(--transition-fast);
  text-decoration: none;
}

.footer-back-to-top {
  cursor: pointer;
}

.footer-bottom-link:hover {
  color: #FFFFFF;
  text-decoration: underline;
}
`;

// Part 6: Product Cards & Toast (restored base slider card + scoped catalogue card + toast)
const cardsBlock = `
/* --------------------------------------------------------------------------
   11. Product Card & Badge Pill (Base: Bestseller Slider Card)
   -------------------------------------------------------------------------- */
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #FFFBF8;
  border: 1px solid rgba(114, 47, 55, 0.08);
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(114, 47, 55, 0.08);
  overflow: hidden;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(114, 47, 55, 0.12);
}

.product-card__img-box {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8D5DC;
}

.product-card__img-box--tone-1 {
  background: linear-gradient(135deg, #FBECEE 0%, #F5D3D9 100%);
}
.product-card__img-box--tone-2 {
  background: linear-gradient(135deg, #F9E4E8 0%, #EFC5CC 100%);
}
.product-card__img-box--tone-3 {
  background: linear-gradient(135deg, #F5DDE2 0%, #EAB8C1 100%);
}
.product-card__img-box--tone-4 {
  background: linear-gradient(135deg, #F7E8EB 0%, #F1CFD6 100%);
}

.product-card__watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF7F2;
  opacity: 0.45;
  pointer-events: none;
  z-index: 1;
}

.product-card__img-box img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  transition: transform var(--transition-smooth);
}

.product-card:hover .product-card__img-box img {
  transform: scale(1.04);
}

.product-badge-pill {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  background-color: #F2C4CE;
  color: #5A1623;
  font-family: var(--font-jost);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.product-card__body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-card__name {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 20px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card__open {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #5A1623;
  cursor: pointer;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-fast);
}

.product-card__open:hover {
  color: #722F37;
}

.product-card__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.product-card__price {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 18px;
  color: #572E2E;
  font-variant-numeric: lining-nums proportional-nums;
}

.wish {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6A1F2C;
  transition: transform var(--transition-fast), color var(--transition-fast);
  margin-right: -8px;
}

.wish:hover {
  transform: scale(1.15);
  color: #5A1623;
}

/* Scoped Catalogue Product Card */
.product-card--catalogue {
  background-color: #FAF0E9;
  border: 1px solid rgba(114, 47, 55, 0.08);
  box-shadow: none;
}

.product-card--catalogue .product-card__img-box {
  aspect-ratio: 1;
}

.product-card--catalogue .wish--catalogue {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  background-color: rgba(255, 247, 242, 0.9);
  box-shadow: 0 2px 8px rgba(87, 46, 46, 0.12);
  margin-right: 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background-color: #5A1623;
  color: var(--icon-cream);
  padding: 12px 24px;
  border-radius: 8px;
  font-family: var(--font-serif);
  font-size: 1.05rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 3000;
  opacity: 0;
  pointer-events: none;
  transition: transform 300ms ease, opacity 300ms ease;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
`;

const cleanBaseCss = part1 + headerBlock + drawerBlock + middlePart + footerBlock + cardsBlock;

fs.writeFileSync('c:\\Users\\Aariy\\Palora\\css\\base.css', cleanBaseCss, 'utf8');
console.log('Clean base.css generated! Total lines:', cleanBaseCss.split('\n').length);
