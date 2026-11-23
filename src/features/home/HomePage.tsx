import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Hero } from './Hero';
import { Benefits } from './Benefits';
import { usePageMeta } from '../../hooks/usePageMeta';
import '../../styles/home.css';

// Lazy-load below-the-fold content (Bestsellers, DepthCarousel, HowItWorks, Personalize, Footer)
const HomeBelowFold = React.lazy(() => import('./HomeBelowFold'));

export const HomePage: React.FC = () => {
  usePageMeta(
    'Palora | Thoughtful Handmade Gifts',
    'Customizable, handmade gifts that turn simple moments into lasting memories. Order directly via WhatsApp.',
    'home'
  );

  const [showBelow, setShowBelow] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return true;
    }
    return false;
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showBelow) return;

    // Check if initial scroll or hash exists
    if (window.scrollY > 100 || window.location.hash) {
      setShowBelow(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setShowBelow(true);
        }
      },
      { rootMargin: '600px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    // Also load on idle so desktop users who pause get instant response
    const idleId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => setShowBelow(true), { timeout: 2000 })
        : window.setTimeout(() => setShowBelow(true), 2000);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as any);
      }
    };
  }, [showBelow]);

  return (
    <main id="main">
      {/* Section 1: Above-the-fold Hero */}
      <Hero />

      {/* Section 2: Value Proposition Bar (Benefits) */}
      <Benefits />

      {/* Lazy Below-The-Fold Section with reserved layout placeholder */}
      {showBelow ? (
        <Suspense fallback={<div style={{ minHeight: '2200px' }} aria-hidden="true" />}>
          <HomeBelowFold />
        </Suspense>
      ) : (
        <div ref={sentinelRef} style={{ minHeight: '2200px' }} aria-hidden="true" />
      )}
    </main>
  );
};

export default HomePage;
