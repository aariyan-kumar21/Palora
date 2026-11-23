import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { hasWhatsApp, waLink, INSTAGRAM_URL, INSTAGRAM_HANDLE, EMAIL } from '../../data/config';
import { Icon } from '../Icon/Icon';

export const Footer: React.FC = () => {
  const half = Math.ceil(CATEGORIES.length / 2);
  const col1 = CATEGORIES.slice(0, half);
  const col2 = CATEGORIES.slice(half);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" id="site-footer">
      {/* Top Band Inside Footer */}
      <div className="footer-top-band">
        <div className="container footer-top-inner">
          <div className="footer-top-text">
            <h2 className="footer-top-heading">Make every moment special.</h2>
            <p className="footer-top-subtext">Browse our handmade gifts and make them yours.</p>
          </div>
          <div className="footer-top-actions">
            <Link to="/collections" className="footer-cta-btn">
              Explore Collections
            </Link>
            {hasWhatsApp() && (
              <a
                href={waLink("Hi Palora! I'd like to chat.")}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-outline-btn"
              >
                <Icon name="whatsapp" size={18} strokeWidth={1.5} />
                <span>Chat on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 5 Columns Grid */}
      <div className="container footer-main-container">
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-title">PALORA</div>
            <div className="footer-brand-sub">HANDMADE GIFTS</div>
            <p className="footer-brand-tagline">
              Thoughtful, personalized handmade gifts turning simple moments into lasting memories.
            </p>
            <div className="footer-social-row">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <Icon name="instagram" size={22} strokeWidth={1.5} />
              </a>
              <a
                href={waLink("Hi Palora! I'd like to inquire about your gifts.") || "https://wa.me/"}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" size={22} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop by category */}
          <div className="footer-col footer-col--cats">
            <h3 className="footer-col-heading">Shop by category</h3>
            <ul className="footer-cats-all">
              <li>
                <Link to="/collections" className="footer-link">
                  All products
                </Link>
              </li>
            </ul>
            <div className="footer-cats-subgrid">
              <ul className="footer-cats-col">
                {col1.map(cat => (
                  <li key={cat.slug}>
                    <Link to={`/collections?category=${cat.slug}`} className="footer-link">
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="footer-cats-col">
                {col2.map(cat => (
                  <li key={cat.slug}>
                    <Link to={`/collections?category=${cat.slug}`} className="footer-link">
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Help */}
          <div className="footer-col">
            <h3 className="footer-col-heading">Help</h3>
            <ul className="footer-link-list">
              <li>
                <Link to="/help#how-to-order" className="footer-link">
                  How ordering works
                </Link>
              </li>
              <li>
                <Link to="/help#shipping" className="footer-link">
                  Shipping &amp; delivery
                </Link>
              </li>
              <li>
                <Link to="/help#returns" className="footer-link">
                  Returns &amp; personalized orders
                </Link>
              </li>
              <li>
                <Link to="/help#faqs" className="footer-link">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/help#contact" className="footer-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="footer-col">
            <h3 className="footer-col-heading">Company</h3>
            <ul className="footer-link-list">
              <li>
                <Link to="/story" className="footer-link">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/#bestsellers" className="footer-link">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Get in touch */}
          <div className="footer-col footer-col--contact">
            <h3 className="footer-col-heading">Get in touch</h3>
            {hasWhatsApp() && (
              <a
                href={waLink("Hi Palora! I'd like to order a handmade gift.")}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-btn"
              >
                <Icon name="whatsapp" size={18} strokeWidth={1.5} />
                <span>Order on WhatsApp</span>
              </a>
            )}
            <div className="footer-contact-items">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <Icon name="instagram" size={18} strokeWidth={1.5} />
                <span>@{INSTAGRAM_HANDLE}</span>
              </a>
              {EMAIL && (
                <a href={`mailto:${EMAIL}`} className="footer-contact-link">
                  <Icon name="mail" size={18} strokeWidth={1.5} />
                  <span>{EMAIL}</span>
                </a>
              )}
              <div className="footer-delivering-line">
                <Icon name="truck" size={18} strokeWidth={1.5} />
                <span>Delivering across India</span>
              </div>
            </div>
            <p className="footer-delivery-note">
              Every piece is made to order. Delivery timing is confirmed on WhatsApp when you place your order.
            </p>
          </div>
        </div>
      </div>

      {/* Faint Giant Watermark */}
      <div className="footer-watermark" aria-hidden="true">
        PALORA
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <div className="footer-bottom-copy">
            &copy; {new Date().getFullYear()} Palora. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy" className="footer-bottom-link">
              Privacy Policy
            </Link>
            <a
              href="#site-header"
              className="footer-bottom-link footer-back-to-top"
              id="backToTopBtn"
              onClick={scrollToTop}
            >
              Back to top &uarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
