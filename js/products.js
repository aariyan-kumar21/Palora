/**
 * Palora Bestselling Collection - Product Catalog, Slider & Quick View Modal
 * Pure Vanilla JavaScript
 */

// -----------------------------------------------------------------------------
// 1. Product Catalog Data (Client Editable)
// -----------------------------------------------------------------------------
const PRODUCTS = [
  {
    id: "crochet-sunflower-bouquet",
    name: "Crochet Sunflower Bouquet",
    price: 899,
    badge: "Bestseller",
    category: "crochet-items",
    image: "assets/products/crochet-sunflower-bouquet.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  {
    id: "floral-resin-coasters",
    name: "Floral Resin Coasters",
    price: 649,
    badge: "New",
    category: "home-decor",
    image: "assets/products/floral-resin-coasters.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  {
    id: "custom-photo-frame",
    name: "Custom Photo Frame",
    price: 799,
    badge: "Personalizable",
    category: "designed-frames",
    image: "assets/products/custom-photo-frame.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  {
    id: "crochet-bunny",
    name: "Crochet Bunny",
    price: 1049,
    badge: "Handmade",
    category: "crochet-items",
    image: "assets/products/crochet-bunny.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  // Sample products
  {
    id: "personalized-name-keychain",
    name: "Personalized Name Keychain",
    price: 299,
    badge: "Personalizable",
    category: "keychains",
    image: "assets/products/personalized-name-keychain.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  {
    id: "letter-and-card-set",
    name: "Handwritten Letter & Card Set",
    price: 349,
    badge: "Handmade",
    category: "letters-cards",
    image: "assets/products/letter-and-card-set.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  {
    id: "festive-gift-hamper",
    name: "Festive Gift Hamper",
    price: 1499,
    badge: "New",
    category: "hampers",
    image: "assets/products/festive-gift-hamper.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  },
  {
    id: "mini-floral-bouquet",
    name: "Mini Floral Bouquet",
    price: 599,
    badge: "Bestseller",
    category: "bouquets-flowers",
    image: "assets/products/mini-floral-bouquet.jpg",
    description: "Handmade to order with care. Add a personalization note below."
  }
];

// -----------------------------------------------------------------------------
// 2. Wishlist Storage & State
// -----------------------------------------------------------------------------
const WISHLIST_STORAGE_KEY = "palora_wishlist";

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
}

function updateWishlistButtonUI(btn, isWishlisted, productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const name = product ? product.name : "product";
  btn.setAttribute("aria-pressed", isWishlisted ? "true" : "false");
  btn.setAttribute("aria-label", isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`);
  const svg = btn.querySelector(".wish-heart-svg");
  if (svg) {
    svg.setAttribute("fill", isWishlisted ? "#722F37" : "none");
    svg.setAttribute("stroke", isWishlisted ? "#722F37" : "#6A1F2C");
  }
}

// -----------------------------------------------------------------------------
// 3. Formatting Utilities
// -----------------------------------------------------------------------------
const inrFormatter = new Intl.NumberFormat("en-IN");

function formatINR(amount) {
  return "₹" + inrFormatter.format(amount);
}

// -----------------------------------------------------------------------------
// 4. Render Bestselling Product Cards
// -----------------------------------------------------------------------------
function renderBestsellerCards() {
  const track = document.getElementById("bestsellerTrack");
  if (!track) return;

  const wishlist = getWishlist();

  const giftBoxSvg = `
    <rect x="3" y="8" width="18" height="4" rx="1"></rect>
    <path d="M12 8v13"></path>
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
  `;

  track.innerHTML = PRODUCTS.map((product, index) => {
    const toneNum = (index % 4) + 1;
    const isWishlisted = wishlist.includes(product.id);

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card__img-box product-card__img-box--tone-${toneNum}">
          <svg class="product-card__watermark" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${giftBoxSvg}
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
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Attach wishlist button click handlers
  track.querySelectorAll(".wish").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute("data-product-id");
      if (pid) {
        toggleProductWishlist(pid, btn);
      }
    });
  });

  // Attach card quick view trigger click handlers
  track.querySelectorAll(".product-card__open").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const pid = btn.getAttribute("data-product-id");
      const product = PRODUCTS.find(p => p.id === pid);
      if (product) {
        openQuickViewModal(product, btn);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// 5. Quick View Dialog Logic
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

  // Media
  const mediaContainer = document.getElementById("qvMedia");
  if (mediaContainer) {
    const toneNum = ((PRODUCTS.findIndex(p => p.id === product.id) % 4) + 1);
    mediaContainer.className = `quickview__media quickview__media--tone-${toneNum}`;
    mediaContainer.innerHTML = `
      <svg class="quickview__watermark" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="8" width="18" height="4" rx="1"></rect>
        <path d="M12 8v13"></path>
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
      </svg>
      <img src="${product.image}" alt="${product.name}" draggable="false" onerror="this.remove()">
    `;
  }

  // Text info
  const badgeEl = document.getElementById("qvBadge");
  if (badgeEl) badgeEl.textContent = product.badge;

  const titleEl = document.getElementById("qv-title");
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.getElementById("qvPrice");
  if (priceEl) priceEl.textContent = formatINR(product.price);

  const descEl = document.getElementById("qvDesc");
  if (descEl) descEl.textContent = product.description;

  // Personalization note input & counter
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

function initQuickViewEvents() {
  const dialog = document.getElementById("quickViewDialog");
  if (!dialog) return;

  const closeBtn = document.getElementById("qvCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeQuickViewModal);
  }

  // Close on backdrop click (click target is dialog itself outside inner box)
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

  // Note live character counter
  const noteInput = document.getElementById("qv-note");
  const counterEl = document.getElementById("qvCounter");
  if (noteInput && counterEl) {
    noteInput.addEventListener("input", () => {
      counterEl.textContent = `${noteInput.value.length}/120`;
    });
  }

  // Stepper controls (min 1, max 10)
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

  // Add to Cart button inside Quick View
  const addBtn = document.getElementById("qvAddBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!currentQuickViewProduct) return;

      const note = noteInput ? noteInput.value.trim() : "";
      const qty = quickViewQuantity || 1;

      // Integrate with existing Cart module
      if (typeof window.addCustomItemToCart === "function") {
        window.addCustomItemToCart(currentQuickViewProduct, qty, note);
      } else {
        // Fallback dispatch if cart function is not yet globally mounted
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
// 6. Slider Initialization & Vertical Centering
// -----------------------------------------------------------------------------
function syncBestsellerArrowPosition() {
  const slider = document.querySelector(".bestsellers__slider");
  if (!slider) return;

  const card = slider.querySelector(".product-card");
  const imgBox = card ? card.querySelector(".product-card__img-box") : null;
  const prevBtn = slider.querySelector(".bestseller-nav-btn--prev");
  const nextBtn = slider.querySelector(".bestseller-nav-btn--next");

  if (imgBox && prevBtn && nextBtn) {
    // Card image box height
    const imgHeight = imgBox.offsetHeight || (imgBox.offsetWidth * 2 / 3);
    // Button is 44px height, track has 8px top padding
    const offset = Math.round((imgHeight / 2) - 22 + 8);
    prevBtn.style.marginTop = `${offset}px`;
    nextBtn.style.marginTop = `${offset}px`;
  }
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

// -----------------------------------------------------------------------------
// 7. Lifecycle Mount
// -----------------------------------------------------------------------------
function mountBestsellersSection() {
  renderBestsellerCards();
  initQuickViewEvents();
  initBestsellersSlider();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountBestsellersSection);
} else {
  mountBestsellersSection();
}
