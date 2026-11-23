import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useSaved } from '../../context/SavedContext';
import { prefetchSearchPanel } from '../SearchPanel/SearchPanelLazy';
import { Icon } from '../Icon/Icon';

export const Header: React.FC = () => {
  const { activePanel, togglePanel } = useUI();
  const { totalCount, badgeBump } = useCart();
  const { savedCount } = useSaved();
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const isDrawerOpen = activePanel === 'drawer';
  const isSearchOpen = activePanel === 'search';
  const isSavedOpen = activePanel === 'saved';
  const isCartOpen = activePanel === 'cart';

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="site-header">
      <div className="container header-inner">
        {/* Navigation Links (Left) */}
        <nav className="nav-menu" id="navMenu" aria-label="Main Navigation">
          <ul className="nav-list">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                HOME
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/collections"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onMouseEnter={() => {
                  // Prefetch collections chunk
                  import('../../features/collections/CollectionsPage');
                }}
              >
                COLLECTIONS
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/story"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                OUR STORY
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Center Wordmark */}
        <Link to="/" className="site-wordmark" aria-label="Palora Home">
          <span className="wordmark-title">PALORA</span>
          <span className="wordmark-tagline">HANDMADE GIFTS</span>
        </Link>

        {/* Header Action Controls (Right): Search, Saved, Cart, Menu */}
        <div className="header-actions">
          {/* Search Trigger Button */}
          <button
            type="button"
            className={`icon-btn search-btn ${isSearchOpen ? 'is-active' : ''}`}
            id="searchBtn"
            aria-label="Search"
            aria-expanded={isSearchOpen}
            aria-controls="searchPanel"
            onMouseEnter={prefetchSearchPanel}
            onFocus={prefetchSearchPanel}
            onClick={() => togglePanel('search')}
          >
            <Icon name="search-nav" size={21} strokeWidth={1.5} />
          </button>

          {/* Wishlist / Saved items Button */}
          <button
            type="button"
            className={`icon-btn saved-btn ${isSavedOpen ? 'is-active' : ''}`}
            id="savedBtn"
            aria-label="Wishlist items"
            aria-expanded={isSavedOpen}
            onClick={() => togglePanel('saved')}
          >
            <Icon name="heart" size={21} strokeWidth={1.5} />
            <span
              className="saved-badge"
              id="savedBadge"
              style={{ display: savedCount > 0 ? 'flex' : 'none' }}
            >
              {savedCount}
            </span>
          </button>

          {/* Shopping Cart Trigger Button */}
          <button
            type="button"
            className={`icon-btn cart-btn ${isCartOpen ? 'is-active' : ''}`}
            id="cartBtn"
            aria-label="Open cart"
            aria-expanded={isCartOpen}
            onClick={() => togglePanel('cart')}
          >
            <Icon name="bag" size={23} strokeWidth={1.5} />
            <span
              className={`cart-badge ${badgeBump ? 'bump' : ''}`}
              id="cartBadge"
              style={{ display: totalCount > 0 ? 'flex' : 'none' }}
            >
              {totalCount}
            </span>
          </button>

          {/* Hamburger Toggle Button (Two-line icon) */}
          <button
            type="button"
            className={`mobile-toggle-btn hamburger-btn ${isDrawerOpen ? 'is-open' : ''}`}
            id="mobileToggleBtn"
            aria-label="Toggle navigation menu"
            aria-expanded={isDrawerOpen}
            aria-controls="menu-drawer"
            onClick={() => togglePanel('drawer')}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
