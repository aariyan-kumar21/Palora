/**
 * Palora Product UI Module
 * Shared product-card rendering, quick-view dialog, wishlist, and add-to-cart logic.
 * Used by both index.html (Bestsellers slider) and catalogue.html (Collections catalogue).
 */

// -----------------------------------------------------------------------------
// 1. Storage & Formatting Utilities
// -----------------------------------------------------------------------------
const WISHLIST_STORAGE_KEY = "palora_wishlist";
const inrFormatter = new Intl.NumberFormat("en-IN");

function formatINR(amount) {
  return "₹" + inrFormatter.format(amount);
}

function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Could not save wishlist to localStorage:", err);
  }
}

function isProductWishlisted(productId) {
  const list = getWishlist();
  return list.includes(productId);
}

function updateWishlistButtonUI(btn, isWishlisted, productId) {
  const product = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).find(p => p.id === productId);
  const name = product ? product.name : "product";
  btn.setAttribute("aria-pressed", isWishlisted ? "true" : "false");
  btn.setAttribute("aria-label", isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`);
  const svg = btn.querySelector(".wish-heart-svg");
  if (svg) {
    svg.setAttribute("fill", isWishlisted ? "#722F37" : "none");
    svg.setAttribute("stroke", isWishlisted ? "#722F37" : "#6A1F2C");
  }
}

function toggleProductWishlist(productId, btn) {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  let isNowWishlisted = false;
  if (idx > -1) {
    list.splice(idx, 1);
    isNowWishlisted = false;
  } else {
    list.push(productId);
    isNowWishlisted = true;
  }
  saveWishlist(list);
  updateWishlistButtonUI(btn, isNowWishlisted, productId);

  // Sync any other matching wishlist button on the current page
  document.querySelectorAll(`.wish[data-product-id="${productId}"]`).forEach(otherBtn => {
    if (otherBtn !== btn) {
      updateWishlistButtonUI(otherBtn, isNowWishlisted, productId);
    }
  });

  // Optional toast notification
  if (typeof showToast === "function") {
    const product = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).find(p => p.id === productId);
    const title = product ? product.name : "Item";
    showToast(isNowWishlisted ? `Added "${title}" to your wishlist ✨` : `Removed "${title}" from your wishlist`);
  }
}

// -----------------------------------------------------------------------------
// 2. Shared Product Card Template
// -----------------------------------------------------------------------------
const GIFT_WATERMARK_SVG = `
  <rect x="3" y="8" width="18" height="4" rx="1"></rect>
  <path d="M12 8v13"></path>
  <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
  <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
`;

function renderProductCardHTML(product, index, variant = "default") {
  const toneNum = (index % 4) + 1;
  const isWishlisted = isProductWishlisted(product.id);

  if (variant === "catalogue") {
    return `
      <article class="product-card product-card--catalogue" data-product-id="${product.id}">
        <div class="product-card__img-box product-card__img-box--tone-${toneNum}">
          <svg class="product-card__watermark" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${GIFT_WATERMARK_SVG}
          </svg>
          <img src="${product.image}" alt="${product.name}" loading="lazy" draggable="false" onerror="this.remove()">
          <span class="product-badge-pill">${product.badge}</span>
          <button type="button" class="wish wish--catalogue" data-product-id="${product.id}" aria-pressed="${isWishlisted ? 'true' : 'false'}" aria-label="${isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}">
            <svg class="wish-heart-svg" width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? '#722F37' : 'none'}" stroke="${isWishlisted ? '#722F37' : '#6A1F2C'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">
            <button type="button" class="product-card__open" data-product-id="${product.id}" aria-label="Quick view for ${product.name}">
              ${product.name}
            </button>
          </h3>
          <div class="product-card__price-row">
            <span class="product-card__price">${formatINR(product.price)}</span>
          </div>
        </div>
      </article>
    `;
  }

  // Default variant (Bestsellers slider on homepage)
  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__img-box product-card__img-box--tone-${toneNum}">
        <svg class="product-card__watermark" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${GIFT_WATERMARK_SVG}
        </svg>
        <img src="${product.image}" alt="${product.name}" loading="lazy" draggable="false" onerror="this.remove()">
        <span class="product-badge-pill">${product.badge}</span>
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">
          <button type="button" class="product-card__open" data-product-id="${product.id}" aria-label="Quick view for ${product.name}">
            ${product.name}
          </button>
        </h3>
        <div class="product-card__price-row">
          <span class="product-card__price">${formatINR(product.price)}</span>
          <button type="button" class="wish" data-product-id="${product.id}" aria-pressed="${isWishlisted ? 'true' : 'false'}" aria-label="${isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}">
            <svg class="wish-heart-svg" width="24" height="24" viewBox="0 0 24 24" fill="${isWishlisted ? '#722F37' : 'none'}" stroke="${isWishlisted ? '#722F37' : '#6A1F2C'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function bindProductCardEvents(container) {
  if (!container) return;

  // Wishlist buttons
  container.querySelectorAll(".wish").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute("data-product-id");
      if (pid) {
        toggleProductWishlist(pid, btn);
      }
    });
  });

  // Quick view triggers
  container.querySelectorAll(".product-card__open").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute("data-product-id");
      const product = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).find(p => p.id === pid);
      if (product) {
        openQuickViewModal(product, btn);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// 3. Quick View Dialog Logic
// -----------------------------------------------------------------------------
let quickViewLastTrigger = null;
let currentQuickViewProduct = null;
let quickViewQuantity = 1;

function lockBodyScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  document.body.style.paddingRight = "";
  document.body.style.overflow = "";
}

function openQuickViewModal(product, triggerEl) {
  const dialog = document.getElementById("quickViewDialog");
  if (!dialog) return;

  quickViewLastTrigger = triggerEl;
  currentQuickViewProduct = product;
  quickViewQuantity = 1;

  // Media box
  const mediaContainer = document.getElementById("qvMedia");
  if (mediaContainer) {
    const list = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    const toneNum = ((list.findIndex(p => p.id === product.id) % 4) + 1);
    mediaContainer.className = `quickview__media quickview__media--tone-${toneNum}`;
    mediaContainer.innerHTML = `
      <svg class="quickview__watermark" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${GIFT_WATERMARK_SVG}
      </svg>
      <img src="${product.image}" alt="${product.name}" draggable="false" onerror="this.remove()">
    `;
  }

  // Text fields
  const badgeEl = document.getElementById("qvBadge");
  if (badgeEl) badgeEl.textContent = product.badge || "Handmade";

  const titleEl = document.getElementById("qv-title");
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.getElementById("qvPrice");
  if (priceEl) priceEl.textContent = formatINR(product.price);

  const descEl = document.getElementById("qvDesc");
  if (descEl) descEl.textContent = product.description || DESC;

  // Personalization note & counter
  const noteInput = document.getElementById("qv-note");
  const counterEl = document.getElementById("qvCounter");
  if (noteInput) {
    noteInput.value = "";
    if (counterEl) counterEl.textContent = "0/120";
  }

  // Stepper
  const qtyEl = document.getElementById("qvQtyValue");
  if (qtyEl) qtyEl.textContent = "1";

  lockBodyScroll();
  dialog.showModal();
}

function closeQuickViewModal() {
  const dialog = document.getElementById("quickViewDialog");
  if (!dialog || !dialog.open) return;

  dialog.close();
  unlockBodyScroll();

  if (quickViewLastTrigger && typeof quickViewLastTrigger.focus === "function") {
    quickViewLastTrigger.focus();
  }
  quickViewLastTrigger = null;
  currentQuickViewProduct = null;
}

let quickViewInitialized = false;

function initQuickViewEvents() {
  if (quickViewInitialized) return;
  const dialog = document.getElementById("quickViewDialog");
  if (!dialog) return;

  quickViewInitialized = true;

  const closeBtn = document.getElementById("qvCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeQuickViewModal);
  }

  // Close when clicking dialog backdrop outside inner card
  dialog.addEventListener("click", (e) => {
    const inner = dialog.querySelector(".quickview__inner");
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.bottom &&
      rect.left <= e.clientX && e.clientX <= rect.right
    );
    if (!isInDialog) {
      closeQuickViewModal();
    }
  });

  // Native cancel event on Escape key
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeQuickViewModal();
  });

  // Note character counter
  const noteInput = document.getElementById("qv-note");
  const counterEl = document.getElementById("qvCounter");
  if (noteInput && counterEl) {
    noteInput.addEventListener("input", () => {
      counterEl.textContent = `${noteInput.value.length}/120`;
    });
  }

  // Stepper controls
  const minusBtn = document.getElementById("qvMinusBtn");
  const plusBtn = document.getElementById("qvPlusBtn");
  const qtyEl = document.getElementById("qvQtyValue");

  if (minusBtn && qtyEl) {
    minusBtn.addEventListener("click", () => {
      if (quickViewQuantity > 1) {
        quickViewQuantity -= 1;
        qtyEl.textContent = quickViewQuantity;
      }
    });
  }

  if (plusBtn && qtyEl) {
    plusBtn.addEventListener("click", () => {
      if (quickViewQuantity < 10) {
        quickViewQuantity += 1;
        qtyEl.textContent = quickViewQuantity;
      }
    });
  }

  // Add to Cart
  const addBtn = document.getElementById("qvAddBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!currentQuickViewProduct) return;

      const note = noteInput ? noteInput.value.trim() : "";
      const qty = quickViewQuantity || 1;

      if (typeof window.addCustomItemToCart === "function") {
        window.addCustomItemToCart(currentQuickViewProduct, qty, note);
      } else {
        document.dispatchEvent(new CustomEvent("palora:addtocart", {
          detail: {
            product: currentQuickViewProduct,
            quantity: qty,
            note: note
          }
        }));
      }

      closeQuickViewModal();
    });
  }
}

// -----------------------------------------------------------------------------
// 4. Homepage Bestsellers Slider
// -----------------------------------------------------------------------------
function syncBestsellerArrowPosition() {
  const slider = document.querySelector(".bestsellers__slider");
  if (!slider) return;

  const card = slider.querySelector(".product-card");
  const imgBox = card ? card.querySelector(".product-card__img-box") : null;
  const prevBtn = slider.querySelector(".bestseller-nav-btn--prev");
  const nextBtn = slider.querySelector(".bestseller-nav-btn--next");

  if (imgBox && prevBtn && nextBtn) {
    const imgHeight = imgBox.offsetHeight || (imgBox.offsetWidth * 2 / 3);
    const offset = Math.round((imgHeight / 2) - 22 + 8);
    prevBtn.style.marginTop = `${offset}px`;
    nextBtn.style.marginTop = `${offset}px`;
  }
}

function renderBestsellerCards() {
  const track = document.getElementById("bestsellerTrack");
  if (!track || typeof PRODUCTS === "undefined") return;

  // ONLY render products where featured === true
  const featuredProducts = PRODUCTS.filter(p => p.featured === true);

  track.innerHTML = featuredProducts.map((product, index) => {
    return renderProductCardHTML(product, index, "default");
  }).join("");

  bindProductCardEvents(track);
}

function initBestsellersSlider() {
  const slider = document.querySelector(".bestsellers__slider");
  if (!slider) return;

  if (typeof window.initSlider === "function") {
    window.initSlider(slider, {
      step: 2,
      cardSelector: ".product-card"
    });
  }

  syncBestsellerArrowPosition();
  window.addEventListener("resize", syncBestsellerArrowPosition, { passive: true });
}

function mountBestsellersSection() {
  if (document.getElementById("bestsellerTrack")) {
    renderBestsellerCards();
    initQuickViewEvents();
    initBestsellersSlider();
  }
}

// Auto-mount on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mountBestsellersSection();
    initQuickViewEvents();
  });
} else {
  mountBestsellersSection();
  initQuickViewEvents();
}
