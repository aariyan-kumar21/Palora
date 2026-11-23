import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer/Footer';
import { Icon } from '../../components/Icon/Icon';
import { usePageMeta } from '../../hooks/usePageMeta';
import { hasWhatsApp, waLink } from '../../data/config';
import '../../styles/pages.css';
import '../../styles/story.css';

export const StoryPage: React.FC = () => {
  usePageMeta(
    'Our Story | Palora',
    'Palora is a handmade gifting brand built on one simple idea: the best gifts feel personal. Learn why we make what we make and how each piece comes to life.'
  );

  return (
    <main id="main">
      {/* Top Hero Banner */}
      <section className="page-banner" aria-label="Our Story">
        <div className="container page-banner__inner">
          <div className="page-banner__content">
            <span className="page-banner__eyebrow">OUR STORY</span>
            <h1 className="page-banner__heading">Made by Hand, Given with Love</h1>
            <p className="page-banner__subtext">
              Palora is a handmade gifting brand built on one simple idea: the best gifts feel personal.
            </p>
          </div>
          <div className="page-banner__media" aria-hidden="true">
            <img src="/assets/hero.png" alt="" className="page-banner__img" />
          </div>
        </div>
      </section>

      {/* Section 1: Why we make what we make */}
      <section className="page-section story-why" aria-labelledby="story-why-heading">
        <div className="container">
          <div className="story-why-grid">
            <div className="story-why-content page-copy">
              <h2 id="story-why-heading" className="story-section-title">
                Why we make what we make
              </h2>
              <p>
                Gifts are never really about the gift. They are about the moment, the person, and the small detail that shows you were thinking of them.
              </p>
              <p>
                That is what we make at Palora: handmade pieces designed to be made personal, so that what you give carries a name, a message or a memory only you know.
              </p>
              <p>
                From keychains and photo frames to bouquets, hampers and cards, every piece begins as an idea for a particular moment: a birthday, an anniversary, a festival, or no reason at all.
              </p>
            </div>
            <div className="story-media-placeholder">
              <div className="story-media-watermark" aria-hidden="true">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <img
                src="/assets/story/story-1.jpg"
                alt=""
                className="story-media-img"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How each piece comes to life */}
      <section className="page-section story-process" aria-labelledby="story-process-heading">
        <div className="container">
          <div className="story-process-header">
            <h2 id="story-process-heading" className="story-section-title title-lined">
              How each piece comes to life
            </h2>
          </div>
          <div className="story-process-grid">
            <div className="story-process-card">
              <span className="story-process-num">01</span>
              <h3 className="story-process-card-title">Made to order</h3>
              <p className="story-process-card-body">
                Your piece is made after you place your order, so it can be made just for you.
              </p>
            </div>
            <div className="story-process-card">
              <span className="story-process-num">02</span>
              <h3 className="story-process-card-title">Made by hand</h3>
              <p className="story-process-card-body">
                Each piece is crafted by hand, with attention to the small details that make a gift feel cared for.
              </p>
            </div>
            <div className="story-process-card">
              <span className="story-process-num">03</span>
              <h3 className="story-process-card-title">Made personal</h3>
              <p className="story-process-card-body">
                Add a name, a message or a colour preference. We work with you on WhatsApp so every detail is right before we begin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What we believe */}
      <section className="page-section story-beliefs" aria-labelledby="story-beliefs-heading">
        <div className="container">
          <div className="story-beliefs-header">
            <h2 id="story-beliefs-heading" className="story-section-title title-lined">
              What we believe
            </h2>
          </div>
          <div className="story-beliefs-grid">
            <div className="story-belief-card">
              <div className="story-belief-icon-box" aria-hidden="true">
                <Icon name="leaf" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="story-belief-card-title">Handmade with care</h3>
              <p className="story-belief-card-body">Every piece is crafted by hand, with time and attention.</p>
            </div>

            <div className="story-belief-card">
              <div className="story-belief-icon-box" aria-hidden="true">
                <Icon name="heart" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="story-belief-card-title">Personal, always</h3>
              <p className="story-belief-card-body">Names, messages and colours turn a gift into your gift.</p>
            </div>

            <div className="story-belief-card">
              <div className="story-belief-icon-box" aria-hidden="true">
                <Icon name="gift" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="story-belief-card-title">Thoughtful details</h3>
              <p className="story-belief-card-body">The small touches are the ones people remember.</p>
            </div>

            <div className="story-belief-card">
              <div className="story-belief-icon-box" aria-hidden="true">
                <Icon name="flower" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="story-belief-card-title">Made to be cherished</h3>
              <p className="story-belief-card-body">We make things to be kept, displayed and remembered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band Section */}
      <section className="page-section story-cta" aria-label="Find your gift">
        <div className="container">
          <div className="cta-band">
            <h2 className="cta-band__heading">Have something special in mind?</h2>
            <p className="cta-band__text">
              Tell us about the moment, and we will help you find or create the perfect gift.
            </p>
            <div className="cta-band__actions" id="storyCtaActions">
              <Link to="/collections" className="btn btn-burgundy">
                Explore Collections
              </Link>
              {hasWhatsApp() && (
                <a
                  href={waLink('Hi Palora! I have a gift in mind.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-burgundy"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Global Shared Footer */}
      <Footer />
    </main>
  );
};

export default StoryPage;
