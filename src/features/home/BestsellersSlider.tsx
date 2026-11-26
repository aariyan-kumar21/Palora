import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { AnimatedContent } from '../../components/AnimatedContent/AnimatedContent';

export const BestsellersSlider: React.FC = () => {
  const featuredProducts = PRODUCTS.filter(p => p.featured);
  const trackRef = useRef<HTMLDivElement>(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);
  const hasCaptured = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDown.current = true;
    hasDragged.current = false;
    hasCaptured.current = false;
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0);
    scrollLeft.current = trackRef.current?.scrollLeft || 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDown.current || !trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
      trackRef.current.classList.add('is-dragging');
      if (!hasCaptured.current) {
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          hasCaptured.current = true;
        } catch (_) {}
      }
    }
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    isDown.current = false;
    if (hasCaptured.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      hasCaptured.current = false;
    }
    setTimeout(() => {
      hasDragged.current = false;
      trackRef.current?.classList.remove('is-dragging');
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
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

        <AnimatedContent distance={66} duration={0.85} threshold={0.1} once={false}>
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
              onClickCapture={handleClickCapture}
            >
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} variant="slider" />
              ))}
            </div>
          </div>
        </AnimatedContent>

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
