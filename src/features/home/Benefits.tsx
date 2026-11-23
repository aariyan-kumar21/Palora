import React from 'react';

export const Benefits: React.FC = () => {
  return (
    <section className="value-bar" id="benefits" aria-labelledby="benefits-title">
      <h2 className="sr-only" id="benefits-title">Our Benefits</h2>
      <div className="container value-bar-container">
        {/* Prop 1: Customizable Gift */}
        <div className="value-item">
          <div className="value-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="6" y="17" width="36" height="8" rx="2" />
              <path d="M9 25v15a2 2 0 0 0 2 2h26a2 2 0 0 0 2-2V25" />
              <path d="M24 17v25" />
              <path d="M24 17c-4 0-9.5-1-9.5-4.5 0-3 4-3.5 6.3-1.3C22.8 13 24 17 24 17Z" />
              <path d="M24 17c4 0 9.5-1 9.5-4.5 0-3-4-3.5-6.3-1.3C25.2 13 24 17 24 17Z" />
            </svg>
          </div>
          <div className="value-text">
            <h3 className="value-title">Customizable Gift</h3>
            <p className="value-desc">Add a personal touch to every gift.</p>
          </div>
        </div>

        <div className="value-divider" aria-hidden="true" />

        {/* Prop 2: Handmade Gifts */}
        <div className="value-item">
          <div className="value-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
              <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
              <path d="m2 15 6 6" />
              <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" />
            </svg>
          </div>
          <div className="value-text">
            <h3 className="value-title">Handmade Gifts</h3>
            <p className="value-desc">Crafted with care and attention.</p>
          </div>
        </div>

        <div className="value-divider" aria-hidden="true" />

        {/* Prop 3: Pan India Shipping */}
        <div className="value-item">
          <div className="value-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
          </div>
          <div className="value-text">
            <h3 className="value-title">Pan India Shipping</h3>
            <p className="value-desc">Delivering happiness to your doorstep.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
