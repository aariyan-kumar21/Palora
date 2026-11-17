/**
 * Palora Saved Items (Wishlist) Panel & Badge Sync
 */

(function () {
  const STORAGE_KEY = "palora_wishlist";

  function getSavedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveSavedIds(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  function ensureSavedDOM() {
    if (document.getElementById("savedPanel")) return;

    const overlay = document.createElement("div");
    overlay.className = "saved-overlay";
    overlay.id = "savedOverlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("hidden", "");
    overlay.setAttribute("inert", "");

    const panel = document.createElement("aside");
    panel.className = "saved-panel";
    panel.id = "savedPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "savedHeading");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("hidden", "");
    panel.setAttribute("inert", "");

    panel.innerHTML = `
      <div class="saved-header">
        <div class="saved-header-title">
          <h2 class="saved-heading" id="savedHeading">Saved items</h2>
          <span class="saved-count-chip" id="savedHeaderCount">0 items</span>
        </div>
        <button type="button" class="saved-close-btn" id="savedCloseBtn" aria-label="Close saved items">&times;</button>
      </div>
      <div class="saved-empty" id="savedEmpty">
        <div class="saved-empty-art">🌸</div>
        <p class="saved-empty-text">Nothing saved yet. Tap the heart on any product to keep it here.</p>
      </div>
      <div class="saved-body" id="savedBody" style="display: none;">
        <ul class="saved-items-list" id="savedItemsList"></ul>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    overlay.addEventListener("click", closeSavedPanel);
    panel.querySelector("#savedCloseBtn").addEventListener("click", closeSavedPanel);
  }

  function updateSavedUI() {
    ensureSavedDOM();

    const ids = getSavedIds();
    const count = ids.length;

    // Update navbar heart badge
    const badge = document.getElementById("savedBadge");
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = "flex";
      } else {
        badge.textContent = "0";
        badge.style.display = "none";
      }
    }

    // Update panel count chip
    const headerCount = document.getElementById("savedHeaderCount");
    if (headerCount) {
      headerCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    }

    const emptyEl = document.getElementById("savedEmpty");
    const bodyEl = document.getElementById("savedBody");
    const listEl = document.getElementById("savedItemsList");

    if (count === 0) {
      if (emptyEl) emptyEl.style.display = "flex";
      if (bodyEl) bodyEl.style.display = "none";
      if (listEl) listEl.innerHTML = "";
      return;
    }

    if (emptyEl) emptyEl.style.display = "none";
    if (bodyEl) bodyEl.style.display = "block";
    if (!listEl) return;

    const allProducts = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    const savedProducts = ids.map(id => allProducts.find(p => p.id === id)).filter(Boolean);

    listEl.innerHTML = savedProducts.map((p, idx) => {
      const tone = (idx % 5) + 1;
      const formattedPrice = typeof formatINR === "function" ? formatINR(p.price) : `₹${p.price.toLocaleString("en-IN")}`;
      return `
        <li class="saved-item" data-id="${p.id}">
          <div class="saved-item-thumb saved-item-thumb--tone-${tone}">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.remove()">
          </div>
          <div class="saved-item-info">
            <h3 class="saved-item-name">${p.name}</h3>
            <span class="saved-item-price">${formattedPrice}</span>
            <div class="saved-item-actions">
              <button type="button" class="saved-qv-btn" onclick="openSavedQuickView('${p.id}')">Quick view</button>
            </div>
          </div>
          <button type="button" class="saved-remove-btn" onclick="removeFromSaved('${p.id}')" aria-label="Remove ${p.name} from saved items">&times;</button>
        </li>
      `;
    }).join("");
  }

  let lastFocusedElement = null;

  function openSavedPanel() {
    ensureSavedDOM();
    updateSavedUI();

    lastFocusedElement = document.activeElement;
    const panel = document.getElementById("savedPanel");
    const overlay = document.getElementById("savedOverlay");

    if (overlay) {
      overlay.removeAttribute("hidden");
      overlay.removeAttribute("inert");
    }
    if (panel) {
      panel.removeAttribute("hidden");
      panel.removeAttribute("inert");
      void panel.offsetHeight;
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
    }
    if (overlay) {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    }

    document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("panelopen", { detail: { panel: "saved" } }));

    // Focus close button inside panel
    const closeBtn = document.getElementById("savedCloseBtn");
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeSavedPanel() {
    const panel = document.getElementById("savedPanel");
    const overlay = document.getElementById("savedOverlay");

    if (panel) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (overlay) {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }
    const onEnd = function () {
      if (panel && !panel.classList.contains("open")) {
        panel.setAttribute("hidden", "");
        panel.setAttribute("inert", "");
      }
      if (overlay && !overlay.classList.contains("open")) {
        overlay.setAttribute("hidden", "");
        overlay.setAttribute("inert", "");
      }
    };
    if (panel) {
      panel.addEventListener("transitionend", onEnd, { once: true });
      setTimeout(onEnd, 400);
    }

    document.body.style.overflow = "";
    document.dispatchEvent(new CustomEvent("panelclose", { detail: { panel: "saved" } }));

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  window.removeFromSaved = function (productId) {
    let ids = getSavedIds();
    ids = ids.filter(id => id !== productId);
    saveSavedIds(ids);

    // Update wish buttons on the current page
    document.querySelectorAll(`.wish[data-product-id="${productId}"]`).forEach(btn => {
      if (typeof updateWishlistButtonUI === "function") {
        updateWishlistButtonUI(btn, false, productId);
      }
    });

    document.dispatchEvent(new CustomEvent("wishlistchange", { detail: { productId, isWishlisted: false } }));
    updateSavedUI();
    if (typeof showToast === "function") showToast("Item removed from saved items");
  };

  window.openSavedQuickView = function (productId) {
    const product = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).find(p => p.id === productId);
    if (!product) return;
    closeSavedPanel();
    if (typeof openQuickViewModal === "function") {
      openQuickViewModal(product);
    }
  };

  window.openSavedPanel = openSavedPanel;
  window.closeSavedPanel = closeSavedPanel;

  // Reactivity listeners
  document.addEventListener("wishlistchange", updateSavedUI);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      updateSavedUI();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    ensureSavedDOM();
    updateSavedUI();

    const savedBtn = document.getElementById("savedBtn");
    if (savedBtn) {
      savedBtn.addEventListener("click", openSavedPanel);
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const panel = document.getElementById("savedPanel");
        if (panel && panel.classList.contains("open")) {
          closeSavedPanel();
        }
      }
    });
  });
})();
