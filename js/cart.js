/**
 * Palora Cart State Management & Checkout Pipeline
 * Displays cart as a centered luxury modal card matching Quick View
 */

let cart = [];
let activeCartIndex = 0;
const CART_STORAGE_KEY = "palora_cart_items";

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    cart = saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.warn("Could not read cart from localStorage:", err);
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn("Could not save cart to localStorage:", err);
  }
}

window.addCustomItemToCart = function (product, quantity = 1, note = "") {
  const customNote = (note && note.trim()) ? note.trim() : "Standard (No custom text requested)";

  const existingItemIndex = cart.findIndex(
    item => item.id === product.id && item.note === customNote
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
    activeCartIndex = existingItemIndex;
  } else {
    cart.push({
      cartItemId: Date.now() + Math.random().toString(36).substring(2, 6),
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      note: customNote,
      quantity: quantity
    });
    activeCartIndex = cart.length - 1;
  }

  saveCartToStorage();
  updateCartUI();
  triggerCartBadgeBump();
  if (typeof showToast === "function") {
    showToast("Added to cart ✨");
  }
};

document.addEventListener("palora:addtocart", (e) => {
  if (e.detail && e.detail.product) {
    window.addCustomItemToCart(e.detail.product, e.detail.quantity || 1, e.detail.note || "");
  }
});

function updateCartItemQuantity(cartItemId, delta) {
  const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
    if (activeCartIndex >= cart.length) {
      activeCartIndex = Math.max(0, cart.length - 1);
    }
    if (typeof showToast === "function") showToast("Item removed from cart");
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  if (activeCartIndex >= cart.length) {
    activeCartIndex = Math.max(0, cart.length - 1);
  }
  saveCartToStorage();
  updateCartUI();
  if (typeof showToast === "function") showToast("Item removed from cart");
}

function triggerCartBadgeBump() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 300);
}

function updateCartUI() {
  const badge = document.getElementById("cartBadge");
  const headerCount = document.getElementById("cartHeaderCount");
  const grandTotal = document.getElementById("cartGrandTotal");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartGrid = document.getElementById("cartGrid");
  const proceedBtn = document.getElementById("proceedWhatsAppBtn");

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (badge) {
    if (totalCount > 0) {
      badge.textContent = totalCount;
      badge.style.display = "flex";
    } else {
      badge.textContent = "";
      badge.style.display = "none";
    }
  }

  if (headerCount) headerCount.textContent = `${totalCount} ${totalCount === 1 ? "item" : "items"}`;
  if (grandTotal) grandTotal.textContent = `₹${totalAmount.toLocaleString("en-IN")}`;

  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "flex";
    if (cartGrid) cartGrid.style.display = "none";
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.style.opacity = "0.5";
    }
  } else {
    if (cartEmpty) cartEmpty.style.display = "none";
    if (cartGrid) cartGrid.style.display = "grid";

    if (activeCartIndex >= cart.length) activeCartIndex = cart.length - 1;
    if (activeCartIndex < 0) activeCartIndex = 0;

    const activeItem = cart[activeCartIndex];
    const productsList = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    const inrFormatter = typeof inr !== "undefined" ? inr : new Intl.NumberFormat("en-IN");
    const matchedProduct = productsList.find(p => p.id === activeItem.id);
    const badgeText = (matchedProduct && matchedProduct.badge) ? matchedProduct.badge : "Handmade";
    const toneNum = ((productsList.findIndex(p => p.id === activeItem.id) % 4) + 1) || 1;

    // Media Box
    const mediaBox = document.getElementById("cartMediaBox");
    if (mediaBox) {
      mediaBox.className = `cart-media-box cart-media-box--tone-${toneNum}`;
    }
    const badgeEl = document.getElementById("cartActiveBadge");
    if (badgeEl) badgeEl.textContent = badgeText;

    const imgEl = document.getElementById("cartActiveImg");
    if (imgEl) {
      imgEl.style.display = "none";
      if (activeItem.image) {
        imgEl.src = activeItem.image;
        imgEl.alt = activeItem.name;
        imgEl.onload = function () {
          imgEl.style.display = "block";
        };
        imgEl.onerror = function () {
          imgEl.style.display = "none";
        };
      }
    }

    // Text Details
    const nameEl = document.getElementById("cartActiveName");
    if (nameEl) nameEl.textContent = activeItem.name;

    const priceEl = document.getElementById("cartActivePrice");
    if (priceEl) priceEl.textContent = `₹${inrFormatter.format(activeItem.price)}`;

    const subtotalEl = document.getElementById("cartActiveSubtotal");
    if (subtotalEl) {
      if (activeItem.quantity > 1) {
        subtotalEl.textContent = `(Subtotal: ₹${inrFormatter.format(activeItem.price * activeItem.quantity)})`;
      } else {
        subtotalEl.textContent = "";
      }
    }

    // Personalization Note
    const noteInput = document.getElementById("cartActiveNote");
    const counterEl = document.getElementById("cartActiveCounter");
    if (noteInput && document.activeElement !== noteInput) {
      const displayNote = (activeItem.note && activeItem.note !== "Standard (No custom text requested)") ? activeItem.note : "";
      noteInput.value = displayNote;
      if (counterEl) counterEl.textContent = `${displayNote.length}/120`;
    }

    // Stepper Value
    const qtyValEl = document.getElementById("cartActiveQty");
    if (qtyValEl) qtyValEl.textContent = activeItem.quantity;

    // Thumbnail strip navigation if > 1 item
    const thumbNav = document.getElementById("cartThumbNav");
    if (thumbNav) {
      if (cart.length > 1) {
        thumbNav.style.display = "flex";
        thumbNav.innerHTML = "";
        cart.forEach((it, idx) => {
          const itemToneNum = ((productsList.findIndex(p => p.id === it.id) % 4) + 1) || 1;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `cart-thumb-btn cart-thumb-btn--tone-${itemToneNum} ${idx === activeCartIndex ? "is-active" : ""}`;
          btn.setAttribute("aria-label", `View ${it.name}`);
          btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity: 0.7;">
              <rect x="3" y="8" width="18" height="4" rx="1"></rect>
              <path d="M12 8v13"></path>
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
            </svg>
            <img src="${it.image || ''}" alt="" loading="lazy" style="display:none;" onload="this.style.display='block'" onerror="this.remove()">
          `;
          btn.addEventListener("click", () => {
            activeCartIndex = idx;
            updateCartUI();
          });
          thumbNav.appendChild(btn);
        });
      } else {
        thumbNav.style.display = "none";
        thumbNav.innerHTML = "";
      }
    }

    // Action button state
    if (proceedBtn) {
      if (typeof hasWhatsApp === "function" && !hasWhatsApp()) {
        proceedBtn.disabled = true;
        proceedBtn.style.opacity = "0.6";
        const btnText = proceedBtn.querySelector("span");
        if (btnText) btnText.textContent = "WhatsApp ordering coming soon";
      } else {
        proceedBtn.disabled = false;
        proceedBtn.style.opacity = "1";
        const btnText = proceedBtn.querySelector("span");
        if (btnText) btnText.textContent = "Proceed to WhatsApp";
      }
    }
  }
}

function proceedToWhatsAppCheckout() {
  if (cart.length === 0) return;

  if (typeof hasWhatsApp === "function" && !hasWhatsApp()) {
    console.warn("WhatsApp number is not configured in js/config.js");
    return;
  }

  const custNameEl = document.getElementById("orderCustomerName");
  const cityEl = document.getElementById("orderDeliveryCity");
  const customerName = custNameEl && custNameEl.value.trim() ? custNameEl.value.trim() : "Gifting Guest";
  const deliveryCity = cityEl && cityEl.value.trim() ? cityEl.value.trim() : "Not specified";

  let grandTotal = 0;
  const messageLines = [
    `*🎁 NEW ORDER INQUIRY - PALORA HANDMADE*`,
    `--------------------------------------`,
    `*Customer:* ${customerName}`,
    `*Location:* ${deliveryCity}`,
    `*Date:* ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
    `--------------------------------------`,
    `*ORDER ITEMS:*`
  ];

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    grandTotal += lineTotal;
    messageLines.push(
      `\n*${index + 1}. ${item.name}*`,
      `• Qty: ${item.quantity} × ₹${item.price.toLocaleString("en-IN")} = ₹${lineTotal.toLocaleString("en-IN")}`,
      `• *Personalization:* "${item.note}"`
    );
  });

  messageLines.push(
    `--------------------------------------`,
    `*ESTIMATED TOTAL: ₹${grandTotal.toLocaleString("en-IN")}*`,
    `_(Excluding shipping; verified via chat)_`,
    ``,
    `✨ _Hello Palora! I would like to place this handmade order. Please confirm availability and share payment details._`
  );

  const fullMessage = messageLines.join("\n");
  const targetUrl = typeof waLink === "function" ? waLink(fullMessage) : "";
  if (targetUrl) {
    window.open(targetUrl, "_blank");
  }
}

function ensureCartDOM() {
  if (document.getElementById("cartModal")) return;

  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";
  overlay.id = "cartOverlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("hidden", "");
  overlay.setAttribute("inert", "");

  const modal = document.createElement("aside");
  modal.className = "cart-modal";
  modal.id = "cartModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "cartHeading");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("hidden", "");
  modal.setAttribute("inert", "");

  modal.innerHTML = `
    <div class="cart-inner">
      <button type="button" class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">&times;</button>

      <!-- Empty State -->
      <div class="cart-empty" id="cartEmpty" style="display: none;">
        <div class="cart-empty-art">🌸</div>
        <h2 class="cart-empty-title">Your Cart is Empty</h2>
        <p class="cart-empty-text">Add a personalized handmade keepsake to brighten someone's day.</p>
        <a href="catalogue.html" class="cart-action-btn cart-empty-btn" id="shopNowEmptyBtn">Explore Collections</a>
      </div>

      <!-- Filled State Grid (2-Column Card matching Quick View) -->
      <div class="cart-grid" id="cartGrid" style="display: none;">
        <!-- Left Column: Media & Thumbnails -->
        <div class="cart-media-col">
          <div class="cart-media-box" id="cartMediaBox">
            <span class="cart-badge-pill" id="cartActiveBadge">Handmade</span>
            <svg class="cart-watermark" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="8" width="18" height="4" rx="1"></rect>
              <path d="M12 8v13"></path>
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
            </svg>
            <img id="cartActiveImg" src="" alt="Cart Product" draggable="false">
          </div>
          <div class="cart-thumb-nav" id="cartThumbNav" style="display: none;"></div>
        </div>

        <!-- Right Column: Details, Note, Stepper, Delivery & WhatsApp Action -->
        <div class="cart-details-col">
          <div class="cart-header-row">
            <h2 class="cart-heading" id="cartHeading">Your Cart</h2>
            <span class="cart-count-chip" id="cartHeaderCount">1 item</span>
          </div>

          <h3 class="cart-product-title" id="cartActiveName">Product Name</h3>

          <div class="cart-price-line">
            <span class="cart-product-price" id="cartActivePrice">₹0</span>
            <span class="cart-subtotal-hint" id="cartActiveSubtotal"></span>
          </div>

          <div class="cart-personalization">
            <label for="cartActiveNote" class="cart-field-label">PERSONALIZE IT</label>
            <input type="text" id="cartActiveNote" class="cart-input" maxlength="120" placeholder="Name, date or a short message (optional)">
            <div class="cart-counter" id="cartActiveCounter">0/120</div>
          </div>

          <div class="cart-stepper-row">
            <div class="cart-stepper-wrap">
              <span class="cart-field-label">QUANTITY</span>
              <div class="cart-stepper">
                <button type="button" class="stepper-btn" id="cartMinusBtn" aria-label="Decrease quantity">&minus;</button>
                <span class="stepper-value" id="cartActiveQty">1</span>
                <button type="button" class="stepper-btn" id="cartPlusBtn" aria-label="Increase quantity">&plus;</button>
              </div>
            </div>
            <button type="button" class="cart-remove-link" id="cartRemoveBtn">Remove item</button>
          </div>

          <!-- Optional Recipient Details for Seamless WhatsApp Message -->
          <div class="cart-delivery-section">
            <label class="cart-field-label">DELIVERY DETAILS (OPTIONAL)</label>
            <div class="cart-input-row">
              <input type="text" id="orderCustomerName" class="cart-input" placeholder="Your Name (e.g. Aditi)" aria-label="Your Name">
              <input type="text" id="orderDeliveryCity" class="cart-input" placeholder="Delivery City / Pincode" aria-label="Delivery City">
            </div>
          </div>

          <!-- Grand Total & Shipping Note -->
          <div class="cart-total-section">
            <div class="cart-total-row">
              <span class="cart-total-label">Grand Total:</span>
              <span class="cart-total-amount" id="cartGrandTotal">₹0</span>
            </div>
            <p class="cart-shipping-note">✨ Standard shipping calculated &amp; finalized via WhatsApp</p>
          </div>

          <!-- Primary Action: Proceed to WhatsApp Button -->
          <button type="button" class="cart-action-btn proceed-whatsapp-btn" id="proceedWhatsAppBtn">
            <svg class="whatsapp-btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.954.563 3.778 1.536 5.325L2 22l4.808-1.503A9.957 9.957 0 0 0 12.004 22C17.528 22 22 17.52 22 12.004 22 6.48 17.528 2 12.004 2zm5.468 14.382c-.226.635-1.305 1.215-1.824 1.294-.468.071-1.061.1-1.71-.107-.393-.125-.898-.292-1.544-.57-2.716-1.171-4.49-3.905-4.625-4.086-.135-.181-1.097-1.46-1.097-2.784 0-1.324.693-1.975.94-2.245.247-.27.539-.337.719-.337.18 0 .36 0 .517.008.165.008.388-.063.607.463.225.54.765 1.868.832 2.003.067.135.112.293.022.473-.09.18-.135.292-.27.45-.135.157-.284.351-.405.472-.135.135-.276.282-.119.552.157.27.7 1.154 1.504 1.87 1.034.924 1.905 1.21 2.175 1.345.27.135.427.112.584-.068.158-.18.675-.788.855-1.058.18-.27.36-.225.607-.135.247.09 1.572.741 1.842.876.27.135.45.203.517.315.068.113.068.653-.158 1.288z" />
            </svg>
            <span>Proceed to WhatsApp</span>
          </button>

          <a href="help.html#faqs" class="cart-faq-link">Questions? See Help &amp; FAQs</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Wire up event listeners
  const closeBtn = modal.querySelector("#cartCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeCartModal);
  overlay.addEventListener("click", closeCartModal);

  const proceedBtn = modal.querySelector("#proceedWhatsAppBtn");
  if (proceedBtn) proceedBtn.addEventListener("click", proceedToWhatsAppCheckout);

  const shopNowBtn = modal.querySelector("#shopNowEmptyBtn");
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeCartModal();
      window.location.href = "catalogue.html";
    });
  }

  const minusBtn = modal.querySelector("#cartMinusBtn");
  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      if (cart[activeCartIndex]) {
        updateCartItemQuantity(cart[activeCartIndex].cartItemId, -1);
      }
    });
  }

  const plusBtn = modal.querySelector("#cartPlusBtn");
  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      if (cart[activeCartIndex]) {
        updateCartItemQuantity(cart[activeCartIndex].cartItemId, 1);
      }
    });
  }

  const removeBtn = modal.querySelector("#cartRemoveBtn");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      if (cart[activeCartIndex]) {
        removeCartItem(cart[activeCartIndex].cartItemId);
      }
    });
  }

  const noteInput = modal.querySelector("#cartActiveNote");
  if (noteInput) {
    noteInput.addEventListener("input", (e) => {
      if (cart[activeCartIndex]) {
        const val = e.target.value;
        cart[activeCartIndex].note = val ? val : "Standard (No custom text requested)";
        saveCartToStorage();
        const counter = modal.querySelector("#cartActiveCounter");
        if (counter) counter.textContent = `${val.length}/120`;
      }
    });
  }
}

function openCartModal() {
  ensureCartDOM();
  updateCartUI();

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
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  if (overlay) {
    overlay.classList.add("open");
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
  }
  document.body.classList.add("cart-open");
  document.body.style.overflow = "hidden";
  document.dispatchEvent(new CustomEvent("panelopen", { detail: { panel: "cart" } }));

  const closeBtn = document.getElementById("cartCloseBtn");
  if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
}

function closeCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (modal) {
    modal.classList.remove("open");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
  if (overlay) {
    overlay.classList.remove("open");
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }
  const onEnd = function () {
    if (modal && !modal.classList.contains("open") && !modal.classList.contains("is-open")) {
      modal.setAttribute("hidden", "");
      modal.setAttribute("inert", "");
    }
    if (overlay && !overlay.classList.contains("open") && !overlay.classList.contains("is-open")) {
      overlay.setAttribute("hidden", "");
      overlay.setAttribute("inert", "");
    }
  };
  if (modal) {
    modal.addEventListener("transitionend", onEnd, { once: true });
    setTimeout(onEnd, 400);
  }
  document.body.classList.remove("cart-open");
  document.body.style.overflow = "";
  document.dispatchEvent(new CustomEvent("panelclose", { detail: { panel: "cart" } }));
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.handleAddToCart = function (productId) {
  const product = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).find(p => p.id === productId);
  if (!product) return;
  const noteInput = document.getElementById(`custom-note-${productId}`);
  const customNote = noteInput ? noteInput.value.trim() : "";
  window.addCustomItemToCart(product, 1, customNote);
  if (noteInput) noteInput.value = "";
};

window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.proceedToWhatsAppCheckout = proceedToWhatsAppCheckout;

document.addEventListener("DOMContentLoaded", () => {
  ensureCartDOM();
  loadCartFromStorage();
  updateCartUI();

  const cartBtn = document.getElementById("cartBtn");
  const cartCloseBtn = document.getElementById("cartCloseBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const proceedBtn = document.getElementById("proceedWhatsAppBtn");
  const shopNowBtn = document.getElementById("shopNowEmptyBtn");

  if (cartBtn) cartBtn.addEventListener("click", openCartModal);
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartModal);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartModal);
  if (proceedBtn) proceedBtn.addEventListener("click", proceedToWhatsAppCheckout);
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeCartModal();
      window.location.href = "catalogue.html";
    });
  }

  // Delegated click listener to guarantee opening cart even after header re-render
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#cartBtn, .cart-btn");
    if (btn) {
      e.preventDefault();
      openCartModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCartModal();
  });
});
