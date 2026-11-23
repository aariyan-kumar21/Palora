import React, { useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { useSaved } from '../../context/SavedContext';
import { PRODUCTS } from '../../data/products';

const inrFormatter = new Intl.NumberFormat('en-IN');

export const SavedPanel: React.FC = () => {
  const { activePanel, closePanel, openQuickView } = useUI();
  const { savedIds, toggleSaved } = useSaved();
  const isOpen = activePanel === 'saved';
  const panelRef = useRef<HTMLElement>(null);

  // Esc and outside-click handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
        document.getElementById('savedBtn')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  const savedProducts = PRODUCTS.filter(p => savedIds.includes(p.id));

  return (
    <>
      <div
        className={`saved-overlay ${isOpen ? 'open' : ''}`}
        id="savedOverlay"
        aria-hidden={!isOpen}
        hidden={!isOpen}
        onClick={closePanel}
      />

      <aside
        ref={panelRef}
        className={`saved-panel ${isOpen ? 'open' : ''}`}
        id="savedPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="savedHeading"
        aria-hidden={!isOpen}
        hidden={!isOpen}
      >
        <div className="saved-header">
          <div className="saved-header-title">
            <h2 className="saved-heading" id="savedHeading">Saved items</h2>
            <span className="saved-count-chip" id="savedHeaderCount">
              {savedIds.length} {savedIds.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            type="button"
            className="saved-close-btn"
            id="savedCloseBtn"
            aria-label="Close saved items"
            onClick={closePanel}
          >
            &times;
          </button>
        </div>

        {savedProducts.length === 0 ? (
          <div className="saved-empty" id="savedEmpty" style={{ display: 'flex' }}>
            <div className="saved-empty-art">🌸</div>
            <p className="saved-empty-text">Nothing saved yet. Tap the heart on any product to keep it here.</p>
          </div>
        ) : (
          <div className="saved-body" id="savedBody" style={{ display: 'block' }}>
            <ul className="saved-items-list" id="savedItemsList">
              {savedProducts.map(product => {
                const toneNum = ((PRODUCTS.findIndex(p => p.id === product.id) % 4) + 1) || 1;
                return (
                  <li key={product.id} className="saved-item" data-product-id={product.id}>
                    <div className={`saved-item-media saved-item-media--tone-${toneNum}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="saved-item-info">
                      <div className="saved-item-name">{product.name}</div>
                      <div className="saved-item-price">₹{inrFormatter.format(product.price)}</div>
                      <div className="saved-item-actions">
                        <button
                          type="button"
                          className="saved-view-btn"
                          onClick={() => {
                            closePanel();
                            openQuickView(product, null);
                          }}
                        >
                          Quick view
                        </button>
                        <button
                          type="button"
                          className="saved-remove-btn"
                          aria-label={`Remove ${product.name} from saved items`}
                          onClick={() => toggleSaved(product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>
    </>
  );
};

export default SavedPanel;
