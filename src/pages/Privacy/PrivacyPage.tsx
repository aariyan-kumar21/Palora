import React from 'react';
import { Footer } from '../../components/Footer/Footer';
import { AnimatedContent } from '../../components/AnimatedContent/AnimatedContent';
import { Icon } from '../../components/Icon/Icon';
import { usePageMeta } from '../../hooks/usePageMeta';
import { hasWhatsApp, waLink, INSTAGRAM_URL, INSTAGRAM_HANDLE, EMAIL } from '../../data/config';
import '../../styles/pages.css';

export const PrivacyPage: React.FC = () => {
  usePageMeta(
    'Privacy Policy | Palora',
    'A plain-language summary of how Palora handles your information, orders, and browser storage.',
    'privacy'
  );

  return (
    <main id="main">
      {/* Top Hero Banner */}
      <section className="page-banner" aria-label="Privacy Policy">
        <div className="container page-banner__inner">
          <div className="page-banner__content">
            <span className="page-banner__eyebrow">PRIVACY</span>
            <h1 className="page-banner__heading">Privacy Policy</h1>
            <p className="page-banner__subtext">
              A plain-language summary of how this website handles your information.
            </p>
          </div>
          <div className="page-banner__media" aria-hidden="true">
            <img src="/assets/hero.png" alt="" className="page-banner__img" />
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="page-section">
        <div className="container">
          <div className="privacy-container page-copy">
            <section className="privacy-section">
              <h2 className="privacy-section__heading">The short version</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>
                  This website does not ask you to create an account and does not collect payments. We only receive what you choose to send us when you place an order or message us.
                </p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">What stays in your browser</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>
                  Your cart and the products you save are stored in your own browser so they are still there when you come back. They are not sent to us. You can clear them at any time by clearing your browser data.
                </p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">What we receive when you order</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>
                  When you send an order on WhatsApp, we receive the message you send, which can include your name, address, contact details and personalization notes. We use it only to prepare, confirm and deliver your order and to reply to you.
                </p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">Payments</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>This website does not process or store payment details.</p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">Third-party services</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>
                  Ordering and messaging happen on WhatsApp and Instagram, which have their own privacy policies. The fonts on this website are loaded from Google Fonts.
                </p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">Cookies and tracking</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>We do not use advertising or tracking cookies on this website.</p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">Your choices</h2>
              <AnimatedContent distance={30} duration={0.65} threshold={0.1}>
                <p>
                  To ask us to delete the details you have shared with us, message us on WhatsApp or Instagram.
                </p>
              </AnimatedContent>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section__heading">Contact</h2>
              <AnimatedContent distance={30} duration={0.65} stagger={0.07} threshold={0.1}>
                <p>We are easiest to reach on WhatsApp or Instagram.</p>
                <div className="contact-rows-list">
                  {hasWhatsApp() && (
                    <div className="contact-row-item">
                      <a
                        href={waLink('Hi Palora! I have a question regarding privacy.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-burgundy"
                      >
                        <Icon name="whatsapp" size={20} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {INSTAGRAM_URL && (
                    <div className="contact-row-item">
                      <span className="contact-row-icon" aria-hidden="true">
                        <Icon name="instagram" size={24} />
                      </span>
                      <span>
                        Instagram:{' '}
                        <a
                          href={INSTAGRAM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-row-link"
                        >
                          @{INSTAGRAM_HANDLE}
                        </a>
                      </span>
                    </div>
                  )}

                  {EMAIL && (
                    <div className="contact-row-item">
                      <span className="contact-row-icon" aria-hidden="true">
                        <Icon name="mail" size={24} />
                      </span>
                      <span>
                        Email:{' '}
                        <a href={`mailto:${EMAIL}`} className="contact-row-link">
                          {EMAIL}
                        </a>
                      </span>
                    </div>
                  )}

                  <div className="contact-row-item">
                    <span className="contact-row-icon" aria-hidden="true">
                      <Icon name="truck" size={24} />
                    </span>
                    <span>Delivering across India</span>
                  </div>
                </div>
              </AnimatedContent>
            </section>

            <p className="privacy-updated">Last updated: November 2026</p>
          </div>
        </div>
      </section>

      {/* Global Shared Footer */}
      <Footer />
    </main>
  );
};

export default PrivacyPage;
