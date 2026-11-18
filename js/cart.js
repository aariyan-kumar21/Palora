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

  if (badge) badge.textContent = totalCount;
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

  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item";
    const subtotal = item.price * item.quantity;

    li.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/hero.png'">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-top">
          <span class="cart-item-name">${item.name}</span>
          <button type="button" class="cart-remove-btn" onclick="removeCartItem('${item.cartItemId}')" aria-label="Remove ${item.name}">&times;</button>
        </div>
        <div class="cart-item-personalization">
          <span class="custom-badge-pill">Note</span>
          <span class="custom-note-preview">"${escapeHtml(item.note)}"</span>
        </div>
        <div class="cart-item-bottom">
          <div class="cart-qty-controls" role="group" aria-label="Adjust quantity">
            <button type="button" class="qty-btn" onclick="updateCartItemQuantity('${item.cartItemId}', -1)" aria-label="Decrease quantity">&minus;</button>
            <span class="qty-value">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="updateCartItemQuantity('${item.cartItemId}', 1)" aria-label="Increase quantity">&plus;</button>
          </div>
          <span class="cart-item-price">₹${subtotal.toLocaleString("en-IN")}</span>
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
          <path
            d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.196 8.196 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.03.8 1.21-2.95-.19-.3a8.156 8.156 0 0 1-1.25-4.32c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
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

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCartModal();
  });
});
