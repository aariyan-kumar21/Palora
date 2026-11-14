/**
 * Palora Handmade Gifting - Core Client-Side Logic
 * Pure Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Local Client-Side Cart State Management
 * - Dynamic Product Catalog & Responsive Filtering
 * - Dedicated Item-Level Personalization Input Capture
 * - Dynamic Cart Modal with Quantity Modifiers & Live Grand Total
 * - Structured WhatsApp Checkout Pipeline Hand-off
 */

// -----------------------------------------------------------------------------
// 1. Product Catalog Data
// -----------------------------------------------------------------------------
const GALLERY_PRODUCTS = [
  {
    id: "crochet-rose-bouquet",
    name: "Handcrafted Crochet Rose & Tulip Bouquet",
    category: "crochet",
    occasion: "anniversaries",
    price: 899,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    badge: "Bestseller",
    description: "Everlasting hand-knitted botanical flowers with soft woolen yarn and wrapped in vintage tissue.",
    placeholderNote: "e.g., Red roses with white tulips, gift tag: 'Happy 5th Anniversary!'"
  },
  {
    id: "resin-floral-coasters",
    name: "Custom Gold Flake & Botanical Resin Coasters",
    category: "resin",
    occasion: "festivals",
    price: 649,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
    badge: "Hand-poured",
    description: "Set of 2 crystal clear epoxy coasters embedded with real pressed petals and 24k gold leaf flakes.",
    placeholderNote: "e.g., Initial 'A & R', gold rim edges, Diwali wishes"
  },
  {
    id: "resin-letter-keychain",
    name: "Personalized Initial Resin Keychain",
    category: "resin",
    occasion: "birthdays",
    price: 349,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    badge: "Personalized",
    description: "Artisan resin letter charm with matching pastel suede tassel and gold hardware clip.",
    placeholderNote: "e.g., Letter 'M', blush pink flowers, name: 'Meera'"
  },
  {
    id: "wax-sealed-letter",
    name: "Wax-Sealed Handwritten Calligraphy Letter",
    category: "frames",
    occasion: "thankyou",
    price: 449,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
    badge: "Artisanal",
    description: "Custom message handwritten in vintage fountain ink on archival handmade cotton deckle-edge paper.",
    placeholderNote: "e.g., Note: 'Thank you for always believing in me, Mom.' Burgundy seal."
  },
  {
    id: "dried-floral-dome",
    name: "Preserved Lavender & Rose Glass Dome",
    category: "floral",
    occasion: "anniversaries",
    price: 1499,
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    badge: "Everlasting",
    description: "Natural dried lavender sprigs, hydrangea and mini roses encased in a wooden base glass bell jar.",
    placeholderNote: "e.g., Engraving on wooden base: 'Forever & Always, Rahul & Diya'"
  },
  {
    id: "thoughtful-pink-hamper",
    name: "“Thoughtful Pink” Luxe Gift Hamper",
    category: "hampers",
    occasion: "birthdays",
    price: 2499,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    badge: "Signature Box",
    description: "Curated gift box with scented soy candle, crochet flower, wax seal card, and artisan chocolate.",
    placeholderNote: "e.g., Birthday message for Sarah + Lavender scented candle preference"
  },
  {
    id: "crochet-daisy-charm",
    name: "Pastel Crochet Daisy Charm & Coaster Duo",
    category: "crochet",
    occasion: "justbecause",
    price: 499,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    badge: "Cute & Cozy",
    description: "Delightful crochet floral mug rug coaster paired with a mini daisy backpack or keychain charm.",
    placeholderNote: "e.g., Pastel yellow and lilac color combo"
  },
  {
    id: "custom-polaroid-frame",
    name: "Custom Polaroid Clip Memory Keepsake Frame",
    category: "frames",
    occasion: "birthdays",
    price: 799,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    badge: "Custom Photo",
    description: "Solid pine wood frame with mini wooden clips, fairy twinkle lights, and personalized date plaque.",
    placeholderNote: "e.g., Date: 12.04.2024, Bottom text: 'Best memories together'"
  }
];

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
  productsGrid: document.getElementById("productsGrid"),
  categoryTabs: document.querySelectorAll(".tab-btn"),
  mobileToggleBtn: document.getElementById("mobileToggleBtn"),
  closeDrawerBtn: document.getElementById("closeDrawerBtn"),
  mobileDrawer: document.getElementById("mobileDrawer"),
  mobileDrawerOverlay: document.getElementById("mobileDrawerOverlay"),
  toast: document.getElementById("toast"),
  searchBtn: document.getElementById("searchBtn")
};

// -----------------------------------------------------------------------------
// 4. Product Catalog Rendering
// -----------------------------------------------------------------------------
function renderProducts(filterCategory = "all") {
  if (!dom.productsGrid) return;

  const filteredProducts = filterCategory === "all"
    ? GALLERY_PRODUCTS
    : GALLERY_PRODUCTS.filter(p => p.category === filterCategory || p.occasion === filterCategory);

  dom.productsGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    dom.productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px;">
        <p style="font-size: 1.1rem; color: var(--color-text-muted);">No products found in this category.</p>
      </div>
    `;
    return;
  }

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("data-id", product.id);

    card.innerHTML = `
      <div class="product-img-box">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge">${product.badge}</span>
      </div>
      <div class="product-info">
        <div class="product-title-row">
          <h3 class="product-title">${product.name}</h3>
          <span class="product-price">₹${product.price.toLocaleString("en-IN")}</span>
        </div>
        <p class="product-desc">${product.description}</p>
        
        <!-- CRITICAL REQUIREMENT: Dedicated Input field for Personalization -->
        <div class="personalization-box">
          <label for="custom-note-${product.id}" class="personalization-label">
            <span class="personalization-label-icon">✍️</span>
            <span>Add custom note, name, or color:</span>
          </label>
          <input 
            type="text" 
            id="custom-note-${product.id}" 
            class="personalization-input" 
            placeholder="${product.placeholderNote}"
            autocomplete="off"
            aria-label="Personalization for ${product.name}"
          >
        </div>

        <!-- Add to Cart Action -->
        <button 
          class="add-to-cart-btn" 
          onclick="handleAddToCart('${product.id}')"
          aria-label="Add ${product.name} to cart"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    `;

    dom.productsGrid.appendChild(card);
  });
}

// -----------------------------------------------------------------------------
// 5. Cart Management & Logic
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
  showToast("Added to cart");
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
  const product = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).find(p => p.id === productId)
    || GALLERY_PRODUCTS.find(p => p.id === productId);
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
  }

  saveCartToStorage();
  updateCartUI();
}

/**
 * Removes an item directly from the cart
 */
function removeCartItem(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCartToStorage();
  updateCartUI();
  showToast("Item removed from gift bag.");
}

/**
 * Dynamically re-renders the Cart Modal UI, recalculating grand total
 */
function updateCartUI() {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update Header Badges
  if (dom.cartBadge) {
    dom.cartBadge.textContent = totalItemsCount;
  }
  if (dom.cartHeaderCount) {
    dom.cartHeaderCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'}`;
  }

  // Update Grand Total Display
  if (dom.cartGrandTotal) {
    dom.cartGrandTotal.textContent = `₹${grandTotal.toLocaleString("en-IN")}`;
  }

  // Empty state handling
  if (cart.length === 0) {
    if (dom.cartEmpty) dom.cartEmpty.classList.add("active");
    if (dom.cartBody) dom.cartBody.style.display = "none";
    if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.disabled = true;
    if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.style.opacity = "0.5";
    return;
  }

  if (dom.cartEmpty) dom.cartEmpty.classList.remove("active");
  if (dom.cartBody) dom.cartBody.style.display = "flex";
  if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.disabled = false;
  if (dom.proceedWhatsAppBtn) dom.proceedWhatsAppBtn.style.opacity = "1";

  // Render items list
  if (dom.cartItemsList) {
    dom.cartItemsList.innerHTML = "";

    cart.forEach(item => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-details">
          <div class="cart-item-header">
            <h4 class="cart-item-name">${item.name}</h4>
            <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString("en-IN")}</span>
          </div>

          <!-- Display Item's Specific Custom Personalization Note -->
          <div class="cart-item-note">
            <strong>Custom Note:</strong> ${escapeHtml(item.note)}
          </div>

          <div class="cart-item-controls">
            <div class="qty-control-box">
              <button 
                class="qty-btn" 
                onclick="updateCartItemQuantity('${item.cartItemId}', -1)"
                aria-label="Decrease quantity of ${item.name}"
              >&minus;</button>
              <span class="qty-count">${item.quantity}</span>
              <button 
                class="qty-btn" 
                onclick="updateCartItemQuantity('${item.cartItemId}', 1)"
                aria-label="Increase quantity of ${item.name}"
              >&plus;</button>
            </div>
            
            <button 
              class="cart-item-delete" 
              onclick="removeCartItem('${item.cartItemId}')"
              aria-label="Remove ${item.name} from cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      dom.cartItemsList.appendChild(li);
    });
  }
}

// -----------------------------------------------------------------------------
// 6. WhatsApp Checkout Pipeline Hand-Off
// -----------------------------------------------------------------------------

/**
 * Formats a clean, multi-line string containing each product, its specific custom note,
 * individual price, and grand total, then redirects to the WhatsApp API.
 */
function proceedToWhatsAppCheckout() {
  if (cart.length === 0) {
    showToast("Your gift bag is empty! Add an item first.");
    return;
  }

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const customerName = dom.orderCustomerName ? dom.orderCustomerName.value.trim() : "";
  const deliveryCity = dom.orderDeliveryCity ? dom.orderDeliveryCity.value.trim() : "";

  // Build the structured multi-line message
  let messageLines = [];
  messageLines.push("🛍️ *NEW ORDER - PALORA HANDMADE GIFTS*");
  messageLines.push("──────────────────────────");
  messageLines.push("*Order Items:*");

  cart.forEach((item, index) => {
    messageLines.push(
      `${index + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
    );
    messageLines.push(`   📝 *Personalization:* "${item.note}"`);
  });

  messageLines.push("──────────────────────────");
  messageLines.push(`*💰 Grand Total: ₹${grandTotal.toLocaleString("en-IN")}*`);

  if (customerName || deliveryCity) {
    messageLines.push("");
    messageLines.push("*Customer Details:*");
    if (customerName) messageLines.push(`• Name: ${customerName}`);
    if (deliveryCity) messageLines.push(`• Delivery City / Pin: ${deliveryCity}`);
  }

  messageLines.push("");
  messageLines.push("✨ _Hello Palora! I would like to place this handmade order. Please confirm availability and share payment details._");

  const fullMessage = messageLines.join("\n");

  // URL-encode the formatted string
  const encodedMessage = encodeURIComponent(fullMessage);
  const targetWhatsAppUrl = `https://wa.me/919876543210?text=${encodedMessage}`;

  // Trigger the hand-off in a new tab/app window
  window.open(targetWhatsAppUrl, "_blank");
}

// -----------------------------------------------------------------------------
// 7. UI Controls, Drawers & Modals
// -----------------------------------------------------------------------------

function openCartModal() {
  if (dom.cartModal) dom.cartModal.classList.add("open");
  if (dom.cartOverlay) dom.cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden"; // Prevent body scroll while modal is active
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

// Helper to filter from Occasion Cards or Category buttons
window.filterCategory = function (categoryOrOccasion) {
  // Update Tab buttons visually
  dom.categoryTabs.forEach(tab => {
    if (tab.getAttribute("data-filter") === categoryOrOccasion) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  renderProducts(categoryOrOccasion);

  // Smooth scroll to products section
  const section = document.getElementById("products");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

// Expose addToCart globally for inline onclick
window.handleAddToCart = handleAddToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;

// -----------------------------------------------------------------------------
// 8. Event Listeners & Initialization
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Load existing cart
  loadCartFromStorage();

  // Render initial products
  renderProducts("all");

  // Render initial cart state
  updateCartUI();

  // Cart modal event listeners
  if (dom.cartBtn) dom.cartBtn.addEventListener("click", openCartModal);
  if (dom.cartCloseBtn) dom.cartCloseBtn.addEventListener("click", closeCartModal);
  if (dom.cartOverlay) dom.cartOverlay.addEventListener("click", closeCartModal);
  if (dom.shopNowEmptyBtn) {
    dom.shopNowEmptyBtn.addEventListener("click", () => {
      closeCartModal();
      const productsSection = document.getElementById("products");
      if (productsSection) productsSection.scrollIntoView({ behavior: "smooth" });
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
  document.querySelectorAll(".mobile-link, .drawer-cat-link").forEach(link => {
    link.addEventListener("click", closeMobileDrawer);
  });

  // Category filter tabs click
  dom.categoryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      dom.categoryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.getAttribute("data-filter");
      renderProducts(filter);
    });
  });

  // Sticky header scroll background switch (> 40px)
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      dom.header.classList.add("scrolled");
    } else {
      dom.header.classList.remove("scrolled");
    }
  }, { passive: true });

  // Search button quick visual feedback
  if (dom.searchBtn) {
    dom.searchBtn.addEventListener("click", () => {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
        showToast("Browse our complete collection below 🌸");
      }
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
