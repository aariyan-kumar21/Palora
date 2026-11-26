import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer/Footer';
import { usePageMeta } from '../../hooks/usePageMeta';
import '../../styles/pages.css';

export const NotFoundPage: React.FC = () => {
  usePageMeta('Page Not Found | Palora', 'The page you were looking for could not be found.');

  return (
    <main id="main">
      <section className="page-banner" aria-label="Page not found">
        <div className="container page-banner__inner">
          <div className="page-banner__content">
            <span className="page-banner__eyebrow">404</span>
            <h1 className="page-banner__heading">Page Not Found</h1>
            <p className="page-banner__subtext">
              The page you are looking for doesn't exist, has been removed, or has moved.
            </p>
          </div>
          <div className="page-banner__media" aria-hidden="true">
            <img src="/assets/hero.png" alt="" className="page-banner__img" />
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container notfound-body">
          <p className="notfound-lead">
            Looking for thoughtful, customizable handmade gifts?
          </p>
          <div className="notfound-actions">
            <Link to="/" className="btn btn-burgundy">
              Return Home
            </Link>
            <Link to="/collections" className="btn btn-outline-burgundy">
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default NotFoundPage;
