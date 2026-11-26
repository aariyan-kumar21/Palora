import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { PRODUCTS } from '../../data/products';
import { Product } from '../../data/types';
import AnimatedList, { AnimatedListItemObject } from '../AnimatedList/AnimatedList';
import './SearchPanel.css';

const inrFormatter = new Intl.NumberFormat('en-IN');

const GIFT_WATERMARK_SVG = (
  <svg
    className="search-thumb-watermark"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFF7F2"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </svg>
);

export const SearchPanel: React.FC = () => {
  const { activePanel, closePanel, openQuickView } = useUI();
  const [query, setQuery] = useState('');
  const [rendered, setRendered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isOpen = activePanel === 'search';

  // Keep mounted during close transition, unmount after 240ms
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      return undefined;
    }
    const timer = setTimeout(() => {
      setRendered(false);
      setQuery('');
    }, 240);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Center-point unroll animation when opening
  useLayoutEffect(() => {
    const pill = pillRef.current;
    if (!pill || !isOpen) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const width = pill.offsetWidth || 720;
    pill.animate(
      [
        {
          clipPath: `inset(0px ${Math.max(0, width / 2 - 30)}px round 9999px)`,
          transform: 'scale(0.92)',
          opacity: 0
        },
        {
          clipPath: 'inset(0px 0px round 9999px)',
          transform: 'scale(1)',
          opacity: 1
        }
      ],
      { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }
    );
  }, [isOpen, rendered]);

  // Focus input automatically when opened
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Adapt max-height to on-screen keyboard via visualViewport on mobile
  useEffect(() => {
    if (!isOpen) {
      document.documentElement.style.removeProperty('--vv-height');
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;
    const syncViewport = () => {
      document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
    };
    syncViewport();
    vv.addEventListener('resize', syncViewport, { passive: true });
    vv.addEventListener('scroll', syncViewport, { passive: true });
    return () => {
      vv.removeEventListener('resize', syncViewport);
      vv.removeEventListener('scroll', syncViewport);
      document.documentElement.style.removeProperty('--vv-height');
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
        document.getElementById('searchBtn')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closePanel]);

  // Close search panel on route change
  const prevLocRef = useRef(location.pathname + location.search);
  useEffect(() => {
    const currentLoc = location.pathname + location.search;
    if (prevLocRef.current !== currentLoc) {
      prevLocRef.current = currentLoc;
      if (isOpen) closePanel();
    }
  }, [location.pathname, location.search, isOpen, closePanel]);

  const q = query.trim().toLowerCase();

  const trendingProducts: Product[] = useMemo(
    () => PRODUCTS.filter(p => p.featured).slice(0, 5),
    []
  );

  const matchedProducts: Product[] = useMemo(() => {
    if (!q) return [];
    return PRODUCTS.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchOcc = (p.occasions || []).some(occ => occ.toLowerCase().includes(q));
      const matchColl = p.collection.toLowerCase().includes(q);
      const matchBadge = p.badge.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat || matchOcc || matchColl || matchBadge;
    }).slice(0, 6);
  }, [q]);

  const displayProducts = q ? matchedProducts : trendingProducts;

  const handleProductClick = (product: Product) => {
    openQuickView(product, null);
  };

  if (!isOpen && !rendered) {
    return null;
  }

  return (
    <>
      <div
        className={`search-backdrop ${isOpen ? 'is-open' : ''}`}
        aria-hidden="true"
        onClick={closePanel}
      />
      <div
        className={`search-panel-wrap ${isOpen ? 'is-open' : ''}`}
        id="searchPanel"
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        aria-hidden={!isOpen}
      >
        {/* Pill-shaped Search Bar */}
        <div ref={pillRef} className="search-pill-bar">
          <div className="search-bar-icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <line x1="15.5" y1="15.5" x2="20" y2="20" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            className="search-bar-input"
            placeholder="Search handmade gifts"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search handmade gifts"
          />

          <button
            type="button"
            className="search-bar-close-btn"
            aria-label="Close search"
            onClick={closePanel}
          >
            <svg
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Trending / Search Results Card directly below pill */}
        <div className="search-results-card">
          <div className="search-results-header">
            <span className="search-results-heading">
              {q ? `SEARCH RESULTS (${matchedProducts.length})` : 'MOST TRENDING'}
            </span>
          </div>

          {q && matchedProducts.length === 0 ? (
            <div className="search-no-results">No pieces match your search.</div>
          ) : (
            <AnimatedList<AnimatedListItemObject & { product: Product; toneNum: number }>
              items={displayProducts.map((product, idx) => ({
                id: `${q ? 'search' : 'trend'}-${product.id}`,
                title: product.name,
                product,
                toneNum: (idx % 4) + 1
              }))}
              animation="pop"
              theme="light"
              frame={false}
              accentColor="#722F37"
              stagger={0.05}
              showGradients={true}
              fadeSize={36}
              width="100%"
              maxHeight={400}
              radius={14}
              gap={6}
              className="search-animated-list"
              itemClassName={`search-product-row ${q ? 'is-detailed' : ''}`}
              onItemSelect={item => handleProductClick(item.product)}
              renderItem={item => {
                const { product, toneNum } = item;
                return (
                  <>
                    <div className={`search-product-thumb product-card__img-box--tone-${toneNum}`}>
                      {GIFT_WATERMARK_SVG}
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="search-product-info">
                      <div className="search-product-top">
                        <span className="search-product-name">{product.name}</span>
                        <span className="search-product-badge">{product.badge}</span>
                      </div>
                      {q && <p className="search-product-desc">{product.description}</p>}
                    </div>

                    <span className="search-product-price">
                      ₹{inrFormatter.format(product.price)}
                    </span>
                  </>
                );
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPanel;
