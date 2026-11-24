import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../../components/ProductCard/ProductCard';

export const BestsellersSlider: React.FC = () => {
  const featuredProducts = PRODUCTS.filter(p => p.featured);
  const trackRef = useRef<HTMLDivElement>(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0);
    scrollLeft.current = trackRef.current?.scrollLeft || 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDown.current || !trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
      trackRef.current.classList.add('is-dragging');
    }
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    isDown.current = false;
    setTimeout(() => {
      trackRef.current?.classList.remove('is-dragging');
    }, 50);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <section className="bestsellers" id="bestsellers" aria-labelledby="bestsellers-title">
      <div className="container">
        <div className="bestsellers__header">
          <span className="bestsellers__eyebrow">CURATED FOR YOU</span>
          <h2 className="bestsellers__title title-lined" id="bestsellers-title">
            Bestselling Collection
          </h2>
        </div>

        <div
          className="bestsellers__slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Bestselling products"
        >
          <div
            ref={trackRef}
            className="bestsellers__track"
            id="bestsellerTrack"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {featuredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} variant="slider" />
            ))}
          </div>
        </div>

        {/* Centered View All Link below Slider */}
        <div className="bestsellers__footer">
          <Link className="link-arrow" to="/collections">
            View all products{' '}
            <svg
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M1 6h14M11 1.5 15.5 6 11 10.5" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestsellersSlider;
