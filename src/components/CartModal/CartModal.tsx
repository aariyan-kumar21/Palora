import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import { waLink, hasWhatsApp } from '../../data/config';
import CheckoutAction from './CheckoutAction';

const inrFormatter = new Intl.NumberFormat('en-IN');

const GIFT_WATERMARK_SVG = (
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </>
);

export const CartModal: React.FC = () => {
  const { activePanel, closePanel } = useUI();
  const { cart, removeItem, updateQuantity, updateNote, totalCount, totalAmount } = useCart();
  const isOpen = activePanel === 'cart';

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const modalRef = useRef<HTMLElement>(null);

  // Esc and outside-click handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
        document.getElementById('cartBtn')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  const handleCheckout = () => {
    if (cart.length === 0 || !hasWhatsApp()) return;

    const cName = customerName.trim() || 'Gifting Guest';
    const cAddress = customerAddress.trim() || 'Not specified';
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let grandTotal = 0;
    const messageLines = [
      `*🎁 NEW ORDER INQUIRY - PALORA HANDMADE*`,
      `--------------------------------------`,
      `*Customer:* ${cName}`,
      `*Delivery Address:* ${cAddress}`,
      `*Date:* ${today}`,
      `--------------------------------------`,
      `*ORDER ITEMS:*`
    ];

    cart.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      grandTotal += lineTotal;
      messageLines.push(
        `\n*${index + 1}. ${item.name}*`,
        `• Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${lineTotal.toLocaleString('en-IN')}`,
        `• *Personalization:* "${item.note}"`
      );
    });

    messageLines.push(
      `--------------------------------------`,
      `*ESTIMATED TOTAL: ₹${grandTotal.toLocaleString('en-IN')}*`,
      `_(Excluding shipping; verified via chat)_`,
      ``,
      `✨ _Hello Palora! I would like to place this handmade order. Please confirm availability and share payment details._`
    );

    const fullMessage = messageLines.join('\n');
    const targetUrl = waLink(fullMessage);
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? 'open is-open' : ''}`}
        id="cartOverlay"
        aria-hidden={!isOpen}
        hidden={!isOpen}
        onClick={closePanel}
      />

      {/* Cart Modal Panel */}
      <aside
        ref={modalRef}
        className={`cart-modal ${isOpen ? 'open is-open' : ''}`}
        id="cartModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartHeading"
        aria-hidden={!isOpen}
        hidden={!isOpen}
      >
        <div className="cart-inner">
          <button
            type="button"
            className="cart-close-btn"
            id="cartCloseBtn"
            aria-label="Close cart"
            onClick={closePanel}
          >
            &times;
          </button>

          {cart.length === 0 ? (
            /* Empty State */
            <div className="cart-empty" id="cartEmpty" style={{ display: 'flex' }}>
              <div className="cart-empty-art">🌸</div>
              <h2 className="cart-empty-title">Your Cart is Empty</h2>
              <p className="cart-empty-text">Add a personalized handmade keepsake to brighten someone's day.</p>
              <Link
                to="/collections"
                className="cart-action-btn cart-empty-btn"
                id="shopNowEmptyBtn"
                onClick={closePanel}
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            /* Filled Cart Content */
            <div id="cartFilledContent" style={{ display: 'block' }}>
              {/* Header */}
              <div className="cart-header-row">
                <h2 className="cart-heading" id="cartHeading">Your Cart</h2>
                <span className="cart-count-chip" id="cartHeaderCount">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* 1. Products List */}
              <div className="cart-products-list" id="cartProductsList">
                {cart.map(item => {
                  const product = PRODUCTS.find(p => p.id === item.id);
                  const badgeText = product?.badge || 'Handmade';
                  const toneNum = ((PRODUCTS.findIndex(p => p.id === item.id) % 4) + 1) || 1;
                  const hasCustomNote = item.note && item.note !== 'Standard (No custom text requested)' && item.note.trim() !== '';
                  const displayNote = hasCustomNote ? item.note : '';

                  return (
                    <div key={item.cartItemId} className="cart-product-item" data-cart-item-id={item.cartItemId}>
                      {/* Left: Media Box */}
                      <div className={`cart-item-media cart-item-media--tone-${toneNum}`}>
                        <span className="cart-badge-pill">{badgeText}</span>
                        <svg
                          className="cart-watermark"
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFF7F2"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          {GIFT_WATERMARK_SVG}
                        </svg>
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Right: Info */}
                      <div className="cart-item-info">
                        <div className="cart-item-title-row">
                          <h3 className="cart-item-title">{item.name}</h3>
                          <button
                            type="button"
                            className="cart-item-remove-btn"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => removeItem(item.cartItemId)}
                          >
                            &times;
                          </button>
                        </div>

                        <div className="cart-item-price-row">
                          <span className="cart-item-unit-price">₹{inrFormatter.format(item.price)} each</span>
                          {item.quantity > 1 && (
                            <span className="cart-item-subtotal-hint">
                              (Subtotal: ₹{inrFormatter.format(item.price * item.quantity)})
                            </span>
                          )}
                        </div>

                        <div className="cart-item-personalization">
                          <label className="cart-field-label">PERSONALIZE IT</label>
                          <input
                            type="text"
                            className="cart-input cart-item-note-input"
                            maxLength={120}
                            placeholder="Name, date or a short message (optional)"
                            value={displayNote}
                            onChange={e => updateNote(item.cartItemId, e.target.value)}
                          />
                          <div className="cart-counter">{displayNote.length}/120</div>
                        </div>

                        <div className="cart-item-stepper-row">
                          <div className="cart-stepper-wrap">
                            <span className="cart-field-label">QUANTITY</span>
                            <div className="cart-stepper">
                              <button
                                type="button"
                                className="stepper-btn"
                                aria-label="Decrease quantity"
                                onClick={() => updateQuantity(item.cartItemId, -1)}
                              >
                                −
                              </button>
                              <span className="stepper-value">{item.quantity}</span>
                              <button
                                type="button"
                                className="stepper-btn"
                                aria-label="Increase quantity"
                                onClick={() => updateQuantity(item.cartItemId, 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="cart-remove-link"
                            onClick={() => removeItem(item.cartItemId)}
                          >
                            Remove item
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Customer Details */}
              <div className="cart-customer-section">
                <h4 className="cart-section-subtitle">
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Customer Details
                </h4>
                <div className="cart-input-grid">
                  <div className="cart-field-group">
                    <label htmlFor="orderCustomerName" className="cart-field-label">YOUR NAME</label>
                    <input
                      type="text"
                      id="orderCustomerName"
                      className="cart-input"
                      placeholder="Full name (e.g. Aditi Sharma)"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="cart-field-group">
                    <label htmlFor="orderCustomerAddress" className="cart-field-label">DELIVERY ADDRESS</label>
                    <input
                      type="text"
                      id="orderCustomerAddress"
                      className="cart-input"
                      placeholder="House/Flat No., Street, City, Pincode"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Order Summary Table */}
              <div className="cart-summary-section">
                <h4 className="cart-section-subtitle">
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Order Summary
                </h4>
                <div className="cart-summary-items" id="cartSummaryItems">
                  {cart.map(item => {
                    const hasCustomNote = item.note && item.note !== 'Standard (No custom text requested)' && item.note.trim() !== '';
                    const lineTotal = item.price * item.quantity;
                    return (
                      <div key={item.cartItemId} className="cart-summary-row" data-summary-item-id={item.cartItemId}>
                        <div className="cart-summary-item-main">
                          <span className="cart-summary-item-name">{item.name}</span>
                          <span className="cart-summary-item-note">
                            {hasCustomNote ? `Note: "${item.note}"` : 'Note: Standard'}
                          </span>
                        </div>
                        <div className="cart-summary-item-meta">
                          <span className="cart-summary-item-qty">Qty: {item.quantity}</span>
                          <span className="cart-summary-item-price">₹{inrFormatter.format(lineTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="cart-summary-total-divider" />
                <div className="cart-grand-total-row">
                  <span className="cart-grand-total-label">Grand Total:</span>
                  <span className="cart-grand-total-amount" id="cartGrandTotal">
                    ₹{inrFormatter.format(totalAmount)}
                  </span>
                </div>
                <p className="cart-shipping-note">✨ Standard shipping calculated &amp; finalized via WhatsApp</p>
              </div>

              {/* 4. Action CTA */}
              <div className="cart-cta-section">
                <CheckoutAction onCheckout={handleCheckout} disabled={cart.length === 0} />
                <Link to="/help#faqs" className="cart-faq-link" onClick={closePanel}>
                  Questions? See Help &amp; FAQs
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartModal;
