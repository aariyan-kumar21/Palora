import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { CATEGORIES } from '../../data/categories';
import { countInCategory } from '../../data/products';
import { Icon } from '../Icon/Icon';
import './DepthCarousel.css';

const PALETTES = [
  'linear-gradient(135deg, #F6D3D9 0%, #E8A8B4 100%)',
  'linear-gradient(135deg, #F2CAD2 0%, #DF9EA9 100%)',
  'linear-gradient(135deg, #EFC1CB 0%, #D894A0 100%)',
  'linear-gradient(135deg, #EDB8C3 0%, #D08996 100%)',
  'linear-gradient(135deg, #EAAFB8 0%, #C87E8C 100%)'
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export interface DepthCarouselProps {
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export const DepthCarousel: React.FC<DepthCarouselProps> = ({
  cardWidth = 310,
  cardHeight = 410,
  radius = 18,
  tint = '#3A1018',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  autoplay = true,
  autoplayDelay = 3200,
  loop = true,
  showIndicators = true,
  className = ''
}) => {
  const navigate = useNavigate();

  const data = useMemo(
    () =>
      CATEGORIES.map((cat, idx) => {
        const count = countInCategory(cat.slug);
        return {
          ...cat,
          image: `/assets/categories/${cat.slug}.jpg`,
          countText: count === 1 ? '1 PIECE' : `${count} PIECES`,
          bgGrad: PALETTES[idx % PALETTES.length]
        };
      }),
    []
  );
  const count = data.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef({
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay
  });

  const dragRef = useRef<{
    x: number;
    startPos: number;
    lastX: number;
    lastT: number;
    v: number;
    moved: boolean;
    id: number;
  } | null>(null);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedRef = useRef(false);

  const [active, setActive] = useState(0);

  cfgRef.current = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay
  };

  const layout = useCallback((pos: number) => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = scaleRef.current;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= cfg.visibleCards + 0.5;

      const tz = -cfg.depth * d;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.2, 1 - back * cfg.falloff);
      const blurPx =
        cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(
        2
      )}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = overlayRefs.current[i];
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.1, 0, 0.75).toFixed(3);
    }
  }, []);

  const tweenTo = useCallback(
    (target: number, animate: boolean) => {
      tweenRef.current?.kill();
      const cfg = cfgRef.current;
      const proxy = { p: posRef.current };
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0;
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p;
          layout(proxy.p);
        },
        onComplete: () => {
          const n = cfg.count;
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n;
          layout(posRef.current);
        }
      });
    },
    [layout]
  );

  const setFocus = useCallback(
    (rawIndex: number, animate = true) => {
      const cfg = cfgRef.current;
      const n = cfg.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      let delta = idx - posRef.current;
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      tweenTo(posRef.current + delta, animate);
      if (idx !== focusRef.current) {
        focusRef.current = idx;
        setActive(idx);
      }
    },
    [tweenTo]
  );

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const cfg = cfgRef.current;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120;
      scaleRef.current = clamp(w / needed, 0.4, 1);
      layout(posRef.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  // Smooth horizontal wheel / trackpad gesture scrolling (without hijacking normal vertical page scroll)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const cfg = cfgRef.current;
      if (cfg.count < 2) return;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!isHorizontal) return;
      e.preventDefault();
      tweenRef.current?.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [layout, setFocus]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const cfg = cfgRef.current;
    if (cfg.count < 2 || e.button !== 0) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId
    };
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const cfg = cfgRef.current;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        try {
          rootRef.current?.setPointerCapture(drag.id);
        } catch (_) {}
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      posRef.current = drag.startPos - dx / stepPx;
      layout(posRef.current);
    },
    [layout]
  );

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    const wasMoved = drag.moved;
    if (wasMoved) {
      try {
        rootRef.current?.releasePointerCapture(drag.id);
      } catch (_) {}
    }
    dragRef.current = null;
    if (!wasMoved) return;
    const cfg = cfgRef.current;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [setFocus]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateBy(1);
      }
    },
    [navigateBy]
  );

  const onCardClick = useCallback(
    (index: number, slug: string) => {
      if (dragRef.current?.moved) return;
      if (focusRef.current === index) {
        navigate(`/collections?category=${slug}`);
      } else {
        setFocus(index, true);
      }
    },
    [navigate, setFocus]
  );

  useEffect(() => {
    reducedRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    const wrap = root?.parentElement;
    let hovered = false;
    let focused = false;
    let inView = true;

    let io: IntersectionObserver | null = null;
    if (wrap && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
      });
      io.observe(wrap);
    }

    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = setInterval(() => {
        if (!hovered && !focused && inView) navigateBy(1);
      }, Math.max(cfgRef.current.autoplayDelay, 600));
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };
    wrap?.addEventListener('mouseenter', onEnter);
    wrap?.addEventListener('mouseleave', onLeave);
    wrap?.addEventListener('focusin', onFocusIn);
    wrap?.addEventListener('focusout', onFocusOut);
    start();
    return () => {
      stop();
      io?.disconnect();
      wrap?.removeEventListener('mouseenter', onEnter);
      wrap?.removeEventListener('mouseleave', onLeave);
      wrap?.removeEventListener('focusin', onFocusIn);
      wrap?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count]);

  useEffect(
    () => () => {
      tweenRef.current?.kill();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    },
    []
  );

  return (
    <div className={`rb-depth-carousel-wrap ${className}`.trim()}>
      <div
        ref={rootRef}
        className="rb-depth-carousel"
        style={{ '--dc-perspective': `${perspective}px` } as React.CSSProperties}
        role="group"
        aria-roledescription="carousel"
        aria-label="Category Carousel"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        <div className="rb-depth-carousel__stage">
          {data.map((cat, i) => {
            const isCardActive = active === i;
            return (
              <div
                key={cat.slug}
                className={`rb-depth-carousel__card depth-card ${isCardActive ? 'is-active' : ''}`}
                ref={el => {
                  cardRefs.current[i] = el;
                }}
                style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
                aria-roledescription="slide"
                aria-label={`${cat.label}, ${cat.countText.toLowerCase()}`}
                aria-hidden={!isCardActive}
                onClick={() => onCardClick(i, cat.slug)}
              >
                <div className="depth-card__placeholder" style={{ background: cat.bgGrad }}>
                  <div className="depth-card__faint-icon">
                    <Icon name={(cat.icon as any) || 'gift'} size={96} strokeWidth={1.2} />
                  </div>
                </div>
                <img
                  className="rb-depth-carousel__img"
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  draggable={false}
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="depth-card__overlay" />
                <span
                  className="rb-depth-carousel__tint"
                  ref={el => {
                    overlayRefs.current[i] = el;
                  }}
                  style={{ background: tint }}
                />
                <div className="depth-card__content">
                  <span className="depth-card__count">{cat.countText}</span>
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
              </div>
            );
          })}
        </div>
      </div>

      {showIndicators && count > 1 && (
        <div className="rb-depth-carousel__dots" role="tablist" aria-label="Category slides">
          {data.map((cat, i) => (
            <button
              key={cat.slug}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to ${cat.label}`}
              className={`rb-depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={() => setFocus(i, true)}
            />
          ))}
        </div>
      )}

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
        {data[active]?.label}, {active + 1} of {count}
      </div>
    </div>
  );
};

export default DepthCarousel;
