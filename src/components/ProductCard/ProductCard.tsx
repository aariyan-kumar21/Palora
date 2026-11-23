import React from 'react';
import { Product } from '../../data/types';
import { useUI } from '../../context/UIContext';
import { useSaved } from '../../context/SavedContext';
import { useSpark } from '../ClickSpark/SparkContext';

const inrFormatter = new Intl.NumberFormat('en-IN');

const GIFT_WATERMARK_SVG = (
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </>
);

export interface ProductCardProps {
  product: Product;
  index: number;
  variant?: 'slider' | 'catalogue';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  variant = 'slider'
}) => {
  const { openQuickView } = useUI();
  const { isSaved, toggleSaved } = useSaved();
  const { fire } = useSpark();

  const toneNum = (index % 4) + 1;
  const wishlisted = isSaved(product.id);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    openQuickView(product, e.currentTarget);
  };

  const handleHeartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (!wishlisted) {
      // Fire sparks from the center of the heart button
      const rect = btn.getBoundingClientRect();
      fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    toggleSaved(product.id);
  };

  if (variant === 'catalogue') {
    return (
      <article
        className="product-card product-card--catalogue"
        data-product-id={product.id}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`View details for ${product.name}`}
        onClick={handleCardClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openQuickView(product, e.currentTarget);
          }
        }}
      >
        <div className={`product-card__img-box product-card__img-box--tone-${toneNum}`}>
          <svg
            className="product-card__watermark"
            width="72"
            height="72"
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
            src={product.image}
            alt={product.name}
            loading="lazy"
            draggable="false"
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="product-badge-pill">{product.badge}</span>
          <button
            type="button"
            className="wish wish--catalogue"
            data-product-id={product.id}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleHeartClick}
          >
            <svg
              className="wish-heart-svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={wishlisted ? '#722F37' : 'none'}
              stroke={wishlisted ? '#722F37' : '#6A1F2C'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="product-card__body">
          <h3 className="product-card__name">
            <button
              type="button"
              className="product-card__open"
              data-product-id={product.id}
              aria-label={`Quick view for ${product.name}`}
            >
              {product.name}
            </button>
          </h3>
          <div className="product-card__price-row">
            <span className="product-card__price">₹{inrFormatter.format(product.price)}</span>
          </div>
        </div>
      </article>
    );
  }

  // Slider / Default variant (Homepage bestsellers)
  return (
    <article
      className="product-card"
      data-product-id={product.id}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`View details for ${product.name}`}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openQuickView(product, e.currentTarget);
        }
      }}
    >
      <div className={`product-card__img-box product-card__img-box--tone-${toneNum}`}>
        <div className="product-card__watermark" aria-hidden="true">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFF7F2"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {GIFT_WATERMARK_SVG}
          </svg>
        </div>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          draggable="false"
          onError={e => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span className="product-badge-pill">{product.badge}</span>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">
          <button
            type="button"
            className="product-card__open"
            data-product-id={product.id}
            aria-label={`Quick view for ${product.name}`}
          >
            {product.name}
          </button>
        </h3>
        <div className="product-card__price-row">
          <span className="product-card__price">₹{inrFormatter.format(product.price)}</span>
          <button
            type="button"
            className="wish"
            data-product-id={product.id}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleHeartClick}
          >
            <svg
              className="wish-heart-svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={wishlisted ? '#722F37' : 'none'}
              stroke={wishlisted ? '#722F37' : '#6A1F2C'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
