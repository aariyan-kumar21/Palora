import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCTS, countInCategory, productsInCategory } from '../../data/products';
import { CATEGORIES } from '../../data/categories';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { AnimatedContent } from '../../components/AnimatedContent/AnimatedContent';
import { Footer } from '../../components/Footer/Footer';
import { Icon } from '../../components/Icon/Icon';
import { usePageMeta } from '../../hooks/usePageMeta';
import '../../styles/catalogue.css';

const inr = new Intl.NumberFormat('en-IN');

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_LABELS: Record<SortOption, string> = {
  'newest': 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc': 'Name: A to Z'
};

const PILL_ICONS: Record<string, string> = {
  'keychains': 'key',
  'home-decor': 'house',
  'birthdays': 'cake',
  'anniversaries': 'hearts',
  'just-because': 'heart',
  'bouquets-flowers': 'flower',
  'crochet-items': 'yarn',
  'designed-frames': 'frame',
  'letters-cards': 'mail',
  'hampers': 'gift',
  'festivals': 'lotus'
};

export const CollectionsPage: React.FC = () => {
  usePageMeta(
    'Collections | Palora Handcrafted Gifts',
    'Explore our curated collection of handcrafted gifts: crochet crafts, resin keepsakes, floral decor, frames, and luxe hampers.',
    'catalogue'
  );

  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL or defaults
  const [selectedCollection, setSelectedCollection] = useState<string | null>(() => {
    return searchParams.get('collection');
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      const list = catParam.split(',').filter(c => CATEGORIES.some(cat => cat.slug === c));
      return new Set(list);
    }
    return new Set<string>();
  });

  const [customizableOnly, setCustomizableOnly] = useState<boolean>(() => {
    return searchParams.get('customizable') === '1';
  });

  const [priceMin, setPriceMin] = useState(100);
  const [priceMax, setPriceMax] = useState(5000);
  const [sort, setSort] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sortWrapRef = useRef<HTMLDivElement>(null);
  const filtersTriggerRef = useRef<HTMLButtonElement>(null);
  const filtersAsideRef = useRef<HTMLElement>(null);

  const closeMobileFilters = useCallback(() => {
    setMobileFiltersOpen(false);
    requestAnimationFrame(() => filtersTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const asideEl = filtersAsideRef.current;
    const focusFirst = setTimeout(() => {
      const first = asideEl?.querySelector<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    }, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMobileFilters();
        return;
      }
      if (e.key === 'Tab' && asideEl) {
        const focusables = Array.from(
          asideEl.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(focusFirst);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileFiltersOpen, closeMobileFilters]);

  useEffect(() => {
    if (!isSortOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !sortWrapRef.current?.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isSortOpen]);

  // Sync state when URL params change externally
  useEffect(() => {
    const col = searchParams.get('collection');
    setSelectedCollection(col);

    const catParam = searchParams.get('category');
    if (catParam) {
      const list = catParam.split(',').filter(c => CATEGORIES.some(cat => cat.slug === c));
      setSelectedCategories(new Set(list));
    } else {
      setSelectedCategories(new Set());
    }

    setCustomizableOnly(searchParams.get('customizable') === '1');
  }, [searchParams]);

  // Update URL search params cleanly
  const updateUrlParams = useCallback(
    (cats: Set<string>, col: string | null, cust: boolean) => {
      const nextParams = new URLSearchParams();
      if (cats.size > 0) {
        nextParams.set('category', Array.from(cats).join(','));
      }
      if (col) {
        nextParams.set('collection', col);
      }
      if (cust) {
        nextParams.set('customizable', '1');
      }
      setSearchParams(nextParams, { replace: true });
    },
    [setSearchParams]
  );

  // Pills horizontal scroll / gesture drag
  const pillsRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isDraggingPills = useRef(false);
  const pillsStartX = useRef(0);
  const pillsScrollLeft = useRef(0);
  const hasDraggedPills = useRef(false);

  const updatePillArrows = useCallback(() => {
    const el = pillsRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < maxScroll - 4 && maxScroll > 4);
  }, []);

  useEffect(() => {
    updatePillArrows();
    const el = pillsRef.current;
    if (!el) return;

    el.addEventListener('scroll', updatePillArrows, { passive: true });
    window.addEventListener('resize', updatePillArrows, { passive: true });
    return () => {
      el.removeEventListener('scroll', updatePillArrows);
      window.removeEventListener('resize', updatePillArrows);
    };
  }, [updatePillArrows]);

  const handlePillScroll = (direction: number) => {
    pillsRef.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
    setTimeout(updatePillArrows, 320);
  };

  const handlePillPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingPills.current = true;
    hasDraggedPills.current = false;
    pillsStartX.current = e.clientX;
    pillsScrollLeft.current = pillsRef.current?.scrollLeft || 0;
  };

  const handlePillPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPills.current || !pillsRef.current) return;
    const dx = e.clientX - pillsStartX.current;
    if (Math.abs(dx) > 6) {
      hasDraggedPills.current = true;
      pillsRef.current.classList.add('is-dragging');
    }
    pillsRef.current.scrollLeft = pillsScrollLeft.current - dx;
  };

  const handlePillPointerUp = () => {
    if (!isDraggingPills.current) return;
    isDraggingPills.current = false;
    pillsRef.current?.classList.remove('is-dragging');
    setTimeout(() => {
      hasDraggedPills.current = false;
    }, 50);
    updatePillArrows();
  };

  // Filter actions
  const handlePillClick = (catSlug: string) => {
    if (hasDraggedPills.current) return;
    if (catSlug === 'all') {
      const next = new Set<string>();
      setSelectedCategories(next);
      setSelectedCollection(null);
      updateUrlParams(next, null, customizableOnly);
    } else {
      const next = new Set<string>([catSlug]);
      setSelectedCategories(next);
      setSelectedCollection(null);
      updateUrlParams(next, null, customizableOnly);
    }
  };

  const handleCategoryCheckboxChange = (slug: string, checked: boolean) => {
    const next = new Set(selectedCategories);
    if (checked) {
      next.add(slug);
    } else {
      next.delete(slug);
    }
    setSelectedCategories(next);
    updateUrlParams(next, selectedCollection, customizableOnly);
  };

  const clearAllFilters = () => {
    const next = new Set<string>();
    setSelectedCategories(next);
    setSelectedCollection(null);
    setCustomizableOnly(false);
    setPriceMin(100);
    setPriceMax(5000);
    updateUrlParams(next, null, false);
  };

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedCollection !== null ||
    customizableOnly ||
    priceMin > 100 ||
    priceMax < 5000;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      // 1. Collection filter
      if (selectedCollection && selectedCollection !== 'all') {
        if (product.collection !== selectedCollection) return false;
      }

      // 2. Category multi-select filter (OR within categories: matches ANY ticked category)
      if (selectedCategories.size > 0) {
        let matchesAny = false;
        for (const catSlug of selectedCategories) {
          const catProducts = productsInCategory(catSlug);
          if (catProducts.some(p => p.id === product.id)) {
            matchesAny = true;
            break;
          }
        }
        if (!matchesAny) return false;
      }

      // 3. Customizable filter
      if (customizableOnly && !product.customizable) {
        return false;
      }

      // 4. Price range filter
      if (product.price < priceMin) return false;
      if (priceMax < 5000 && product.price > priceMax) return false;

      return true;
    }).sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // 'newest' preserves original order
    });
  }, [selectedCollection, selectedCategories, customizableOnly, priceMin, priceMax, sort]);

  // Dual handle range slider percentage calculation
  const minPercent = ((priceMin - 100) / (5000 - 100)) * 100;
  const maxPercent = ((priceMax - 100) / (5000 - 100)) * 100;

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [filteredProducts.length]);

  return (
    <main className="catalogue-main" id="main">
      {/* Top Hero Banner */}
      <section className="catalogue-banner" aria-label="Collections overview">
        <div className="catalogue-banner__inner">
          <div className="catalogue-banner__content">
            <span className="catalogue-banner__eyebrow">EXPLORE OUR</span>
            <h1 className="catalogue-banner__title">Collections</h1>
            <p className="catalogue-banner__desc">
              A curated range of handcrafted gifts, each<br />
              made with care, creativity and a personal touch.
            </p>
          </div>
          <div className="catalogue-banner__media" aria-hidden="true">
            <img src="/assets/hero.png" alt="" className="catalogue-banner__img" />
          </div>
        </div>
      </section>

      {/* Category Pills Filter Bar */}
      <section className="collection-pills-bar" aria-label="Filter by category">
        <div className="container pills-scroll-container">
          <button
            type="button"
            className={`pills-scroll-arrow pills-scroll-arrow--prev ${!canScrollPrev ? 'is-hidden' : ''}`}
            aria-label="Scroll categories left"
            onClick={() => handlePillScroll(-1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            className="collection-pills"
            ref={pillsRef}
            onPointerDown={handlePillPointerDown}
            onPointerMove={handlePillPointerMove}
            onPointerUp={handlePillPointerUp}
            onPointerCancel={handlePillPointerUp}
          >
            {(() => {
              const activeSlug =
                selectedCategories.size === 1 && !selectedCollection
                  ? Array.from(selectedCategories)[0]
                  : 'all';
              return (
                <>
                  <button
                    type="button"
                    className={`pill ${activeSlug === 'all' ? 'active' : ''}`}
                    aria-pressed={activeSlug === 'all'}
                    onClick={() => handlePillClick('all')}
                  >
                    <svg
                      className="pill-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    <span>All categories</span>
                  </button>
                  {CATEGORIES.map(cat => {
                    const isActive = activeSlug === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        className={`pill ${isActive ? 'active' : ''}`}
                        aria-pressed={isActive}
                        onClick={() => handlePillClick(cat.slug)}
                      >
                        <Icon
                          name={(PILL_ICONS[cat.slug] || 'gift') as any}
                          size={18}
                          strokeWidth={1.8}
                          className="pill-icon"
                        />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </>
              );
            })()}
          </div>

          <button
            type="button"
            className={`pills-scroll-arrow pills-scroll-arrow--next ${!canScrollNext ? 'is-hidden' : ''}`}
            aria-label="Scroll categories right"
            onClick={() => handlePillScroll(1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Main Filters & Products Grid Layout */}
      <div className="catalogue-wrap">
        <div
          className={`filters-sheet-backdrop ${mobileFiltersOpen ? 'is-open' : ''}`}
          aria-hidden="true"
          onClick={closeMobileFilters}
        />

        {/* Left Sticky Filters Sidebar (Bottom sheet below 1024px) */}
        <aside
          ref={filtersAsideRef}
          className={`filters ${mobileFiltersOpen ? 'is-sheet-open' : ''}`}
          id="filtersSheet"
          aria-label="Filters"
        >
          <div className="filters__header">
            <div className="filters__title-group">
              <svg
                className="filters__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <h2 className="filters__heading">Filters</h2>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className="filters__clear"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Section 1: Price Range Slider */}
          <div className="filter-group">
            <h3 className="filter-group-title">Price Range</h3>
            <div className="range-slider">
              <div className="range-slider__track">
                <div
                  className="range-slider__fill"
                  style={{
                    left: `${minPercent}%`,
                    right: `${100 - maxPercent}%`
                  }}
                />
              </div>
              <input
                type="range"
                className="range-slider__input"
                min="100"
                max="5000"
                step="50"
                value={priceMin}
                aria-label="Minimum price"
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  const newMin = Math.min(val, priceMax - 50);
                  setPriceMin(newMin);
                }}
              />
              <input
                type="range"
                className="range-slider__input"
                min="100"
                max="5000"
                step="50"
                value={priceMax}
                aria-label="Maximum price"
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  const newMax = Math.max(val, priceMin + 50);
                  setPriceMax(newMax);
                }}
              />
            </div>
            <div className="range-slider__labels">
              <span>₹{inr.format(priceMin)}</span>
              <span>{priceMax >= 5000 ? '₹5,000+' : `₹${inr.format(priceMax)}`}</span>
            </div>
          </div>

          {/* Section 2: Category Filter Checkboxes */}
          <div className="filter-group">
            <h3 className="filter-group-title">Category</h3>
            <div className="filter-checkbox-list">
              {CATEGORIES.map(cat => {
                const count = countInCategory(cat.slug);
                const isChecked = selectedCategories.has(cat.slug);
                return (
                  <label key={cat.slug} className="filter-row">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      name="category"
                      value={cat.slug}
                      checked={isChecked}
                      onChange={e => handleCategoryCheckboxChange(cat.slug, e.target.checked)}
                    />
                    <span className="filter-row-label">
                      {cat.label} <span className="filter-row-count">({count})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filters__sheet-footer">
            <button
              type="button"
              className="btn btn-outline-burgundy"
              onClick={clearAllFilters}
            >
              Clear all
            </button>
            <button
              type="button"
              className="btn btn-burgundy"
              onClick={closeMobileFilters}
            >
              Apply ({filteredProducts.length})
            </button>
          </div>
        </aside>

        {/* Right Products Grid & Results Section */}
        <section className="catalogue-results" aria-labelledby="resultsCount">
          {/* Results Topbar: Count & Sort Select */}
          <div className="catalogue-results-header">
            <span className="results-count" id="resultsCount">
              {filteredProducts.length === 1
                ? '1 Product'
                : `${filteredProducts.length} Products`}
            </span>

            <div className="catalogue-results-controls">
              <button
                ref={filtersTriggerRef}
                type="button"
                className="mobile-filters-btn"
                aria-expanded={mobileFiltersOpen}
                aria-controls="filtersSheet"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>Filters</span>
                {(selectedCategories.size + (priceMin > 100 || priceMax < 5000 ? 1 : 0) + (customizableOnly ? 1 : 0)) > 0 && (
                  <span className="mobile-filters-count">
                    {selectedCategories.size + (priceMin > 100 || priceMax < 5000 ? 1 : 0) + (customizableOnly ? 1 : 0)}
                  </span>
                )}
              </button>

              <div ref={sortWrapRef} className="custom-sort-wrap" id="customSortWrap">
              <button
                type="button"
                className="custom-sort-trigger"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                aria-label="Sort products"
                onClick={() => setIsSortOpen(prev => !prev)}
              >
                <span className="custom-sort-label">Sort by:</span>
                <span className="custom-sort-current">{SORT_LABELS[sort]}</span>
                <svg
                  className="custom-sort-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div
                className={`custom-sort-dropdown ${isSortOpen ? 'is-open' : ''}`}
                role="listbox"
                aria-label="Sort options"
                aria-hidden={!isSortOpen}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map(key => {
                  const isSelected = sort === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`custom-sort-item ${isSelected ? 'is-selected' : ''}`}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={isSortOpen ? 0 : -1}
                      onClick={() => {
                        setSort(key);
                        setIsSortOpen(false);
                      }}
                    >
                      <span className="custom-sort-item-text">{SORT_LABELS[key]}</span>
                      {isSelected && (
                        <svg
                          className="custom-sort-item-check"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            </div>
          </div>

          {/* Product Cards Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="catalogue-empty" id="catalogueEmpty">
              <div className="catalogue-empty__icon">🌸</div>
              <h3 className="catalogue-empty__title">No gifts found</h3>
              <p className="catalogue-empty__text">
                Try adjusting or clearing your filters to see more results.
              </p>
              <button
                type="button"
                className="btn btn-burgundy btn-sm"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="catalogue-grid" id="catalogueGrid" aria-live="polite">
              {filteredProducts.map((product, index) => (
                <AnimatedContent
                  key={`${product.id}-${filteredProducts.length}`}
                  className="catalogue-card-anim"
                  distance={66}
                  duration={0.8}
                  delay={(index % 4) * 0.06}
                  threshold={0.08}
                  once={false}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    variant="catalogue"
                  />
                </AnimatedContent>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Global Shared Footer */}
      <Footer />
    </main>
  );
};

export default CollectionsPage;
