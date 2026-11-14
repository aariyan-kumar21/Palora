/**
 * Palora Collections Catalogue Logic
 * Live filtering, multi-collection sync, dual-handle price range slider, sorting, dynamic counts, URL query params.
 */

(function() {
  // Filter State
  const filterState = {
    collections: new Set(),
    customizable: false,
    priceMin: 100,
    priceMax: 5000,
    sort: "newest"
  };

  const inr = new Intl.NumberFormat("en-IN");

  // DOM Elements
  const catalogueGrid = document.getElementById("catalogueGrid");
  const catalogueEmpty = document.getElementById("catalogueEmpty");
  const resultsCount = document.getElementById("resultsCount");
  const sortSelect = document.getElementById("sortSelect");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const emptyClearBtn = document.getElementById("emptyClearBtn");
  const categoryFilterList = document.getElementById("categoryFilterList");
  const customizableCheck = document.getElementById("customizableCheck");
  const customizableCount = document.getElementById("customizableCount");
  const pillsContainer = document.querySelector(".collection-pills");
  const priceMinInput = document.getElementById("priceMinInput");
  const priceMaxInput = document.getElementById("priceMaxInput");
  const priceMinLabel = document.getElementById("priceMinLabel");
  const priceMaxLabel = document.getElementById("priceMaxLabel");
  const rangeFill = document.getElementById("rangeFill");

  function initDynamicCountsAndCheckboxes() {
    if (!categoryFilterList || typeof COLLECTIONS === "undefined" || typeof PRODUCTS === "undefined") return;

    // Render category checkboxes with computed counts
    categoryFilterList.innerHTML = COLLECTIONS.map(col => {
      const count = PRODUCTS.filter(p => p.collection === col.slug).length;
      return `
        <label class="filter-row">
          <input type="checkbox" class="filter-checkbox" name="collection" value="${col.slug}">
          <span class="filter-row-label">
            ${col.label} <span class="filter-row-count">(${count})</span>
          </span>
        </label>
      `;
    }).join("");

    // Customizable count
    if (customizableCount) {
      const customCount = PRODUCTS.filter(p => p.customizable === true).length;
      customizableCount.textContent = `(${customCount})`;
    }

    // Attach checkbox events
    categoryFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener("change", () => {
        if (cb.checked) {
          filterState.collections.add(cb.value);
        } else {
          filterState.collections.delete(cb.value);
        }
        syncPillsUI();
        applyFilters();
      });
    });
  }

  function syncPillsUI() {
    if (!pillsContainer) return;
    const pills = pillsContainer.querySelectorAll(".pill");
    const selectedCount = filterState.collections.size;

    pills.forEach(pill => {
      const col = pill.getAttribute("data-collection");
      if (col === "all") {
        const isActive = selectedCount === 0;
        pill.classList.toggle("active", isActive);
        pill.setAttribute("aria-pressed", isActive ? "true" : "false");
      } else {
        const isActive = selectedCount === 1 && filterState.collections.has(col);
        pill.classList.toggle("active", isActive);
        pill.setAttribute("aria-pressed", isActive ? "true" : "false");
      }
    });
  }

  function syncCheckboxesUI() {
    if (!categoryFilterList) return;
    categoryFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = filterState.collections.has(cb.value);
    });
  }

  function updatePriceSliderUI(min, max) {
    if (!rangeFill || !priceMinLabel || !priceMaxLabel) return;
    const minPercent = ((min - 100) / (5000 - 100)) * 100;
    const maxPercent = ((max - 100) / (5000 - 100)) * 100;
    rangeFill.style.left = `${minPercent}%`;
    rangeFill.style.right = `${100 - maxPercent}%`;
    priceMinLabel.textContent = `₹${inr.format(min)}`;
    priceMaxLabel.textContent = max >= 5000 ? "₹5,000+" : `₹${inr.format(max)}`;
  }

  function isAnyFilterActive() {
    return (
      filterState.collections.size > 0 ||
      filterState.customizable ||
      filterState.priceMin > 100 ||
      filterState.priceMax < 5000
    );
  }

  function updateClearButtonVisibility() {
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = isAnyFilterActive() ? "inline-block" : "none";
    }
  }

  function applyFilters() {
    if (!catalogueGrid || typeof PRODUCTS === "undefined") return;

    let filtered = PRODUCTS.filter(product => {
      // Collection filter (OR within collections)
      if (filterState.collections.size > 0 && !filterState.collections.has(product.collection)) {
        return false;
      }
      // Customizable filter
      if (filterState.customizable && !product.customizable) {
        return false;
      }
      // Price filter
      if (product.price < filterState.priceMin) {
        return false;
      }
      if (filterState.priceMax < 5000 && product.price > filterState.priceMax) {
        return false;
      }
      return true;
    });

    // Sorting
    if (filterState.sort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filterState.sort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filterState.sort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // "newest" preserves the original order of PRODUCTS

    // Render results
    const count = filtered.length;
    if (resultsCount) {
      resultsCount.textContent = count === 1 ? "1 Product" : `${count} Products`;
    }

    if (count === 0) {
      catalogueGrid.innerHTML = "";
      if (catalogueEmpty) catalogueEmpty.style.display = "block";
    } else {
      if (catalogueEmpty) catalogueEmpty.style.display = "none";
      catalogueGrid.innerHTML = filtered.map((product, index) => {
        return renderProductCardHTML(product, index, "catalogue");
      }).join("");
      bindProductCardEvents(catalogueGrid);
    }

    updateClearButtonVisibility();
  }

  function resetAllFilters() {
    filterState.collections.clear();
    filterState.customizable = false;
    filterState.priceMin = 100;
    filterState.priceMax = 5000;
    filterState.sort = "newest";

    if (priceMinInput) priceMinInput.value = 100;
    if (priceMaxInput) priceMaxInput.value = 5000;
    updatePriceSliderUI(100, 5000);

    if (customizableCheck) customizableCheck.checked = false;
    if (sortSelect) sortSelect.value = "newest";

    syncCheckboxesUI();
    syncPillsUI();
    applyFilters();
  }

  function readUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const col = params.get("collection");
      if (col && typeof COLLECTIONS !== "undefined" && COLLECTIONS.some(c => c.slug === col)) {
        filterState.collections.add(col);
      }
      const cust = params.get("customizable");
      if (cust === "1") {
        filterState.customizable = true;
        if (customizableCheck) customizableCheck.checked = true;
      }
    } catch (e) {
      console.warn("Could not parse URL search params:", e);
    }
  }

  function init() {
    initDynamicCountsAndCheckboxes();
    readUrlParams();

    // Collection Pills
    if (pillsContainer) {
      pillsContainer.addEventListener("click", (e) => {
        const pill = e.target.closest(".pill");
        if (!pill) return;
        const col = pill.getAttribute("data-collection");
        if (col === "all") {
          filterState.collections.clear();
        } else {
          filterState.collections.clear();
          filterState.collections.add(col);
        }
        syncCheckboxesUI();
        syncPillsUI();
        applyFilters();
      });
    }

    // Customizable Checkbox
    if (customizableCheck) {
      customizableCheck.addEventListener("change", () => {
        filterState.customizable = customizableCheck.checked;
        applyFilters();
      });
    }

    // Price Range Inputs
    if (priceMinInput && priceMaxInput) {
      priceMinInput.addEventListener("input", () => {
        let min = parseInt(priceMinInput.value, 10);
        let max = parseInt(priceMaxInput.value, 10);
        if (min > max - 50) {
          min = max - 50;
          priceMinInput.value = min;
        }
        filterState.priceMin = min;
        updatePriceSliderUI(min, max);
        applyFilters();
      });

      priceMaxInput.addEventListener("input", () => {
        let min = parseInt(priceMinInput.value, 10);
        let max = parseInt(priceMaxInput.value, 10);
        if (max < min + 50) {
          max = min + 50;
          priceMaxInput.value = max;
        }
        filterState.priceMax = max;
        updatePriceSliderUI(min, max);
        applyFilters();
      });
    }

    // Sort Dropdown
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        filterState.sort = sortSelect.value;
        applyFilters();
      });
    }

    // Clear All Filters Buttons
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", resetAllFilters);
    }
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener("click", resetAllFilters);
    }

    syncCheckboxesUI();
    syncPillsUI();
    updatePriceSliderUI(filterState.priceMin, filterState.priceMax);
    applyFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
