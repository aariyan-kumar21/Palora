/**
 * Palora Cart State Management & Checkout Pipeline
 * Displays cart as a centered luxury modal card with:
 * - Product list: left-side image, right-side details (name, price, quantity, personalization note)
 * - Customer details: name, address
 * - Order summary breakdown: product name, quantity, personalization note, price
 * - Grand total & WhatsApp handoff
 */

let cart = [];
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
    if (typeof showToast === "function") showToast("Item removed from cart");
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCartToStorage();
  updateCartUI();
  if (typeof showToast === "function") showToast("Item removed from cart");
}

function updateCartItemNote(cartItemId, newNote) {
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (item) {
    item.note = newNote.trim() ? newNote.trim() : "Standard (No custom text requested)";
    saveCartToStorage();
    renderCartSummaryTable();
    const itemEl = document.querySelector(`[data-cart-item-id="${cartItemId}"] .cart-counter`);
    if (itemEl) itemEl.textContent = `${newNote.length}/120`;
  }
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
  const cartFilledContent = document.getElementById("cartFilledContent");
  const proceedBtn = document.getElementById("proceedWhatsAppBtn");

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update navbar badge
  if (badge) {
    if (totalCount > 0) {
      badge.textContent = totalCount;
      badge.style.display = "flex";
    } else {
      badge.textContent = "";
      badge.style.display = "none";
    }
  }

  // Update header count and grand total
  if (headerCount) headerCount.textContent = `${totalCount} ${totalCount === 1 ? "item" : "items"}`;
  if (grandTotal) grandTotal.textContent = `₹${totalAmount.toLocaleString("en-IN")}`;

  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "flex";
    if (cartFilledContent) cartFilledContent.style.display = "none";
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.style.opacity = "0.5";
    }
  } else {
    if (cartEmpty) cartEmpty.style.display = "none";
    if (cartFilledContent) cartFilledContent.style.display = "block";

    renderCartProductsList();
    renderCartSummaryTable();

    // Proceed button state
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

function renderCartProductsList() {
  const container = document.getElementById("cartProductsList");
  if (!container) return;

  const activeInput = document.activeElement;
  const isInputFocused = activeInput && activeInput.classList.contains("cart-item-note-input");
  if (isInputFocused) return;

  container.innerHTML = "";
  const productsList = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  const inrFormatter = typeof inr !== "undefined" ? inr : new Intl.NumberFormat("en-IN");

  cart.forEach(item => {
    const product = productsList.find(p => p.id === item.id);
    const badgeText = (product && product.badge) ? product.badge : "Handmade";
    const toneNum = ((productsList.findIndex(p => p.id === item.id) % 4) + 1) || 1;
    const hasCustomNote = item.note && item.note !== "Standard (No custom text requested)" && item.note.trim() !== "";
    const displayNote = hasCustomNote ? item.note : "";

    const itemEl = document.createElement("div");
    itemEl.className = "cart-product-item";
    itemEl.setAttribute("data-cart-item-id", item.cartItemId);

    itemEl.innerHTML = `
      <!-- Left: Product Image Box with tone, badge & watermark -->
      <div class="cart-item-media cart-item-media--tone-${toneNum}">
        <span class="cart-badge-pill">${escapeHtml(badgeText)}</span>
        <svg class="cart-watermark" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="8" width="18" height="4" rx="1"></rect>
          <path d="M12 8v13"></path>
          <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
        </svg>
        <img src="${item.image || ''}" alt="${escapeHtml(item.name)}" loading="lazy" style="display:none;" onload="this.style.display='block'" onerror="this.remove()">
      </div>

      <!-- Right: Details of the product (Name, Price, Note, Quantity) -->
      <div class="cart-item-info">
        <div class="cart-item-title-row">
          <h3 class="cart-item-title">${escapeHtml(item.name)}</h3>
          <button type="button" class="cart-item-remove-btn" onclick="removeCartItem('${item.cartItemId}')" aria-label="Remove ${escapeHtml(item.name)} from cart">&times;</button>
        </div>

        <div class="cart-item-price-row">
          <span class="cart-item-unit-price">₹${inrFormatter.format(item.price)} each</span>
          ${item.quantity > 1 ? `<span class="cart-item-subtotal-hint">(Subtotal: ₹${inrFormatter.format(item.price * item.quantity)})</span>` : ''}
        </div>

        <div class="cart-item-personalization">
          <label class="cart-field-label">PERSONALIZE IT</label>
          <input type="text" class="cart-input cart-item-note-input" maxlength="120" placeholder="Name, date or a short message (optional)" value="${escapeHtml(displayNote)}" oninput="updateCartItemNote('${item.cartItemId}', this.value)">
          <div class="cart-counter">${displayNote.length}/120</div>
        </div>

        <div class="cart-item-stepper-row">
          <div class="cart-stepper-wrap">
            <span class="cart-field-label">QUANTITY</span>
            <div class="cart-stepper">
              <button type="button" class="stepper-btn" onclick="updateCartItemQuantity('${item.cartItemId}', -1)" aria-label="Decrease quantity">&minus;</button>
              <span class="stepper-value">${item.quantity}</span>
              <button type="button" class="stepper-btn" onclick="updateCartItemQuantity('${item.cartItemId}', 1)" aria-label="Increase quantity">&plus;</button>
            </div>
          </div>
          <button type="button" class="cart-remove-link" onclick="removeCartItem('${item.cartItemId}')">Remove item</button>
        </div>
      </div>
    `;

    container.appendChild(itemEl);
  });
}

function renderCartSummaryTable() {
  const container = document.getElementById("cartSummaryItems");
  if (!container) return;

  container.innerHTML = "";
  const inrFormatter = typeof inr !== "undefined" ? inr : new Intl.NumberFormat("en-IN");

  cart.forEach(item => {
    const hasCustomNote = item.note && item.note !== "Standard (No custom text requested)" && item.note.trim() !== "";
    const lineTotal = item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-summary-row";
    row.setAttribute("data-summary-item-id", item.cartItemId);

    row.innerHTML = `
      <div class="cart-summary-item-main">
        <span class="cart-summary-item-name">${escapeHtml(item.name)}</span>
        <span class="cart-summary-item-note">${hasCustomNote ? `Note: "${escapeHtml(item.note)}"` : 'Note: Standard'}</span>
      </div>
      <div class="cart-summary-item-meta">
        <span class="cart-summary-item-qty">Qty: ${item.quantity}</span>
        <span class="cart-summary-item-price">₹${inrFormatter.format(lineTotal)}</span>
      </div>
    `;

    container.appendChild(row);
  });
}

function proceedToWhatsAppCheckout() {
  if (cart.length === 0) return;

  if (typeof hasWhatsApp === "function" && !hasWhatsApp()) {
    console.warn("WhatsApp number is not configured in js/config.js");
    return;
  }

  const custNameEl = document.getElementById("orderCustomerName");
  const addressEl = document.getElementById("orderCustomerAddress");
  const customerName = custNameEl && custNameEl.value.trim() ? custNameEl.value.trim() : "Gifting Guest";
  const customerAddress = addressEl && addressEl.value.trim() ? addressEl.value.trim() : "Not specified";

  let grandTotal = 0;
  const messageLines = [
    `*🎁 NEW ORDER INQUIRY - PALORA HANDMADE*`,
    `--------------------------------------`,
    `*Customer:* ${customerName}`,
    `*Delivery Address:* ${customerAddress}`,
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

      <!-- Filled Cart Content -->
      <div id="cartFilledContent" style="display: none;">
        <!-- Header -->
        <div class="cart-header-row">
          <h2 class="cart-heading" id="cartHeading">Your Cart</h2>
          <span class="cart-count-chip" id="cartHeaderCount">0 items</span>
        </div>

        <!-- 1. Products List: Image on left, details on right -->
        <div class="cart-products-list" id="cartProductsList">
          <!-- Populated dynamically -->
        </div>

        <!-- 2. Customer Details: Name and Address -->
        <div class="cart-customer-section">
          <h4 class="cart-section-subtitle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Customer Details
          </h4>
          <div class="cart-input-grid">
            <div class="cart-field-group">
              <label for="orderCustomerName" class="cart-field-label">YOUR NAME</label>
              <input type="text" id="orderCustomerName" class="cart-input" placeholder="Full name (e.g. Aditi Sharma)">
            </div>
            <div class="cart-field-group">
              <label for="orderCustomerAddress" class="cart-field-label">DELIVERY ADDRESS</label>
              <input type="text" id="orderCustomerAddress" class="cart-input" placeholder="House/Flat No., Street, City, Pincode">
            </div>
          </div>
        </div>

        <!-- 3. Details of Products (Order Summary Table): Name, Quantity, Note, Price, and Grand Total -->
        <div class="cart-summary-section">
          <h4 class="cart-section-subtitle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Order Summary
          </h4>
          <div class="cart-summary-items" id="cartSummaryItems">
            <!-- Populated dynamically -->
          </div>
          <div class="cart-summary-total-divider"></div>
          <div class="cart-grand-total-row">
            <span class="cart-grand-total-label">Grand Total:</span>
            <span class="cart-grand-total-amount" id="cartGrandTotal">₹0</span>
          </div>
          <p class="cart-shipping-note">✨ Standard shipping calculated &amp; finalized via WhatsApp</p>
        </div>

        <!-- 4. CTA and Action Buttons -->
        <div class="cart-cta-section">
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
window.updateCartItemNote = updateCartItemNote;
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
