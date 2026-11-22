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
          <!-- Search Trigger Button -->
          <button type="button" class="icon-btn search-btn" id="searchBtn" aria-label="Search products">
            ${icon("search", { size: 21, strokeWidth: 1.5 })}
          </button>

          <!-- Wishlist / Saved items Button -->
          <button type="button" class="icon-btn saved-btn" id="savedBtn" aria-label="Wishlist items">
            ${icon("heart", { size: 21, strokeWidth: 1.5 })}
            <span class="saved-badge" id="savedBadge" style="display:none">0</span>
          </button>

          <!-- Shopping Cart Trigger Button -->
          <button type="button" class="icon-btn cart-btn" id="cartBtn" aria-label="Open cart">
            ${icon("bag", { size: 23, strokeWidth: 1.5 })}
            <span class="cart-badge" id="cartBadge" style="display:none">0</span>
          </button>

          <!-- Hamburger Toggle Button (Two-line icon) -->
          <button type="button" class="mobile-toggle-btn hamburger-btn" id="mobileToggleBtn" aria-label="Toggle navigation menu"
            aria-expanded="false" aria-controls="menu-drawer">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    `;
  }

  function ensureDrawer() {
    let overlay = document.getElementById("menu-backdrop") || document.getElementById("mobileDrawerOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "menu-backdrop mobile-drawer-overlay";
      overlay.id = "menu-backdrop";
      overlay.setAttribute("aria-hidden", "true");
      overlay.setAttribute("hidden", "");
      overlay.setAttribute("inert", "");
      document.body.appendChild(overlay);
    } else {
      overlay.className = "menu-backdrop mobile-drawer-overlay";
      overlay.id = "menu-backdrop";
    }

    let drawer = document.getElementById("menu-drawer") || document.getElementById("mobileDrawer");
    if (!drawer) {
      drawer = document.createElement("aside");
      drawer.className = "menu-drawer mobile-drawer";
      drawer.id = "menu-drawer";
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
      drawer.setAttribute("aria-label", "Menu");
      drawer.setAttribute("aria-hidden", "true");
      drawer.setAttribute("hidden", "");
      drawer.setAttribute("inert", "");
      document.body.appendChild(drawer);
    } else {
      drawer.className = "menu-drawer mobile-drawer";
      drawer.id = "menu-drawer";
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
      drawer.setAttribute("aria-label", "Menu");
    }

    const waRowHtml = (typeof hasWhatsApp === "function" && hasWhatsApp())
      ? `<a class="md-row" href="${waLink("Hi Palora! I'd like to discuss a custom gift.")}" target="_blank" rel="noopener">
          ${icon("whatsapp", { size: 32, strokeWidth: 1.5 })}
          <span>Order on WhatsApp</span>
        </a>`
      : "";

    drawer.innerHTML = `
      <svg class="md-gift" viewBox="0 0 120 120" fill="none" stroke="#FFE3E7" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="48" width="92" height="18" rx="3"/><path d="M20 66v38a4 4 0 0 0 4 4h72a4 4 0 0 0 4-4V66"/><path d="M54 48v60M66 48v60"/><path d="M60 48C46 48 28 44 28 32 28 22 40 20 47 26 54 36 60 48 60 48zm0 0c14 0 32-4 32-16 0-10-12-12-19-6-7 10-13 22-13 22z"/></svg>
      <div class="md-head">
        <div class="md-wm">Palora</div>
        <div class="md-tag">Handmade Gifts</div>
        <button class="md-close" id="closeDrawerBtn" aria-label="Close menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <nav class="md-nav" aria-label="Menu">
        <div class="md-label">Menu</div>
        <div class="md-menu">
          <a href="index.html" data-drawer-link="home"><span class="n">01</span>Home</a>
          <a href="catalogue.html" data-drawer-link="catalogue"><span class="n">02</span>Collections</a>
          <a href="story.html" data-drawer-link="story"><span class="n">03</span>Our Story</a>
          <a href="index.html#bestsellers" data-drawer-link="bestsellers"><span class="n">04</span>Bestsellers</a>
        </div>
        <hr>
        <div class="md-label md-label--help">Help</div>
        <div class="md-help">
          <a href="help.html#how-to-order">How ordering works</a>
          <a href="help.html#shipping">Shipping & delivery</a>
          <a href="help.html#returns">Returns & personalized orders</a>
        </div>
        <hr class="md-gap">
        <div class="md-help">
          <a href="help.html#faqs">FAQs</a>
          <a href="help.html#contact">Contact</a>
        </div>
        <div class="md-label md-label--connect">Connect</div>
        ${waRowHtml}
        <a class="md-row" href="${INSTAGRAM_URL}" target="_blank" rel="noopener">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
          <span>@${INSTAGRAM_HANDLE}</span>
        </a>
      </nav>
      <div class="md-foot">
        <hr>
        <a href="privacy.html">Privacy Policy</a>
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

  function ensureSearchDialog() {
    if (document.getElementById("searchDialog")) return;

    const dialog = document.createElement("dialog");
    dialog.className = "search-dialog";
    dialog.id = "searchDialog";
    dialog.setAttribute("aria-label", "Search Products");
    dialog.innerHTML = `
      <div class="search-dialog__inner">
        <div class="search-dialog__header">
          <div class="search-input-wrap">
            <svg class="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" class="search-input" id="siteSearchInput" placeholder="Search handmade gifts, bouquets, coasters, frames..." autocomplete="off">
            <button type="button" class="search-clear-btn" id="searchClearBtn" aria-label="Clear search" style="display:none">&times;</button>
          </div>
          <button type="button" class="search-close-btn" id="searchCloseBtn" aria-label="Close search" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="search-results" id="searchResults">
          <div class="search-note">
            <svg class="search-note-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Type product name, category, or occasion to search</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    const input = dialog.querySelector("#siteSearchInput");
    const resultsContainer = dialog.querySelector("#searchResults");
    const clearBtn = dialog.querySelector("#searchClearBtn");
    const closeBtn = dialog.querySelector("#searchCloseBtn");

    function renderSearchResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        if (clearBtn) clearBtn.style.display = "none";
        resultsContainer.innerHTML = `
          <div class="search-note">
            <svg class="search-note-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Type product name, category, or occasion to search</span>
          </div>
        `;
        return;
      }
      if (clearBtn) clearBtn.style.display = "block";

      const all = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
      const matches = all.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<div class="search-no-results">No gifts found for "${query}". Try searching for bouquets, resin, or coasters.</div>`;
        return;
      }

      resultsContainer.innerHTML = `
        <div class="search-results-grid">
          ${matches.slice(0, 8).map(p => {
            const formattedPrice = typeof formatINR === "function" ? formatINR(p.price) : `₹${p.price}`;
            return `
              <div class="search-result-item" data-product-id="${p.id}" role="button" tabindex="0">
                <img src="${p.image}" alt="${p.name}" class="search-result-thumb" onerror="this.style.display='none'">
                <div class="search-result-info">
                  <h4 class="search-result-title">${p.name}</h4>
                  <span class="search-result-price">${formattedPrice}</span>
                </div>
                ${p.badge ? `<span class="product-badge-pill search-result-badge">${p.badge}</span>` : ""}
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    if (input) {
      input.addEventListener("input", () => renderSearchResults(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const q = input.value.trim();
          if (q) {
            window.location.href = `catalogue.html?search=${encodeURIComponent(q)}`;
          }
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (input) {
          input.value = "";
          input.focus();
          renderSearchResults("");
        }
      });
    }

    function closeSearch() {
      if (dialog && dialog.open) {
        dialog.close();
        document.body.style.overflow = "";
      }
    }

    if (closeBtn) closeBtn.addEventListener("click", closeSearch);

    dialog.addEventListener("click", (e) => {
      const inner = dialog.querySelector(".search-dialog__inner");
      if (inner && !inner.contains(e.target)) {
        closeSearch();
      }
    });

    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeSearch();
    });

    resultsContainer.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result-item");
      if (item) {
        const pid = item.getAttribute("data-product-id");
        const all = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
        const prod = all.find(p => p.id === pid);
        if (prod) {
          closeSearch();
          if (typeof openQuickViewModal === "function") {
            openQuickViewModal(prod, item);
          }
        }
      }
    });
  }

  function initLayout() {
    const header = document.getElementById("site-header") || document.getElementById("header");
    if (header) {
      renderHeaderContent(header);
    }

    ensureDrawer();
    ensureSearchDialog();

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
