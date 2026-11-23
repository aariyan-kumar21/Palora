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
  const pillsScrollPrev = document.getElementById('pillsScrollPrev');
  const pillsScrollNext = document.getElementById('pillsScrollNext');
  const customSortWrap = document.getElementById('customSortWrap');
  const customSortTrigger = document.getElementById('customSortTrigger');
  const customSortCurrent = document.getElementById('customSortCurrent');
  const customSortDropdown = document.getElementById('customSortDropdown');
  const priceMinInput = document.getElementById('priceMinInput');
  const priceMaxInput = document.getElementById('priceMaxInput');
  const priceMinLabel = document.getElementById('priceMinLabel');
  const priceMaxLabel = document.getElementById('priceMaxLabel');
  const rangeFill = document.getElementById('rangeFill');

  // Custom sort labels map
  const sortLabels = {
    'newest': 'Newest',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'name-asc': 'Name: A to Z'
  };

  // Pill gestures and drag state
  let isDraggingPills = false;
  let pillsStartX = 0;
  let pillsStartScrollLeft = 0;
  let hasDraggedPills = false;

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
        syncPillsUI();
        applyFilters();
      });
    });
  }

  function syncPillsUI() {
    if (!pillsContainer) return;
    const pills = pillsContainer.querySelectorAll('.pill');
    const selectedCats = Array.from(filterState.categories);
    const selectedCol = filterState.collection;
    let firstActivePill = null;

    pills.forEach((pill) => {
      const cat = pill.getAttribute('data-category');
      const col = pill.getAttribute('data-collection');
      let isActive = false;

      if (cat === 'all' || col === 'all') {
        isActive = selectedCats.length === 0 && (!selectedCol || selectedCol === 'all');
      } else if (cat) {
        isActive = selectedCats.includes(cat);
      } else if (col) {
        isActive = selectedCol === col;
      }

      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (isActive && cat !== 'all' && col !== 'all' && !firstActivePill) {
        firstActivePill = pill;
      }
    });

    if (firstActivePill && !isDraggingPills) {
      firstActivePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
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

  function updatePillArrows() {
    if (!pillsContainer || !pillsScrollPrev || !pillsScrollNext) return;
    const scrollLeft = pillsContainer.scrollLeft;
    const maxScroll = pillsContainer.scrollWidth - pillsContainer.clientWidth;

    if (maxScroll <= 4) {
      pillsScrollPrev.classList.add('is-hidden');
      pillsScrollNext.classList.add('is-hidden');
      return;
    }

    if (scrollLeft <= 4) {
      pillsScrollPrev.classList.add('is-hidden');
    } else {
      pillsScrollPrev.classList.remove('is-hidden');
    }

    if (scrollLeft >= maxScroll - 4) {
      pillsScrollNext.classList.add('is-hidden');
    } else {
      pillsScrollNext.classList.remove('is-hidden');
    }
  }

  function initPillsGestureScrolling() {
    if (!pillsContainer) return;

    pillsContainer.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isDraggingPills = true;
      hasDraggedPills = false;
      pillsStartX = e.clientX;
      pillsStartScrollLeft = pillsContainer.scrollLeft;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDraggingPills) return;
      const dx = e.clientX - pillsStartX;
      if (Math.abs(dx) > 6) {
        hasDraggedPills = true;
        pillsContainer.classList.add('is-dragging');
      }
      pillsContainer.scrollLeft = pillsStartScrollLeft - dx;
    });

    const endPillDrag = () => {
      if (!isDraggingPills) return;
      isDraggingPills = false;
      pillsContainer.classList.remove('is-dragging');
      setTimeout(() => {
        hasDraggedPills = false;
      }, 50);
      updatePillArrows();
    };

    window.addEventListener('pointerup', endPillDrag);
    window.addEventListener('pointercancel', endPillDrag);

    // Mouse wheel horizontal scrolling
    pillsContainer.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
          pillsContainer.scrollLeft += e.deltaY;
          e.preventDefault();
          updatePillArrows();
        }
      },
      { passive: false }
    );

    // Arrow buttons
    if (pillsScrollPrev) {
      pillsScrollPrev.addEventListener('click', () => {
        pillsContainer.scrollBy({ left: -280, behavior: 'smooth' });
        setTimeout(updatePillArrows, 320);
      });
    }

    if (pillsScrollNext) {
      pillsScrollNext.addEventListener('click', () => {
        pillsContainer.scrollBy({ left: 280, behavior: 'smooth' });
        setTimeout(updatePillArrows, 320);
      });
    }

    pillsContainer.addEventListener('scroll', updatePillArrows, { passive: true });
    window.addEventListener('resize', updatePillArrows);
    setTimeout(updatePillArrows, 100);
  }

  function updateCustomSortUI(value) {
    if (customSortCurrent) {
      customSortCurrent.textContent = sortLabels[value] || 'Newest';
    }
    if (customSortDropdown) {
      const items = customSortDropdown.querySelectorAll('.custom-sort-item');
      items.forEach((item) => {
        const isMatch = item.getAttribute('data-value') === value;
        item.classList.toggle('is-selected', isMatch);
        item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
    }
  }

  function openCustomSort() {
    if (!customSortDropdown || !customSortTrigger) return;
    customSortDropdown.hidden = false;
    requestAnimationFrame(() => {
      customSortDropdown.classList.add('is-open');
      customSortTrigger.setAttribute('aria-expanded', 'true');
    });
  }

  function closeCustomSort() {
    if (!customSortDropdown || !customSortTrigger) return;
    customSortDropdown.classList.remove('is-open');
    customSortTrigger.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!customSortDropdown.classList.contains('is-open')) {
        customSortDropdown.hidden = true;
      }
    }, 180);
  }

  function initCustomSortDropdown() {
    if (!customSortTrigger || !customSortDropdown) return;

    customSortTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = customSortDropdown.classList.contains('is-open');
      if (isOpen) {
        closeCustomSort();
      } else {
        openCustomSort();
      }
    });

    const items = customSortDropdown.querySelectorAll('.custom-sort-item');
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = item.getAttribute('data-value');
        filterState.sort = val;
        if (sortSelect) sortSelect.value = val;
        updateCustomSortUI(val);
        closeCustomSort();
        applyFilters();
        customSortTrigger.focus();
      });
    });

    document.addEventListener('click', (e) => {
      if (customSortDropdown.classList.contains('is-open') && !customSortWrap?.contains(e.target)) {
        closeCustomSort();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && customSortDropdown.classList.contains('is-open')) {
        closeCustomSort();
        customSortTrigger.focus();
      }
    });
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
    updateCustomSortUI('newest');

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
    initPillsGestureScrolling();
    initCustomSortDropdown();

    // Category / Collection Pills click handling
    if (pillsContainer) {
      pillsContainer.addEventListener('click', (e) => {
        if (hasDraggedPills) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const pill = e.target.closest('.pill');
        if (!pill) return;

        const cat = pill.getAttribute('data-category');
        const col = pill.getAttribute('data-collection');

        if (cat === 'all' || col === 'all') {
          filterState.categories.clear();
          filterState.collection = null;
        } else if (cat) {
          filterState.categories.clear();
          filterState.categories.add(cat);
          filterState.collection = null;
        } else if (col) {
          filterState.collection = col;
          filterState.categories.clear();
        }

        syncCheckboxesUI();
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

    // Sort Dropdown (hidden select change listener as sync fallback)
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        filterState.sort = sortSelect.value;
        updateCustomSortUI(sortSelect.value);
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
