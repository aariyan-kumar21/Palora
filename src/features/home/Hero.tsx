import React from 'react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      {/* Vertical Scroll Down Indicator (Left) */}
      <a
        href="#bestsellers"
        className="hero__scroll hero__scroll-vertical"
        aria-label="Scroll to Bestselling Collection"
      >
        <span className="hero__scroll-text">SCROLL</span>
        <span className="hero__scroll-line" aria-hidden="true" />
        <svg
          className="hero__scroll-arrow"
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M7 1v12M2 8l5 5 5-5" />
        </svg>
      </a>

      {/* Hero Background Image */}
      <img
        className="hero__bg"
        src="/assets/hero.png"
        srcSet="/assets/hero-mobile.jpg 800w, /assets/hero.png 1615w"
        sizes="(max-width: 767.98px) 100vw, 85vw"
        alt="Gift box with a burgundy satin ribbon and a Palora monogram tag, beside a candle and flowers"
        width={1615}
        height={868}
        fetchPriority="high"
        onError={e => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      <div className="hero__content">
        <div className="hero__text-inner">
          <div className="hero__eyebrow-wrap">
            <span className="hero__eyebrow">THOUGHTFUL GIFTS FOR EVERY OCCASION</span>
            <span className="hero__eyebrow-line" aria-hidden="true" />
          </div>
          <h1 className="hero-heading" id="hero-title">
            MAKE EVERY<br />
            MOMENT<br />
            <em>SPECIAL.</em>
          </h1>
          <p className="hero-subtext">
            Customizable, handmade gifts that turn simple moments into lasting memories.
          </p>
          <div className="hero-cta-wrapper">
            <Link className="hero__cta link-arrow" to="/collections">
              <span>EXPLORE OUR COLLECTIONS</span>
              <svg
                width="64"
                height="12"
                viewBox="0 0 64 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M1 6h61M57 1.5 62 6l-5 4.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
