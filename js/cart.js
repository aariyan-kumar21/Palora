/**
 * Palora Cart State Management & Checkout Pipeline
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
    showToast("Added to gift bag ✨");
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
    if (typeof showToast === "function") showToast("Item removed from gift bag");
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCartToStorage();
  updateCartUI();
  if (typeof showToast === "function") showToast("Item removed from gift bag");
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
  const cartBody = document.getElementById("cartBody");
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
    if (cartBody) cartBody.style.display = "none";
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.style.opacity = "0.5";
    }
  } else {
    if (cartEmpty) cartEmpty.style.display = "none";
    if (cartBody) cartBody.style.display = "flex";
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
    renderCartItemsList();
  }
}

function renderCartItemsList() {
  const list = document.getElementById("cartItemsList");
  if (!list) return;
  list.innerHTML = "";

  const productsList = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  const inrFormatter = typeof inr !== "undefined" ? inr : new Intl.NumberFormat("en-IN");

  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item-card";
    li.setAttribute("data-cart-item-id", item.cartItemId);

    const subtotal = item.price * item.quantity;
    const toneNum = ((productsList.findIndex(p => p.id === item.id) % 4) + 1) || 1;
    const product = productsList.find(p => p.id === item.id);
    const badgeText = (product && product.badge) ? product.badge : "Handmade";
    const hasNote = item.note && item.note !== "Standard (No custom text requested)" && item.note.trim() !== "";

    li.innerHTML = `
      <div class="cart-card-top">
        <div class="cart-card-thumb cart-card-thumb--tone-${toneNum}">
          <svg class="cart-card-watermark" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="8" width="18" height="4" rx="1"></rect>
            <path d="M12 8v13"></path>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
          </svg>
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='assets/hero.png'">
        </div>
        <div class="cart-card-content">
          <div class="cart-card-badge-row">
            <span class="cart-card-badge">${escapeHtml(badgeText)}</span>
            <button type="button" class="cart-item-remove-btn" onclick="removeCartItem('${item.cartItemId}')" aria-label="Remove ${escapeHtml(item.name)} from cart">&times;</button>
          </div>
          <h3 class="cart-card-title">${escapeHtml(item.name)}</h3>
          <div class="cart-card-unit-price">₹${inrFormatter.format(item.price)} each</div>
          ${hasNote ? `
            <div class="cart-card-note">
              <span class="cart-card-note-label">NOTE:</span>
              <span class="cart-card-note-text">"${escapeHtml(item.note)}"</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="cart-card-bottom">
        <div class="cart-card-stepper" role="group" aria-label="Adjust quantity">
          <button type="button" class="cart-stepper-btn" onclick="updateCartItemQuantity('${item.cartItemId}', -1)" aria-label="Decrease quantity">&minus;</button>
          <span class="cart-stepper-value">${item.quantity}</span>
          <button type="button" class="cart-stepper-btn" onclick="updateCartItemQuantity('${item.cartItemId}', 1)" aria-label="Increase quantity">&plus;</button>
        </div>
        <div class="cart-card-subtotal">
          <span class="cart-card-subtotal-label">Subtotal:</span>
          <span class="cart-card-subtotal-val">₹${inrFormatter.format(subtotal)}</span>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
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
    <div class="cart-header">
      <div class="cart-header-title">
        <h2 class="cart-heading" id="cartHeading">Your Gift Bag</h2>
        <span class="cart-count-chip" id="cartHeaderCount">0 items</span>
      </div>
      <button type="button" class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">&times;</button>
    </div>

    <!-- Empty State -->
    <div class="cart-empty" id="cartEmpty">
      <div class="cart-empty-art">🌸</div>
      <h3 class="cart-empty-title">Your Gift Bag is Empty</h3>
      <p class="cart-empty-text">Add a personalized handmade keepsake to brighten someone's day.</p>
      <a href="catalogue.html" class="btn btn-burgundy btn-sm" id="shopNowEmptyBtn">Explore Collections</a>
    </div>

    <!-- Cart Filled Content -->
    <div class="cart-body" id="cartBody">
      <ul class="cart-items-list" id="cartItemsList">
        <!-- Rendered dynamically -->
      </ul>

      <!-- Optional Recipient Details for Seamless WhatsApp Message -->
      <div class="cart-recipient-details">
        <h4 class="recipient-heading">Optional Delivery Details</h4>
        <div class="input-row">
          <input type="text" id="orderCustomerName" class="cart-text-input" placeholder="Your Name (e.g. Aditi)"
            aria-label="Your Name">
          <input type="text" id="orderDeliveryCity" class="cart-text-input" placeholder="Delivery City / Pincode"
            aria-label="Delivery City">
        </div>
      </div>
    </div>

    <!-- Cart Footer & Grand Total -->
    <div class="cart-footer" id="cartFooter">
      <div class="cart-total-row">
        <span class="total-label">Grand Total:</span>
        <span class="total-amount" id="cartGrandTotal">₹0</span>
      </div>
      <p class="total-note">✨ Standard shipping calculated &amp; finalized via WhatsApp</p>

      <!-- Primary Action: Proceed to WhatsApp Button -->
      <button type="button" class="btn btn-whatsapp proceed-whatsapp-btn" id="proceedWhatsAppBtn">
        <svg class="whatsapp-btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.954.563 3.778 1.536 5.325L2 22l4.808-1.503A9.957 9.957 0 0 0 12.004 22C17.528 22 22 17.52 22 12.004 22 6.48 17.528 2 12.004 2zm5.468 14.382c-.226.635-1.305 1.215-1.824 1.294-.468.071-1.061.1-1.71-.107-.393-.125-.898-.292-1.544-.57-2.716-1.171-4.49-3.905-4.625-4.086-.135-.181-1.097-1.46-1.097-2.784 0-1.324.693-1.975.94-2.245.247-.27.539-.337.719-.337.18 0 .36 0 .517.008.165.008.388-.063.607.463.225.54.765 1.868.832 2.003.067.135.112.293.022.473-.09.18-.135.292-.27.45-.135.157-.284.351-.405.472-.135.135-.276.282-.119.552.157.27.7 1.154 1.504 1.87 1.034.924 1.905 1.21 2.175 1.345.27.135.427.112.584-.068.158-.18.675-.788.855-1.058.18-.27.36-.225.607-.135.247.09 1.572.741 1.842.876.27.135.45.203.517.315.068.113.068.653-.158 1.288z" />
        </svg>
        <span>Proceed to WhatsApp</span>
      </button>
      <div style="text-align: center; margin-top: 10px;">
        <a href="help.html#faqs" style="font-family: var(--font-serif); font-weight: 500; font-size: 1rem; color: var(--burgundy); text-decoration: underline;">Questions? See Help &amp; FAQs</a>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector("#cartCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeCartModal);
  overlay.addEventListener("click", closeCartModal);

  const proceedBtn = modal.querySelector("#proceedWhatsAppBtn");
  if (proceedBtn) proceedBtn.addEventListener("click", proceedToWhatsAppCheckout);

  const shopNowBtn = modal.querySelector("#shopNowEmptyBtn");
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", () => {
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
    shopNowBtn.addEventListener("click", () => {
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
