const fs = require('fs');

// 1. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// (a) Restore hero eyebrow
indexHtml = indexHtml.replace(
  /<span class="hero__eyebrow">HANDMADE WITH LOVE<\/span>/g,
  '<span class="hero__eyebrow">THOUGHTFUL GIFTS FOR EVERY OCCASION</span>'
);

// (b) Add hidden and inert to drawer and overlay
indexHtml = indexHtml.replace(
  '<div class="mobile-drawer-overlay" id="mobileDrawerOverlay" aria-hidden="true"></div>',
  '<div class="mobile-drawer-overlay" id="mobileDrawerOverlay" aria-hidden="true" hidden inert></div>'
);
indexHtml = indexHtml.replace(
  '<aside class="mobile-drawer" id="mobileDrawer" aria-label="Navigation Drawer" aria-hidden="true">',
  '<aside class="mobile-drawer" id="mobileDrawer" aria-label="Navigation Drawer" aria-hidden="true" hidden inert>'
);

// (c) Restore trust strip item 2 to Secure Checkout
const oldTrust2Regex = /<li>\s*<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"[\s\S]*?<span>Order on WhatsApp<\/span>\s*<\/li>/;
const newTrust2 = `<li>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Secure Checkout</span>
          </li>`;
if (indexHtml.match(oldTrust2Regex)) {
  indexHtml = indexHtml.replace(oldTrust2Regex, newTrust2);
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html updated.');

// 2. Update catalogue.html cartModal & cartOverlay hidden inert
let catHtml = fs.readFileSync('catalogue.html', 'utf8');
catHtml = catHtml.replace(
  '<div class="cart-overlay" id="cartOverlay"></div>',
  '<div class="cart-overlay" id="cartOverlay" aria-hidden="true" hidden inert></div>'
);
catHtml = catHtml.replace(
  '<aside class="cart-modal" id="cartModal"',
  '<aside class="cart-modal" id="cartModal" aria-hidden="true" hidden inert'
);
fs.writeFileSync('catalogue.html', catHtml, 'utf8');
console.log('catalogue.html updated.');

// 3. Update js/layout.js
let layoutJs = fs.readFileSync('js/layout.js', 'utf8');
layoutJs = layoutJs.replace(
  'overlay.setAttribute("aria-hidden", "true");\n      document.body.appendChild(overlay);',
  'overlay.setAttribute("aria-hidden", "true");\n      overlay.setAttribute("hidden", "");\n      overlay.setAttribute("inert", "");\n      document.body.appendChild(overlay);'
);
layoutJs = layoutJs.replace(
  'drawer.setAttribute("aria-hidden", "true");\n      document.body.appendChild(drawer);',
  'drawer.setAttribute("aria-hidden", "true");\n      drawer.setAttribute("hidden", "");\n      drawer.setAttribute("inert", "");\n      document.body.appendChild(drawer);'
);
fs.writeFileSync('js/layout.js', layoutJs, 'utf8');
console.log('layout.js updated.');

// 4. Update js/nav.js
let navJs = fs.readFileSync('js/nav.js', 'utf8');
// In openDrawer: remove hidden and inert, reflow
const oldOpenCode = `    function openDrawer() {
      drawer.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");`;

const newOpenCode = `    function openDrawer() {
      if (overlay) {
        overlay.removeAttribute("hidden");
        overlay.removeAttribute("inert");
      }
      drawer.removeAttribute("hidden");
      drawer.removeAttribute("inert");
      void drawer.offsetHeight; // force reflow for smooth transition

      drawer.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");`;

navJs = navJs.replace(oldOpenCode, newOpenCode);

// In closeDrawer: wait for transition then set hidden and inert
const oldCloseCode = `    function closeDrawer() {
      drawer.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.remove("is-open");
        toggleBtn.focus();
      }
      document.body.classList.remove("drawer-open");`;

const newCloseCode = `    function closeDrawer() {
      drawer.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.remove("is-open");
        toggleBtn.focus();
      }
      document.body.classList.remove("drawer-open");

      var onTransitionEnd = function (e) {
        if (e && e.target !== drawer) return;
        drawer.removeEventListener("transitionend", onTransitionEnd);
        if (!drawer.classList.contains("is-open")) {
          drawer.setAttribute("hidden", "");
          drawer.setAttribute("inert", "");
          if (overlay) {
            overlay.setAttribute("hidden", "");
            overlay.setAttribute("inert", "");
          }
        }
      };
      drawer.addEventListener("transitionend", onTransitionEnd);
      setTimeout(onTransitionEnd, 460);`;

navJs = navJs.replace(oldCloseCode, newCloseCode);
fs.writeFileSync('js/nav.js', navJs, 'utf8');
console.log('nav.js updated.');

// 5. Update js/cart.js
let cartJs = fs.readFileSync('js/cart.js', 'utf8');
cartJs = cartJs.replace(
  `function openCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
  if (overlay) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }`,
  `function openCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (overlay) {
    overlay.removeAttribute("hidden");
    overlay.removeAttribute("inert");
  }
  if (modal) {
    modal.removeAttribute("hidden");
    modal.removeAttribute("inert");
    void modal.offsetHeight;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
  if (overlay) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }`
);

cartJs = cartJs.replace(
  `function closeCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
  if (overlay) {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }
  document.body.style.overflow = "";`,
  `function closeCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
  if (overlay) {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }
  const onEnd = function () {
    if (modal && !modal.classList.contains("open")) {
      modal.setAttribute("hidden", "");
      modal.setAttribute("inert", "");
    }
    if (overlay && !overlay.classList.contains("open")) {
      overlay.setAttribute("hidden", "");
      overlay.setAttribute("inert", "");
    }
  };
  if (modal) {
    modal.addEventListener("transitionend", onEnd, { once: true });
    setTimeout(onEnd, 400);
  }
  document.body.style.overflow = "";`
);
fs.writeFileSync('js/cart.js', cartJs, 'utf8');
console.log('cart.js updated.');

// 6. Update js/saved.js
let savedJs = fs.readFileSync('js/saved.js', 'utf8');
savedJs = savedJs.replace(
  'overlay.setAttribute("aria-hidden", "true");',
  'overlay.setAttribute("aria-hidden", "true");\n    overlay.setAttribute("hidden", "");\n    overlay.setAttribute("inert", "");'
);
savedJs = savedJs.replace(
  'panel.setAttribute("aria-hidden", "true");',
  'panel.setAttribute("aria-hidden", "true");\n    panel.setAttribute("hidden", "");\n    panel.setAttribute("inert", "");'
);
savedJs = savedJs.replace(
  `    if (panel) {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
    }
    if (overlay) {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    }`,
  `    if (overlay) {
      overlay.removeAttribute("hidden");
      overlay.removeAttribute("inert");
    }
    if (panel) {
      panel.removeAttribute("hidden");
      panel.removeAttribute("inert");
      void panel.offsetHeight;
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
    }
    if (overlay) {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    }`
);
savedJs = savedJs.replace(
  `    if (panel) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }

    document.body.style.overflow = "";`,
  `    if (panel) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }
    const onEnd = function () {
      if (panel && !panel.classList.contains("open")) {
        panel.setAttribute("hidden", "");
        panel.setAttribute("inert", "");
      }
      if (overlay && !overlay.classList.contains("open")) {
        overlay.setAttribute("hidden", "");
        overlay.setAttribute("inert", "");
      }
    };
    if (panel) {
      panel.addEventListener("transitionend", onEnd, { once: true });
      setTimeout(onEnd, 400);
    }

    document.body.style.overflow = "";`
);
fs.writeFileSync('js/saved.js', savedJs, 'utf8');
console.log('saved.js updated.');
