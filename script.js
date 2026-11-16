/**
 * Palora Handmade Gifting - Core Client-Side Logic
 * Pure Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Dynamic Viewport Height & Benefits Bar Measuring
 * - Local Client-Side Cart State Management
 * - Dedicated Item-Level Personalization Input Capture
 * - Dynamic Cart Modal with Quantity Modifiers & Live Grand Total
 * - Structured WhatsApp Checkout Pipeline Hand-off
 */

// -----------------------------------------------------------------------------
// 1. Dynamic Benefits Bar Measurement
// -----------------------------------------------------------------------------
function updateBenefitsHeight() {
  const benefits = document.getElementById("benefits");
  if (benefits) {
    document.documentElement.style.setProperty("--benefits-h", `${benefits.offsetHeight}px`);
  }
}
window.addEventListener("resize", updateBenefitsHeight);

// -----------------------------------------------------------------------------
// 2. Global State Management
// -----------------------------------------------------------------------------
let cart = [];
const STORAGE_KEY = "palora_cart_items";

// Hydrate cart from localStorage on initial load
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Could not read cart from localStorage:", err);
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn("Could not save cart to localStorage:", err);
  }
}

// -----------------------------------------------------------------------------
// 3. DOM Elements
// -----------------------------------------------------------------------------
const dom = {
  header: document.getElementById("header"),
  cartBadge: document.getElementById("cartBadge"),
  cartBtn: document.getElementById("cartBtn"),
  cartModal: document.getElementById("cartModal"),
  cartOverlay: document.getElementById("cartOverlay"),
  cartCloseBtn: document.getElementById("cartCloseBtn"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartBody: document.getElementById("cartBody"),
  cartItemsList: document.getElementById("cartItemsList"),
  cartHeaderCount: document.getElementById("cartHeaderCount"),
  cartGrandTotal: document.getElementById("cartGrandTotal"),
  proceedWhatsAppBtn: document.getElementById("proceedWhatsAppBtn"),
  shopNowEmptyBtn: document.getElementById("shopNowEmptyBtn"),
  orderCustomerName: document.getElementById("orderCustomerName"),
  orderDeliveryCity: document.getElementById("orderDeliveryCity"),
  mobileToggleBtn: document.getElementById("mobileToggleBtn"),
  closeDrawerBtn: document.getElementById("closeDrawerBtn"),
  mobileDrawer: document.getElementById("mobileDrawer"),
  mobileDrawerOverlay: document.getElementById("mobileDrawerOverlay"),
  toast: document.getElementById("toast"),
  searchBtn: document.getElementById("searchBtn")
};

// -----------------------------------------------------------------------------
// 4. Cart Management & Logic
// -----------------------------------------------------------------------------

/**
 * Global method to add any customized item (from QuickView or Product Card) into the cart
 */
window.addCustomItemToCart = function(product, quantity = 1, note = "") {
  const customNote = (note && note.trim()) ? note.trim() : "Standard (No custom text requested)";
  
  // Check if an item with identical product ID AND identical personalization already exists
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
  triggerBadgeBump();
  showToast("Added to cart ✨");
};

// Fallback custom event listener
document.addEventListener("palora:addtocart", (e) => {
  if (e.detail && e.detail.product) {
    window.addCustomItemToCart(e.detail.product, e.detail.quantity || 1, e.detail.note || "");
  }
});

/**
 * Captures product details and specific personalization input text
 */
function handleAddToCart(productId) {
  const product = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).find(p => p.id === productId);
  if (!product) return;

  const noteInput = document.getElementById(`custom-note-${productId}`);
  const customNote = noteInput ? noteInput.value.trim() : "";

  window.addCustomItemToCart(product, 1, customNote);

  // Clear input for fresh future additions
  if (noteInput) {
    noteInput.value = "";
  }
}

/**
 * Modifies the quantity of an item in the cart
 */
function updateCartItemQuantity(cartItemId, delta) {
  const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
    showToast("Item removed from gift bag");
  }

  saveCartToStorage();
  updateCartUI();
}

/**
 * Removes an entire item row from the cart
 */
function removeCartItem(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCartToStorage();
  updateCartUI();
  showToast("Item removed from gift bag");
}

/**
 * Synchronizes DOM state with current cart array
 */
function updateCartUI() {
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update Badge in header
  if (dom.cartBadge) {
    dom.cartBadge.textContent = totalItemCount;
  }

  // Update Cart Header Count
  if (dom.cartHeaderCount) {
    dom.cartHeaderCount.textContent = `${totalItemCount} ${totalItemCount === 1 ? "item" : "items"}`;
  }

  // Update Grand Total in Cart Footer
  if (dom.cartGrandTotal) {
    dom.cartGrandTotal.textContent = `₹${grandTotalAmount.toLocaleString("en-IN")}`;
  }

  // Toggle Empty State vs Populated Cart List
  if (cart.length === 0) {
    if (dom.cartEmpty) dom.cartEmpty.style.display = "flex";
    if (dom.cartBody) dom.cartBody.style.display = "none";
    if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.disabled = true;
    if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.style.opacity = "0.5";
  } else {
    if (dom.cartEmpty) dom.cartEmpty.style.display = "none";
    if (dom.cartBody) dom.cartBody.style.display = "flex";
    if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.disabled = false;
    if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.style.opacity = "1";

    renderCartItemsList();
  }
}

/**
 * Renders HTML for each individual item inside the cart drawer
 */
function renderCartItemsList() {
  if (!dom.cartItemsList) return;
  dom.cartItemsList.innerHTML = "";

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
          <button class="cart-remove-btn" onclick="removeCartItem('${item.cartItemId}')" aria-label="Remove ${item.name}">&times;</button>
        </div>
        <div class="cart-item-personalization">
          <span class="custom-badge-pill">Note</span>
          <span class="custom-note-preview">"${escapeHtml(item.note)}"</span>
        </div>
        <div class="cart-item-bottom">
          <div class="cart-qty-controls" role="group" aria-label="Adjust quantity">
            <button class="qty-btn" onclick="updateCartItemQuantity('${item.cartItemId}', -1)" aria-label="Decrease quantity">&minus;</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartItemQuantity('${item.cartItemId}', 1)" aria-label="Increase quantity">&plus;</button>
          </div>
          <span class="cart-item-price">₹${subtotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    `;

    dom.cartItemsList.appendChild(li);
  });
}

// -----------------------------------------------------------------------------
// 5. WhatsApp Checkout Pipeline Hand-Off
// -----------------------------------------------------------------------------

/**
 * Constructs a structured WhatsApp order breakdown including personalization,
 * individual price, and grand total, then redirects to the WhatsApp API.
 */
function proceedToWhatsAppCheckout() {
  if (cart.length === 0) return;

  const customerName = dom.orderCustomerName && dom.orderCustomerName.value.trim() 
    ? dom.orderCustomerName.value.trim() 
    : "Gifting Guest";

  const deliveryCity = dom.orderDeliveryCity && dom.orderDeliveryCity.value.trim() 
    ? dom.orderDeliveryCity.value.trim() 
    : "Not specified";

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
    `_(Excluding shipping; verified via chat)_`
  );

  messageLines.push("");
  messageLines.push("✨ _Hello Palora! I would like to place this handmade order. Please confirm availability and share payment details._");

  const fullMessage = messageLines.join("\n");
  const encodedMessage = encodeURIComponent(fullMessage);
  const waNumber = typeof WHATSAPP_NUMBER !== "undefined" ? WHATSAPP_NUMBER : "919876543210";
  const targetWhatsAppUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

  window.open(targetWhatsAppUrl, "_blank");
}

// -----------------------------------------------------------------------------
// 6. UI Controls, Drawers & Modals
// -----------------------------------------------------------------------------

function openCartModal() {
  if (dom.cartModal) dom.cartModal.classList.add("open");
  if (dom.cartOverlay) dom.cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartModal() {
  if (dom.cartModal) dom.cartModal.classList.remove("open");
  if (dom.cartOverlay) dom.cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function openMobileDrawer() {
  if (dom.mobileDrawer) dom.mobileDrawer.classList.add("open");
  if (dom.mobileDrawerOverlay) dom.mobileDrawerOverlay.classList.add("open");
  if (dom.mobileToggleBtn) dom.mobileToggleBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMobileDrawer() {
  if (dom.mobileDrawer) dom.mobileDrawer.classList.remove("open");
  if (dom.mobileDrawerOverlay) dom.mobileDrawerOverlay.classList.remove("open");
  if (dom.mobileToggleBtn) dom.mobileToggleBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function triggerBadgeBump() {
  if (!dom.cartBadge) return;
  dom.cartBadge.classList.add("bump");
  setTimeout(() => dom.cartBadge.classList.remove("bump"), 300);
}

let toastTimer = null;
function showToast(message) {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.classList.remove("show");
  }, 2500);
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

// Expose addToCart globally for inline onclick
window.handleAddToCart = handleAddToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;

// -----------------------------------------------------------------------------
// 7. Event Listeners & Initialization
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Measure benefits height to ensure hero + value bar fill the screen exactly
  updateBenefitsHeight();

  // Load existing cart
  loadCartFromStorage();

  // Render initial cart state
  updateCartUI();

  // Cart modal event listeners
  if (dom.cartBtn) dom.cartBtn.addEventListener("click", openCartModal);
  if (dom.cartCloseBtn) dom.cartCloseBtn.addEventListener("click", closeCartModal);
  if (dom.cartOverlay) dom.cartOverlay.addEventListener("click", closeCartModal);
  if (dom.shopNowEmptyBtn) {
    dom.shopNowEmptyBtn.addEventListener("click", () => {
      closeCartModal();
      window.location.href = "catalogue.html";
    });
  }

  // WhatsApp Checkout button
  if (dom.proceedWhatsAppBtn) {
    dom.proceedWhatsAppBtn.addEventListener("click", proceedToWhatsAppCheckout);
  }

  // Mobile drawer navigation listeners
  if (dom.mobileToggleBtn) dom.mobileToggleBtn.addEventListener("click", openMobileDrawer);
  if (dom.closeDrawerBtn) dom.closeDrawerBtn.addEventListener("click", closeMobileDrawer);
  if (dom.mobileDrawerOverlay) dom.mobileDrawerOverlay.addEventListener("click", closeMobileDrawer);

  // Close mobile drawer when clicking a link
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", closeMobileDrawer);
  });

  // Sticky header scroll background switch (> 40px)
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      dom.header.classList.add("scrolled");
    } else {
      dom.header.classList.remove("scrolled");
    }
  }, { passive: true });

  // Search button takes to catalogue page
  if (dom.searchBtn) {
    dom.searchBtn.addEventListener("click", () => {
      window.location.href = "catalogue.html";
    });
  }

  // Keyboard navigation: Close modal on Esc
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartModal();
      closeMobileDrawer();
    }
  });
});
