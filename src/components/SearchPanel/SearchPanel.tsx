import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CardNav, { CardNavItem } from '../CardNav/CardNav';
import { useUI } from '../../context/UIContext';
import { PRODUCTS } from '../../data/products';
import { CATEGORIES } from '../../data/categories';
import { COLLECTIONS } from '../../data/collections';
import { Product } from '../../data/types';
import './SearchPanel.css';

const inrFormatter = new Intl.NumberFormat('en-IN');

export const SearchPanel: React.FC = () => {
  const { activePanel, closePanel, openQuickView } = useUI();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOpen = activePanel === 'search';

  // Close search panel on route change (not on mount)
  const prevLocRef = useRef(location.pathname + location.search);
  useEffect(() => {
    const currentLoc = location.pathname + location.search;
    if (prevLocRef.current !== currentLoc) {
      prevLocRef.current = currentLoc;
      if (isOpen) {
        closePanel();
      }
    }
  }, [location.pathname, location.search, isOpen, closePanel]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const matchedProducts: Product[] = useMemo(() => {
    if (!q) {
      return PRODUCTS.filter(p => p.featured).slice(0, 4);
    }
    return PRODUCTS.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchOcc = (p.occasions || []).some(occ => occ.toLowerCase().includes(q));
      const matchColl = p.collection.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat || matchOcc || matchColl;
    }).slice(0, 4);
  }, [q]);

  const matchedCategories = useMemo(() => {
    if (!q) {
      return CATEGORIES.slice(0, 4);
    }
    return CATEGORIES.filter(c => c.label.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)).slice(0, 4);
  }, [q]);

  const matchedCollections = useMemo(() => {
    if (!q) {
      return COLLECTIONS.slice(0, 5);
    }
    return COLLECTIONS.filter(c => c.label.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)).slice(0, 4);
  }, [q]);

  const hasAnyMatches = !q || matchedProducts.length > 0 || matchedCategories.length > 0 || matchedCollections.length > 0;

  const handleProductClick = (product: Product) => {
    openQuickView(product, null);
  };

  const handleCategoryClick = (slug: string) => {
    closePanel();
    navigate(`/collections?category=${encodeURIComponent(slug)}`);
  };

  const handleCollectionClick = (slug: string) => {
    closePanel();
    navigate(`/collections?collection=${encodeURIComponent(slug)}`);
  };

  const items: CardNavItem[] = useMemo(() => {
    return [
      {
        label: 'Products',
        description: q ? `${matchedProducts.length} pieces` : 'Curated highlights',
        links:
          matchedProducts.length > 0
            ? matchedProducts.map(p => ({
                label: `${p.name}, ₹${inrFormatter.format(p.price)}`,
                ariaLabel: `Quick view for ${p.name}`,
                onClick: () => handleProductClick(p)
              }))
            : [{ label: 'No matches' }]
      },
      {
        label: 'Categories',
        description: q ? `${matchedCategories.length} categories` : 'Popular categories',
        links:
          matchedCategories.length > 0
            ? matchedCategories.map(c => ({
                label: c.label,
                href: `/collections?category=${c.slug}`,
                ariaLabel: `Browse category ${c.label}`,
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  handleCategoryClick(c.slug);
                }
              }))
            : [{ label: 'No matches' }]
      },
      {
        label: 'Collections',
        description: q ? `${matchedCollections.length} collections` : 'Artisanal crafts',
        links:
          matchedCollections.length > 0
            ? matchedCollections.map(c => ({
                label: c.label,
                href: `/collections?collection=${c.slug}`,
                ariaLabel: `Browse collection ${c.label}`,
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  handleCollectionClick(c.slug);
                }
              }))
            : [{ label: 'No matches' }]
      }
    ];
  }, [matchedProducts, matchedCategories, matchedCollections, q]);

  const searchBar = (
    <div className="search-bar-inner">
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

      {query && (
        <button
          type="button"
          className="search-bar-clear-btn"
          aria-label="Clear search input"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
        >
          &times;
        </button>
      )}

      <button
        type="button"
        className="search-bar-close-btn"
        aria-label="Close search"
        onClick={closePanel}
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="search-panel-wrap" style={{ display: isOpen ? 'block' : 'none' }}>
      <CardNav
        theme="palora"
        surface="solid"
        cardEffect="rise"
        open={isOpen}
        onOpenChange={open => {
          if (!open && activePanel === 'search') closePanel();
        }}
        speed={1}
        bounce={0.2}
        stagger={0.12}
        maxWidth={820}
        intro={false}
        bar={searchBar}
        items={items}
      >
        {!hasAnyMatches ? (
          <div className="search-no-results">No pieces match your search.</div>
        ) : undefined}
      </CardNav>
    </div>
  );
};

export default SearchPanel;
