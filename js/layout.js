/**
 * Palora Centralized Layout Generator
 * Generates and updates Header, Hamburger Drawer, Footer, and Floating WhatsApp button.
 */

(function () {
  function renderHeaderContent(headerEl) {
    if (!headerEl) return;
    headerEl.className = "site-header";
    headerEl.innerHTML = `
      <div class="container header-inner">
        <!-- Navigation Links (Left) -->
        <nav class="nav-menu" id="navMenu" aria-label="Main Navigation">
          <ul class="nav-list">
            <li><a href="index.html" class="nav-link">HOME</a></li>
            <li><a href="catalogue.html" class="nav-link">COLLECTIONS</a></li>
            <li><a href="story.html" class="nav-link">OUR STORY</a></li>
          </ul>
        </nav>

        <!-- Center Wordmark -->
        <a href="index.html" class="site-wordmark" aria-label="Palora Home">
          <span class="wordmark-title">PALORA</span>
          <span class="wordmark-tagline">HANDMADE GIFTS</span>
        </a>

        <!-- Header Action Controls (Right) -->
        <div class="header-actions">
          <!-- Saved items Button -->
          <button type="button" class="icon-btn saved-btn" id="savedBtn" aria-label="Saved items">
            ${icon("heart", { size: 24, strokeWidth: 1.5 })}
            <span class="saved-badge" id="savedBadge" style="display:none">0</span>
          </button>

          <!-- Cart Trigger Button -->
          <button type="button" class="icon-btn cart-btn" id="cartBtn" aria-label="Open cart">
            ${icon("bag", { size: 24, strokeWidth: 1.5 })}
            <span class="cart-badge" id="cartBadge" style="display:none"></span>
          </button>

          <!-- Hamburger Toggle Button (48px circle, 2 lines) -->
          <button type="button" class="mobile-toggle-btn hamburger-btn" id="mobileToggleBtn" aria-label="Toggle navigation menu"
            aria-expanded="false" aria-controls="mobileDrawer">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    `;
  }

  function ensureDrawer() {
    let overlay = document.getElementById("mobileDrawerOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mobile-drawer-overlay";
      overlay.id = "mobileDrawerOverlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.setAttribute("hidden", "");
      overlay.setAttribute("inert", "");
      document.body.appendChild(overlay);
    }

    let drawer = document.getElementById("mobileDrawer");
    if (!drawer) {
      drawer = document.createElement("aside");
      drawer.className = "mobile-drawer";
      drawer.id = "mobileDrawer";
      drawer.setAttribute("aria-label", "Navigation Drawer");
      drawer.setAttribute("aria-hidden", "true");
      drawer.setAttribute("hidden", "");
      drawer.setAttribute("inert", "");
      document.body.appendChild(drawer);
    }

    const waBtnHtml = hasWhatsApp()
      ? `<a href="${waLink("Hi Palora! I'd like to discuss a custom gift.")}" target="_blank" rel="noopener noreferrer" class="drawer-wa-btn">
          ${icon("whatsapp", { size: 20 })}
          <span>Order on WhatsApp</span>
        </a>`
      : "";

    drawer.innerHTML = `
      <div class="drawer-header-row">
        <div class="drawer-wordmark">
          <span class="drawer-wordmark-title">PALORA</span>
          <span class="drawer-wordmark-tagline">HANDMADE GIFTS</span>
        </div>
        <button type="button" class="drawer-close-btn" id="closeDrawerBtn" aria-label="Close menu">
          ${icon("close", { size: 24, strokeWidth: 1.5 })}
        </button>
      </div>

      <div class="drawer-scroll-content">
        <!-- Group MENU -->
        <div class="drawer-group drawer-group--menu">
          <span class="drawer-group-label">MENU</span>
          <div class="drawer-menu-list">
            <a href="index.html" class="drawer-menu-row" data-drawer-link="home">
              <span class="drawer-menu-idx">01</span>
              <span class="drawer-menu-label">Home</span>
              ${icon("arrow-right", { size: 20, className: "drawer-menu-arrow" })}
            </a>
            <a href="catalogue.html" class="drawer-menu-row" data-drawer-link="catalogue">
              <span class="drawer-menu-idx">02</span>
              <span class="drawer-menu-label">Collections</span>
              ${icon("arrow-right", { size: 20, className: "drawer-menu-arrow" })}
            </a>
            <a href="story.html" class="drawer-menu-row" data-drawer-link="story">
              <span class="drawer-menu-idx">03</span>
              <span class="drawer-menu-label">Our Story</span>
              ${icon("arrow-right", { size: 20, className: "drawer-menu-arrow" })}
            </a>
            <a href="index.html#bestsellers" class="drawer-menu-row" data-drawer-link="bestsellers">
              <span class="drawer-menu-idx">04</span>
              <span class="drawer-menu-label">Bestsellers</span>
              ${icon("arrow-right", { size: 20, className: "drawer-menu-arrow" })}
            </a>
          </div>
        </div>

        <!-- Group HELP -->
        <div class="drawer-group drawer-group--help">
          <span class="drawer-group-label">HELP</span>
          <ul class="drawer-help-list">
            <li><a href="help.html#how-to-order" class="drawer-help-link">How ordering works</a></li>
            <li><a href="help.html#shipping" class="drawer-help-link">Shipping & delivery</a></li>
            <li><a href="help.html#returns" class="drawer-help-link">Returns & personalized orders</a></li>
            <li><a href="help.html#faqs" class="drawer-help-link">FAQs</a></li>
            <li><a href="help.html#contact" class="drawer-help-link">Contact</a></li>
          </ul>
        </div>

        <!-- Group CONNECT -->
        <div class="drawer-group drawer-group--connect">
          <span class="drawer-group-label">CONNECT</span>
          ${waBtnHtml}
          <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="drawer-ig-row">
            ${icon("instagram", { size: 20 })}
            <span>@${INSTAGRAM_HANDLE}</span>
          </a>
        </div>
      </div>

      <div class="drawer-footer">
        <p class="drawer-tagline">Thoughtful, personalized handmade gifts turning simple moments into lasting memories.</p>
        <a href="privacy.html" class="drawer-privacy-link">Privacy Policy</a>
      </div>
    `;
  }

  function renderFooterContent(footerEl) {
    if (!footerEl) return;
    footerEl.className = "site-footer";

    // Build category columns: 11 categories in 2 sub-columns
    const half = Math.ceil(CATEGORIES.length / 2);
    const col1 = CATEGORIES.slice(0, half);
    const col2 = CATEGORIES.slice(half);

    const catCol1Html = col1
      .map(
        (c) =>
          `<li><a href="catalogue.html?category=${encodeURIComponent(c.slug)}" class="footer-link">${c.label}</a></li>`
      )
      .join("");
    const catCol2Html = col2
      .map(
        (c) =>
          `<li><a href="catalogue.html?category=${encodeURIComponent(c.slug)}" class="footer-link">${c.label}</a></li>`
      )
      .join("");

    const footerWaCircle = hasWhatsApp()
      ? `<a href="${waLink("Hi Palora! I'd like to inquire about your gifts.")}" target="_blank" rel="noopener noreferrer" class="footer-social-circle" aria-label="WhatsApp">
          ${icon("whatsapp", { size: 20 })}
        </a>`
      : "";

    const footerWaBtn = hasWhatsApp()
      ? `<a href="${waLink("Hi Palora! I'd like to order a handmade gift.")}" target="_blank" rel="noopener noreferrer" class="footer-wa-btn">
          ${icon("whatsapp", { size: 18 })}
          <span>Order on WhatsApp</span>
        </a>`
      : "";

    const footerTopWaBtn = hasWhatsApp()
      ? `<a href="${waLink("Hi Palora! I'd like to chat.")}" target="_blank" rel="noopener noreferrer" class="footer-wa-outline-btn">
          ${icon("whatsapp", { size: 18 })}
          <span>Chat on WhatsApp</span>
        </a>`
      : "";

    const emailRow = EMAIL
      ? `<a href="mailto:${EMAIL}" class="footer-contact-link">
          ${icon("mail", { size: 18 })}
          <span>${EMAIL}</span>
        </a>`
      : "";

    footerEl.innerHTML = `
      <!-- Top Band Inside Footer -->
      <div class="footer-top-band">
        <div class="container footer-top-inner">
          <div class="footer-top-text">
            <h2 class="footer-top-heading">Make every moment special.</h2>
            <p class="footer-top-subtext">Browse our handmade gifts and make them yours.</p>
          </div>
          <div class="footer-top-actions">
            <a href="catalogue.html" class="footer-cta-btn">Explore Collections</a>
            ${footerTopWaBtn}
          </div>
        </div>
      </div>

      <!-- 5 Columns Grid -->
      <div class="container footer-main-container">
        <div class="footer-grid">
          <!-- Column 1: Brand -->
          <div class="footer-col footer-col--brand">
            <div class="footer-brand-title">PALORA</div>
            <div class="footer-brand-sub">HANDMADE GIFTS</div>
            <p class="footer-brand-tagline">
              Thoughtful, personalized handmade gifts turning simple moments into lasting memories.
            </p>
            <div class="footer-social-row">
              <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Instagram">
                ${icon("instagram", { size: 22 })}
              </a>
              <a href="${waLink("Hi Palora! I'd like to inquire about your gifts.") || "https://wa.me/"}" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="WhatsApp">
                ${icon("whatsapp", { size: 22 })}
              </a>
            </div>
          </div>

          <!-- Column 2: Shop by category -->
          <div class="footer-col footer-col--cats">
            <h3 class="footer-col-heading">Shop by category</h3>
            <ul class="footer-cats-all">
              <li><a href="catalogue.html" class="footer-link">All products</a></li>
            </ul>
            <div class="footer-cats-subgrid">
              <ul class="footer-cats-col">${catCol1Html}</ul>
              <ul class="footer-cats-col">${catCol2Html}</ul>
            </div>
          </div>

          <!-- Column 3: Help -->
          <div class="footer-col">
            <h3 class="footer-col-heading">Help</h3>
            <ul class="footer-link-list">
              <li><a href="help.html#how-to-order" class="footer-link">How ordering works</a></li>
              <li><a href="help.html#shipping" class="footer-link">Shipping & delivery</a></li>
              <li><a href="help.html#returns" class="footer-link">Returns & personalized orders</a></li>
              <li><a href="help.html#faqs" class="footer-link">FAQs</a></li>
              <li><a href="help.html#contact" class="footer-link">Contact</a></li>
            </ul>
          </div>

          <!-- Column 4: Company -->
          <div class="footer-col">
            <h3 class="footer-col-heading">Company</h3>
            <ul class="footer-link-list">
              <li><a href="story.html" class="footer-link">Our Story</a></li>
              <li><a href="index.html#bestsellers" class="footer-link">Bestsellers</a></li>
              <li><a href="privacy.html" class="footer-link">Privacy Policy</a></li>
            </ul>
          </div>

          <!-- Column 5: Get in touch -->
          <div class="footer-col footer-col--contact">
            <h3 class="footer-col-heading">Get in touch</h3>
            ${footerWaBtn}
            <div class="footer-contact-items">
              <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="footer-contact-link">
                ${icon("instagram", { size: 18 })}
                <span>@${INSTAGRAM_HANDLE}</span>
              </a>
              ${emailRow}
              <div class="footer-delivering-line">
                ${icon("truck", { size: 18 })}
                <span>Delivering across India</span>
              </div>
            </div>
            <p class="footer-delivery-note">
              Every piece is made to order. Delivery timing is confirmed on WhatsApp when you place your order.
            </p>
          </div>
        </div>
      </div>

      <!-- Faint Giant Watermark -->
      <div class="footer-watermark" aria-hidden="true">PALORA</div>

      <!-- Bottom Bar -->
      <div class="footer-bottom-bar">
        <div class="container footer-bottom-inner">
          <div class="footer-bottom-copy">
            &copy; ${new Date().getFullYear()} Palora. All rights reserved.
          </div>
          <div class="footer-bottom-links">
            <a href="privacy.html" class="footer-bottom-link">Privacy Policy</a>
            <a href="#site-header" class="footer-bottom-link footer-back-to-top" id="backToTopBtn">Back to top &uarr;</a>
          </div>
        </div>
      </div>
    `;

    const backToTop = footerEl.querySelector("#backToTopBtn");
    if (backToTop) {
      backToTop.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function ensureFloatingWhatsApp() {
    if (!hasWhatsApp()) {
      const existing = document.getElementById("floatingWaBtn");
      if (existing) existing.remove();
      return;
    }

    let btn = document.getElementById("floatingWaBtn");
    if (!btn) {
      btn = document.createElement("a");
      btn.id = "floatingWaBtn";
      btn.className = "floating-wa-btn";
      btn.href = waLink("Hi Palora! I'd like to know more about your gifts.");
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.setAttribute("aria-label", "Order on WhatsApp");
      btn.innerHTML = `
        <span class="floating-wa-tooltip" aria-hidden="true">Chat with us</span>
        ${icon("whatsapp", { size: 28, strokeWidth: 1.5 })}
      `;
      document.body.appendChild(btn);
    }
  }

  function initLayout() {
    const header = document.getElementById("site-header") || document.getElementById("header");
    if (header) {
      renderHeaderContent(header);
    }

    ensureDrawer();

    const footer = document.getElementById("site-footer") || document.getElementById("footer");
    if (footer) {
      renderFooterContent(footer);
    }

    ensureFloatingWhatsApp();
  }

  // Run as early as possible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLayout);
  } else {
    initLayout();
  }

  window.PaloraLayout = {
    init: initLayout,
    refreshFloatingWA: ensureFloatingWhatsApp
  };
})();
