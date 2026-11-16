/**
 * Palora Collections Catalogue Logic (js/catalogue.js)
 * Features:
 * - 11 Category checkboxes multi-select filter (matching ANY ticked category via productsInCategory)
 * - Independent collection pills filter (top bar)
 * - Price range slider & Customizable badge filter combined with AND
 * - URL parameters support (?category=slug or ?category=a,b, ?collection=slug, ?customizable=1)
 * - Lining numerals and clean filter reset
 */

(function () {
  'use strict';

  // Filter State
  const filterState = {
    collection: null, // Pill selection: slug or null (all)
    categories: new Set(), // Sidebar checkboxes: category slugs
    customizable: false,
    priceMin: 100,
    priceMax: 5000,
    sort: 'newest'
  };

  const inr = new Intl.NumberFormat('en-IN');

  // DOM Elements
  const catalogueGrid = document.getElementById('catalogueGrid');
  const catalogueEmpty = document.getElementById('catalogueEmpty');
  const resultsCount = document.getElementById('resultsCount');
  const sortSelect = document.getElementById('sortSelect');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const emptyClearBtn = document.getElementById('emptyClearBtn');
  const categoryFilterList = document.getElementById('categoryFilterList');
  const customizableCheck = document.getElementById('customizableCheck');
  const customizableCount = document.getElementById('customizableCount');
  const pillsContainer = document.querySelector('.collection-pills');
  const priceMinInput = document.getElementById('priceMinInput');
  const priceMaxInput = document.getElementById('priceMaxInput');
  const priceMinLabel = document.getElementById('priceMinLabel');
  const priceMaxLabel = document.getElementById('priceMaxLabel');
  const rangeFill = document.getElementById('rangeFill');

  function initDynamicCountsAndCheckboxes() {
    if (!categoryFilterList) return;

    const categoriesList = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];

    // Render all 11 category checkboxes in the order of CATEGORIES
    categoryFilterList.innerHTML = categoriesList
      .map((cat) => {
        const count = typeof countInCategory === 'function' ? countInCategory(cat.slug) : 0;
        return `
          <label class="filter-row">
            <input type="checkbox" class="filter-checkbox" name="category" value="${cat.slug}">
            <span class="filter-row-label">
              ${cat.label} <span class="filter-row-count">(${count})</span>
            </span>
          </label>
        `;
      })
      .join('');

    // Customizable count
    if (customizableCount && typeof PRODUCTS !== 'undefined') {
      const customCount = PRODUCTS.filter((p) => p.customizable === true).length;
      customizableCount.textContent = `(${customCount})`;
    }

    // Attach checkbox event listeners
    categoryFilterList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          filterState.categories.add(cb.value);
        } else {
          filterState.categories.delete(cb.value);
        }
        applyFilters();
      });
    });
  }

  function syncPillsUI() {
    if (!pillsContainer) return;
    const pills = pillsContainer.querySelectorAll('.pill');
    const selectedCollection = filterState.collection;

    pills.forEach((pill) => {
      const col = pill.getAttribute('data-collection');
      if (col === 'all') {
        const isActive = !selectedCollection || selectedCollection === 'all';
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      } else {
        const isActive = selectedCollection === col;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
    });
  }

  function syncCheckboxesUI() {
    if (!categoryFilterList) return;
    categoryFilterList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = filterState.categories.has(cb.value);
    });
  }

  function updatePriceSliderUI(min, max) {
    if (!rangeFill || !priceMinLabel || !priceMaxLabel) return;
    const minPercent = ((min - 100) / (5000 - 100)) * 100;
    const maxPercent = ((max - 100) / (5000 - 100)) * 100;
    rangeFill.style.left = `${minPercent}%`;
    rangeFill.style.right = `${100 - maxPercent}%`;
    priceMinLabel.textContent = `₹${inr.format(min)}`;
    priceMaxLabel.textContent = max >= 5000 ? '₹5,000+' : `₹${inr.format(max)}`;
  }

  function isAnyFilterActive() {
    return (
      (filterState.collection && filterState.collection !== 'all') ||
      filterState.categories.size > 0 ||
      filterState.customizable ||
      filterState.priceMin > 100 ||
      filterState.priceMax < 5000
    );
  }

  function updateClearButtonVisibility() {
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = isAnyFilterActive() ? 'inline-block' : 'none';
    }
  }

  function applyFilters() {
    if (!catalogueGrid || typeof PRODUCTS === 'undefined') return;

    let filtered = PRODUCTS.filter((product) => {
      // 1. Collection filter (top pills)
      if (filterState.collection && filterState.collection !== 'all') {
        if (product.collection !== filterState.collection) {
          return false;
        }
      }

      // 2. Category filter (sidebar checkboxes) - OR within categories
      if (filterState.categories.size > 0) {
        const inAnyCategory = Array.from(filterState.categories).some((catSlug) => {
          if (typeof productsInCategory === 'function') {
            return productsInCategory(catSlug).some((p) => p.id === product.id);
          }
          const c = typeof CATEGORIES !== 'undefined' ? CATEGORIES.find((x) => x.slug === catSlug) : null;
          if (c && c.type === 'product') return product.category === catSlug;
          return (product.occasions || []).includes(catSlug);
        });
        if (!inAnyCategory) {
          return false;
        }
      }

      // 3. Customizable filter
      if (filterState.customizable && !product.customizable) {
        return false;
      }

      // 4. Price filter
      if (product.price < filterState.priceMin) {
        return false;
      }
      if (filterState.priceMax < 5000 && product.price > filterState.priceMax) {
        return false;
      }

      return true;
    });

    // Sorting
    if (filterState.sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filterState.sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filterState.sort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // "newest" preserves the original order of PRODUCTS

    // Render results count
    const count = filtered.length;
    if (resultsCount) {
      resultsCount.textContent = count === 1 ? '1 Product' : `${count} Products`;
    }

    // Render Grid / Empty State
    if (count === 0) {
      catalogueGrid.innerHTML = '';
      if (catalogueEmpty) catalogueEmpty.style.display = 'block';
    } else {
      if (catalogueEmpty) catalogueEmpty.style.display = 'none';
      catalogueGrid.innerHTML = filtered
        .map((product, index) => {
          if (typeof renderProductCardHTML === 'function') {
            return renderProductCardHTML(product, index, 'catalogue');
          }
          return `<article class="product-card product-card--catalogue" data-product-id="${product.id}">
            <div class="product-card__body">
              <h3 class="product-card__name">${product.name}</h3>
              <div class="product-card__price">₹${product.price}</div>
            </div>
          </article>`;
        })
        .join('');

      if (typeof bindProductCardEvents === 'function') {
        bindProductCardEvents(catalogueGrid);
      }
    }

    updateClearButtonVisibility();
  }

  function resetAllFilters() {
    filterState.collection = null;
    filterState.categories.clear();
    filterState.customizable = false;
    filterState.priceMin = 100;
    filterState.priceMax = 5000;
    filterState.sort = 'newest';

    if (priceMinInput) priceMinInput.value = 100;
    if (priceMaxInput) priceMaxInput.value = 5000;
    updatePriceSliderUI(100, 5000);

    if (customizableCheck) customizableCheck.checked = false;
    if (sortSelect) sortSelect.value = 'newest';

    syncCheckboxesUI();
    syncPillsUI();
    applyFilters();
  }

  function readUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);

      // 1. Category support (?category=birthdays or ?category=birthdays,keychains)
      const catParam = params.get('category');
      if (catParam) {
        const rawSlugs = catParam.split(',').map((s) => s.trim().toLowerCase());
        const validCategories = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
        rawSlugs.forEach((slug) => {
          if (validCategories.some((c) => c.slug === slug)) {
            filterState.categories.add(slug);
          }
        });
      }

      // 2. Collection support (?collection=slug)
      const colParam = params.get('collection');
      if (colParam && typeof COLLECTIONS !== 'undefined' && COLLECTIONS.some((c) => c.slug === colParam)) {
        filterState.collection = colParam;
      }

      // 3. Customizable support (?customizable=1)
      const custParam = params.get('customizable');
      if (custParam === '1') {
        filterState.customizable = true;
        if (customizableCheck) customizableCheck.checked = true;
      }
    } catch (e) {
      console.warn('Could not parse URL search params:', e);
    }
  }

  function init() {
    initDynamicCountsAndCheckboxes();
    readUrlParams();

    // Collection Pills: clicking "all" clears only the pill selection; clicking a collection sets it
    if (pillsContainer) {
      pillsContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        const col = pill.getAttribute('data-collection');
        if (col === 'all') {
          filterState.collection = null;
        } else {
          filterState.collection = col;
        }
        syncPillsUI();
        applyFilters();
      });
    }

    // Customizable Checkbox
    if (customizableCheck) {
      customizableCheck.addEventListener('change', () => {
        filterState.customizable = customizableCheck.checked;
        applyFilters();
      });
    }

    // Dual-Handle Price Range Inputs
    if (priceMinInput && priceMaxInput) {
      priceMinInput.addEventListener('input', () => {
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

      priceMaxInput.addEventListener('input', () => {
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
      sortSelect.addEventListener('change', () => {
        filterState.sort = sortSelect.value;
        applyFilters();
      });
    }

    // Clear All Filters Buttons
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', resetAllFilters);
    }
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener('click', resetAllFilters);
    }

    syncCheckboxesUI();
    syncPillsUI();
    updatePriceSliderUI(filterState.priceMin, filterState.priceMax);
    applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
