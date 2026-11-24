import React, { useState, useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { SparkProvider, useSpark } from '../ClickSpark/SparkContext';
import { PRODUCTS } from '../../data/products';

const inrFormatter = new Intl.NumberFormat('en-IN');

const GIFT_WATERMARK_SVG = (
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </>
);

const QuickViewContent: React.FC = () => {
  const { quickViewProduct, closeQuickView } = useUI();
  const { addItem } = useCart();
  const { fire } = useSpark();

  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNote('');
    setQuantity(1);
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const toneNum = ((PRODUCTS.findIndex(p => p.id === quickViewProduct.id) % 4) + 1) || 1;

  const handleAddToCart = () => {
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect();
      fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    addItem(quickViewProduct, quantity, note);
    setTimeout(() => {
      closeQuickView();
    }, 450);
  };

  return (
    <div className="quickview__inner">
      <button
        type="button"
        className="quickview__close"
        id="qvCloseBtn"
        aria-label="Close"
        onClick={closeQuickView}
      >
        &times;
      </button>

      <span className="product-badge-pill" id="qvBadge">
        {quickViewProduct.badge}
      </span>

      <div className="quickview__grid">
        <div className="quickview__media" id="qvMedia">
          <div className={`quickview__img-box quickview__img-box--tone-${toneNum}`}>
            <svg
              className="quickview__watermark"
              width="96"
              height="96"
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
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        <div className="quickview__details">
          <h2 className="quickview__name" id="qv-title">
            {quickViewProduct.name}
          </h2>
          <div className="quickview__price" id="qvPrice">
            ₹{inrFormatter.format(quickViewProduct.price)}
          </div>
          <p className="quickview__desc" id="qvDesc">
            {quickViewProduct.description}
          </p>

          <div className="quickview__personalization">
            <label htmlFor="qv-note" className="quickview__field-label">
              PERSONALIZE IT
            </label>
            <input
              type="text"
              id="qv-note"
              maxLength={120}
              placeholder="Name, date or a short message (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="quickview__counter" id="qvCounter">
              {note.length}/120
            </div>
          </div>

          <div className="quickview__stepper-row">
            <span className="quickview__field-label">QUANTITY</span>
            <div className="quickview__stepper">
              <button
                type="button"
                className="stepper-btn"
                id="qvMinusBtn"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                −
              </button>
              <span className="stepper-value" id="qvQtyValue">
                {quantity}
              </span>
              <button
                type="button"
                className="stepper-btn"
                id="qvPlusBtn"
                aria-label="Increase quantity"
                onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
              >
                +
              </button>
            </div>
          </div>

          <button
            ref={addBtnRef}
            type="button"
            className="quickview__add-btn"
            id="qvAddBtn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuickView: React.FC = () => {
  const { activePanel, closeQuickView, quickViewProduct } = useUI();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = activePanel === 'quickview' && quickViewProduct !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle native dialog cancel event (Esc)
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    closeQuickView();
  };

  // Close on backdrop click
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeQuickView();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="quickview"
      id="quickViewDialog"
      aria-labelledby="qv-title"
      onCancel={handleCancel}
      onClick={handleClick}
    >
      {/* Nested SparkProvider inside dialog so sparks render in browser top layer */}
      <SparkProvider isDialog={true}>
        <QuickViewContent />
      </SparkProvider>
    </dialog>
  );
};

export default QuickView;
