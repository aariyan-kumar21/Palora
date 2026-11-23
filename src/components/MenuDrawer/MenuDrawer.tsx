import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { hasWhatsApp, waLink, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../../data/config';
import { Icon } from '../Icon/Icon';

export const MenuDrawer: React.FC = () => {
  const { activePanel, closePanel } = useUI();
  const isOpen = activePanel === 'drawer';
  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Focus trap & escape handler
  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
        document.getElementById('mobileToggleBtn')?.focus();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  const handleLinkClick = () => {
    closePanel();
  };

  const getActiveDataLink = () => {
    if (location.pathname === '/' || location.pathname === '/index.html') {
      if (location.hash === '#bestsellers') return 'bestsellers';
      return 'home';
    }
    if (location.pathname.startsWith('/collections')) return 'catalogue';
    if (location.pathname.startsWith('/story')) return 'story';
    if (location.pathname.startsWith('/help')) return 'help';
    if (location.pathname.startsWith('/privacy')) return 'privacy';
    return '';
  };

  const activeLink = getActiveDataLink();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`menu-backdrop mobile-drawer-overlay ${isOpen ? 'is-open' : ''}`}
        id="menu-backdrop"
        aria-hidden={!isOpen}
        hidden={!isOpen}
        onClick={closePanel}
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className={`menu-drawer mobile-drawer ${isOpen ? 'is-open' : ''}`}
        id="menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!isOpen}
        hidden={!isOpen}
      >
        {/* Gift line-art illustration */}
        <svg
          className="md-gift"
          viewBox="0 0 120 120"
          fill="none"
          stroke="#FFE3E7"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="14" y="48" width="92" height="18" rx="3" />
          <path d="M20 66v38a4 4 0 0 0 4 4h72a4 4 0 0 0 4-4V66" />
          <path d="M54 48v60M66 48v60" />
          <path d="M60 48C46 48 28 44 28 32 28 22 40 20 47 26 54 36 60 48 60 48zm0 0c14 0 32-4 32-16 0-10-12-12-19-6-7 10-13 22-13 22z" />
        </svg>

        {/* Fixed Header */}
        <div className="md-head">
          <div className="md-wm">Palora</div>
          <div className="md-tag">Handmade Gifts</div>
          <button
            ref={closeBtnRef}
            className="md-close"
            id="closeDrawerBtn"
            aria-label="Close menu"
            onClick={closePanel}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="md-nav" aria-label="Menu Navigation">
          <div className="md-label">Menu</div>
          <div className="md-menu">
            <Link
              to="/"
              data-drawer-link="home"
              className={activeLink === 'home' ? 'is-active' : ''}
              onClick={handleLinkClick}
            >
              <span className="n">01</span>Home
            </Link>
            <Link
              to="/collections"
              data-drawer-link="catalogue"
              className={activeLink === 'catalogue' ? 'is-active' : ''}
              onClick={handleLinkClick}
            >
              <span className="n">02</span>Collections
            </Link>
            <Link
              to="/story"
              data-drawer-link="story"
              className={activeLink === 'story' ? 'is-active' : ''}
              onClick={handleLinkClick}
            >
              <span className="n">03</span>Our Story
            </Link>
            <Link
              to="/#bestsellers"
              data-drawer-link="bestsellers"
              className={activeLink === 'bestsellers' ? 'is-active' : ''}
              onClick={handleLinkClick}
            >
              <span className="n">04</span>Bestsellers
            </Link>
          </div>

          <hr />

          <div className="md-label md-label--help">Help</div>
          <div className="md-help">
            <Link to="/help#how-to-order" onClick={handleLinkClick}>
              How ordering works
            </Link>
            <Link to="/help#shipping" onClick={handleLinkClick}>
              Shipping &amp; delivery
            </Link>
            <Link to="/help#returns" onClick={handleLinkClick}>
              Returns &amp; personalized orders
            </Link>
          </div>

          <hr className="md-gap" />

          <div className="md-help">
            <Link to="/help#faqs" onClick={handleLinkClick}>
              FAQs
            </Link>
            <Link to="/help#contact" onClick={handleLinkClick}>
              Contact
            </Link>
          </div>

          <div className="md-label md-label--connect">Connect</div>
          {hasWhatsApp() && (
            <a
              className="md-row"
              href={waLink("Hi Palora! I'd like to discuss a custom gift.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={32} strokeWidth={1.5} />
              <span>Order on WhatsApp</span>
            </a>
          )}
          <a className="md-row" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span>@{INSTAGRAM_HANDLE}</span>
          </a>
        </nav>

        {/* Fixed Footer Block */}
        <div className="md-foot">
          <hr />
          <Link to="/privacy" onClick={handleLinkClick}>
            Privacy Policy
          </Link>
        </div>
      </aside>
    </>
  );
};

export default MenuDrawer;
