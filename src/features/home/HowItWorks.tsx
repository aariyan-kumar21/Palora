import React from 'react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  return (
    <section className="how-it-works" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="container how-it-works__header">
        <span className="how-it-works__eyebrow">SIMPLE &amp; PERSONAL</span>
        <h2 className="how-it-works__title title-lined" id="how-it-works-title">
          How Ordering Works
        </h2>
      </div>

      <div className="container how-it-works__grid">
        <div className="how-it-works__col">
          <span className="how-it-works__num">01</span>
          <h3 className="how-it-works__col-title">Choose</h3>
          <p className="how-it-works__col-text">Browse our categories and pick the piece you love.</p>
        </div>

        <div className="how-it-works__divider" aria-hidden="true" />

        <div className="how-it-works__col">
          <span className="how-it-works__num">02</span>
          <h3 className="how-it-works__col-title">Personalize</h3>
          <p className="how-it-works__col-text">
            Add a name, message or colour preference. We'll make it yours.
          </p>
        </div>

        <div className="how-it-works__divider" aria-hidden="true" />

        <div className="how-it-works__col">
          <span className="how-it-works__num">03</span>
          <h3 className="how-it-works__col-title">Confirm on WhatsApp</h3>
          <p className="how-it-works__col-text">
            Send your order on WhatsApp. We confirm the details, delivery time and payment with you.
          </p>
        </div>
      </div>

      <div className="container how-it-works__footer">
        <Link className="link-arrow" to="/help#how-to-order">
          Learn more{' '}
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
    </section>
  );
};

export default HowItWorks;
