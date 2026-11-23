import React from 'react';
import { Link } from 'react-router-dom';

export const PersonalizeBanner: React.FC = () => {
  return (
    <section className="personalize" id="personalize" aria-labelledby="personalize-title">
      <div className="container">
        <div className="callout">
          <div className="callout__text">
            <h2 id="personalize-title">Make It Truly Yours</h2>
            <p>
              Add names, messages, colors and more to<br />
              create a gift as unique as your bond.
            </p>
            <Link className="callout__btn" to="/collections">
              Start Personalizing{' '}
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
          <div className="callout__media">
            <img
              src="/assets/personalization.jpg"
              alt="Gift tag with the Palora monogram on a burgundy ribbon"
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src = '/assets/hero.png';
                img.classList.add('is-fallback');
              }}
            />
          </div>
        </div>

        <ul className="trust" aria-label="Our promises">
          <li>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Secure Checkout</span>
          </li>
          <li>
            <svg
              width="24"
              height="24"
              viewBox="8 3 42 42"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15.5 34H15a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v21" />
              <path d="M22.5 34h13" />
              <path d="M31 18h9l6 7.5V31a3 3 0 0 1-3 3h-.5" />
              <path d="M34.5 22H39l3 3.5h-7.5Z" />
              <circle cx="19" cy="34" r="3.5" />
              <circle cx="39" cy="34" r="3.5" />
              <path d="M3 17h5.5M1 23h7.5M3 29h5.5" />
            </svg>
            <span>Reliable Delivery</span>
          </li>
          <li>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
              <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
            </svg>
            <span>Dedicated Support</span>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PersonalizeBanner;
