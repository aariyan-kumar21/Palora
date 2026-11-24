import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { countInCategory } from '../../data/products';
import { Icon } from '../Icon/Icon';

const PALETTES = [
  'linear-gradient(135deg, #F6D3D9 0%, #E8A8B4 100%)',
  'linear-gradient(135deg, #F2CAD2 0%, #DF9EA9 100%)',
  'linear-gradient(135deg, #EFC1CB 0%, #D894A0 100%)',
  'linear-gradient(135deg, #EDB8C3 0%, #D08996 100%)',
  'linear-gradient(135deg, #EAAFB8 0%, #C87E8C 100%)'
];

export const DepthCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);

  const total = CATEGORIES.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<any>(null);
  const resumeTimerRef = useRef<any>(null);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const hasDragged = useRef(false);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const goToIndex = useCallback(
    (index: number) => {
      setActiveIndex((index + total) % total);
    },
    [total]
  );

  const prev = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);
  const next = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);

  // IntersectionObserver to pause when off-screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance 3.5s
  useEffect(() => {
    if (reducedMotion || isPaused || isHovered || isFocused || isDragging || !isIntersecting) {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      return;
    }

    autoTimerRef.current = setInterval(() => {
      goToIndex(activeIndex + 1);
    }, 3500);

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [activeIndex, reducedMotion, isPaused, isHovered, isFocused, isDragging, isIntersecting, goToIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToIndex(total - 1);
    }
  };

  // Drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
    if (Math.abs(dragDeltaX.current) > 10) {
      hasDragged.current = true;
    }
    if (Math.abs(dragDeltaX.current) >= 90) {
      if (dragDeltaX.current > 0) {
        prev();
      } else {
        next();
      }
      dragStartX.current = e.clientX;
      dragDeltaX.current = 0;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  return (
    <div
      ref={rootRef}
      className="depth-carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      aria-label="Category Carousel"
    >
      {/* 3D Stage */}
      <div
        ref={stageRef}
        className="depth__stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {CATEGORIES.map((cat, idx) => {
          let d = (idx - activeIndex) % total;
          if (d > Math.floor(total / 2)) d -= total;
          if (d < -Math.floor(total / 2)) d += total;

          const abs = Math.abs(d);
          const tx = d * 230;
          const tz = -abs * 130;
          const ry = -d * 16;
          const scale = Math.max(0.2, 1 - abs * 0.06);

          let opacity = 0;
          if (abs === 0) opacity = 1;
          else if (abs === 1) opacity = 0.95;
          else if (abs === 2) opacity = 0.75;
          else if (abs === 3) opacity = 0.45;

          const brightness = Math.max(0.1, 1 - abs * 0.18);
          const zIndex = 100 - abs;
          const count = countInCategory(cat.slug);
          const countText = count === 1 ? '1 PIECE' : `${count} PIECES`;
          const bgGrad = PALETTES[idx % PALETTES.length];

          const isCardActive = abs === 0;

          return (
            <Link
              key={cat.slug}
              to={`/collections?category=${cat.slug}`}
              className={`depth-card ${isCardActive ? 'is-active' : ''}`}
              aria-label={`${cat.label}, ${countText.toLowerCase()}`}
              tabIndex={isCardActive ? 0 : -1}
              style={{
                transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`,
                opacity,
                zIndex,
                filter: `brightness(${brightness})`,
                pointerEvents: abs > 3 ? 'none' : 'auto'
              }}
              onClick={e => {
                if (hasDragged.current) {
                  e.preventDefault();
                  return;
                }
                if (!isCardActive) {
                  e.preventDefault();
                  goToIndex(idx);
                }
              }}
            >
              <div className="depth-card__placeholder" style={{ background: bgGrad }}>
                <div className="depth-card__faint-icon">
                  <Icon name={(cat.icon as any) || 'gift'} size={96} strokeWidth={1.2} />
                </div>
              </div>
              <img
                className="depth-card__img"
                src={`/assets/categories/${cat.slug}.jpg`}
                alt=""
                loading="lazy"
                draggable={false}
                onError={e => {
                  (e.target as HTMLElement).remove();
                }}
              />
              <div className="depth-card__overlay" />
              <div className="depth-card__content">
                <span className="depth-card__count">{countText}</span>
                <h3 className="depth-card__title">{cat.label}</h3>
                <span className="depth-card__explore">
                  EXPLORE
                  <svg
                    width="18"
                    height="10"
                    viewBox="0 0 18 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 5h16M12 1l5 4-5 4" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Controls: Dots + Pause/Play */}
      <div className="depth__controls">
        <div className="depth__dots" role="tablist" aria-label="Category slides">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.slug}
              type="button"
              className={`depth-dot ${idx === activeIndex ? 'is-active' : ''}`}
              aria-label={`Go to ${cat.label}`}
              aria-current={idx === activeIndex ? 'true' : undefined}
              onClick={() => goToIndex(idx)}
            />
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className="depth__pause-btn"
            aria-label={isPaused ? 'Play auto-advance' : 'Pause auto-advance'}
            aria-pressed={isPaused}
            onClick={() => setIsPaused(prev => !prev)}
          >
            <Icon name={isPaused ? 'play' : 'pause'} size={18} />
          </button>
        )}
      </div>

      {/* Footer Link */}
      <div className="depth__footer">
        <Link className="link-arrow link-arrow--cream" to="/collections">
          View all products
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

      {/* Accessibility live region */}
      <div className="sr-only depth__announcer" aria-live="polite">
        {CATEGORIES[activeIndex]?.label}, {activeIndex + 1} of {total}
      </div>
    </div>
  );
};

export default DepthCarousel;
