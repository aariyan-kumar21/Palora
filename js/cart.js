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

function openCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartOverlay");
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
  if (overlay) {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }
  document.body.style.overflow = "hidden";
  document.dispatchEvent(new CustomEvent("panelopen", { detail: { panel: "cart" } }));
}

function closeCartModal() {
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
