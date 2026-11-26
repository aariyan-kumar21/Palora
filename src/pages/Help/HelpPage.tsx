import React, { useState, useEffect } from 'react';
import { Footer } from '../../components/Footer/Footer';
import { AnimatedContent } from '../../components/AnimatedContent/AnimatedContent';
import { Icon } from '../../components/Icon/Icon';
import { usePageMeta } from '../../hooks/usePageMeta';
import { hasWhatsApp, waLink, INSTAGRAM_URL, INSTAGRAM_HANDLE, EMAIL } from '../../data/config';
import '../../styles/pages.css';

interface FAQ {
  id: string;
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    id: 'faq-how-to-order',
    q: 'How do I place an order?',
    a: 'Add your pieces to the cart, include your personalization notes, and send the order to us on WhatsApp. We confirm everything with you.'
  },
  {
    id: 'faq-personalize',
    q: 'Can I personalize any product?',
    a: 'Many pieces can be personalized. Products with the Personalizable badge are made for it, and you can add a note to any product. If something is not possible, we will tell you on WhatsApp.'
  },
  {
    id: 'faq-deliver-india',
    q: 'Do you deliver across India?',
    a: 'Yes, we deliver across India.'
  },
  {
    id: 'faq-timing',
    q: 'How long will my order take?',
    a: 'Every piece is made to order, so timing depends on the piece and its personalization. We confirm delivery timing with you on WhatsApp when you order.'
  },
  {
    id: 'faq-payment',
    q: 'How do I pay?',
    a: 'We share the payment details with you on WhatsApp when we confirm your order.'
  },
  {
    id: 'faq-cancel',
    q: 'Can I change or cancel my order?',
    a: 'Message us on WhatsApp as soon as possible. Because every piece is made to order, changes are easiest before we begin making it.'
  },
  {
    id: 'faq-bulk',
    q: 'Can I order in bulk or ask for custom colours?',
    a: 'Yes. Tell us what you have in mind on WhatsApp and we will see what we can do for you.'
  }
];

const SECTIONS = [
  { id: 'how-to-order', label: 'How to order' },
  { id: 'personalization', label: 'Personalization' },
  { id: 'shipping', label: 'Shipping & delivery' },
  { id: 'returns', label: 'Returns & personalized orders' },
  { id: 'faqs', label: 'Frequently asked questions' },
  { id: 'contact', label: 'Contact us' }
];

export const HelpPage: React.FC = () => {
  usePageMeta(
    'Help & FAQs | Palora',
    'Everything you need to know about ordering, personalization, delivery across India, returns, and FAQs for Palora handmade gifts.',
    'help'
  );

  const [activeSection, setActiveSection] = useState('how-to-order');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main id="main">
      {/* Top Hero Banner */}
      <section className="page-banner" aria-label="Help and FAQs">
        <div className="container page-banner__inner">
          <div className="page-banner__content">
            <span className="page-banner__eyebrow">HELP &amp; FAQS</span>
            <h1 className="page-banner__heading">How can we help?</h1>
            <p className="page-banner__subtext">
              Everything you need to know about ordering, personalization and delivery.
            </p>
          </div>
          <div className="page-banner__media" aria-hidden="true">
            <img src="/assets/hero.png" alt="" className="page-banner__img" />
          </div>
        </div>
      </section>

      {/* Two-Column Help Section */}
      <section className="page-section">
        <div className="container">
          <div className="help-layout">
            {/* Sticky Left Anchor Navigation Card */}
            <aside className="help-sidebar" aria-label="Help topics navigation">
              <nav className="help-nav" aria-label="Help topics">
                <ul className="help-nav-list">
                  {SECTIONS.map(sec => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className={`help-nav__link ${activeSection === sec.id ? 'active' : ''}`}
                        aria-current={activeSection === sec.id ? 'true' : undefined}
                      >
                        {sec.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Right Content Column */}
            <div className="help-content">
              {/* 1. How to order */}
              <section id="how-to-order" className="help-section" aria-labelledby="heading-how-to-order">
                <h2 id="heading-how-to-order" className="help-section__heading">
                  How to order
                </h2>
                <AnimatedContent distance={63} duration={0.8} stagger={0.09} threshold={0.1} once={false}>
                  <ol className="help-steps">
                    <li className="help-step">
                      <span className="help-step__num">01</span>
                      <p className="help-step__text">
                        Choose the pieces you love and add them to your cart.
                      </p>
                    </li>
                    <li className="help-step">
                      <span className="help-step__num">02</span>
                      <p className="help-step__text">
                        Add your personalization notes, such as a name, message or colour preference.
                      </p>
                    </li>
                    <li className="help-step">
                      <span className="help-step__num">03</span>
                      <p className="help-step__text">
                        Send your order on WhatsApp. We confirm the details, delivery time and payment with you before we begin.
                      </p>
                    </li>
                  </ol>
                </AnimatedContent>
              </section>

              {/* 2. Personalization */}
              <section id="personalization" className="help-section" aria-labelledby="heading-personalization">
                <h2 id="heading-personalization" className="help-section__heading">
                  Personalization
                </h2>
                <AnimatedContent className="page-copy" distance={60} duration={0.75} threshold={0.1} once={false}>
                  <p>
                    Many of our pieces can be personalized with names, messages or colour preferences. Look for the Personalizable badge, or add a note on any product in its quick view. If you would like something more custom, tell us on WhatsApp.
                  </p>
                </AnimatedContent>
              </section>

              {/* 3. Shipping & delivery */}
              <section id="shipping" className="help-section" aria-labelledby="heading-shipping">
                <h2 id="heading-shipping" className="help-section__heading">
                  Shipping &amp; delivery
                </h2>
                <AnimatedContent className="page-copy" distance={60} duration={0.75} threshold={0.1} once={false}>
                  <p>
                    We deliver across India. Every piece is made to order, so delivery timing depends on the piece and any personalization. We confirm the timing with you on WhatsApp when you place your order.
                  </p>
                </AnimatedContent>
              </section>

              {/* 4. Returns & personalized orders */}
              <section id="returns" className="help-section" aria-labelledby="heading-returns">
                <h2 id="heading-returns" className="help-section__heading">
                  Returns &amp; personalized orders
                </h2>
                <AnimatedContent className="page-copy" distance={60} duration={0.75} threshold={0.1} once={false}>
                  <p>
                    Because each piece is made to order, please check your order details carefully before confirming. If your order arrives damaged or is not what you ordered, message us on WhatsApp with photos and we will find the best solution together.
                  </p>
                </AnimatedContent>
              </section>

              {/* 5. Frequently asked questions */}
              <section id="faqs" className="help-section" aria-labelledby="heading-faqs">
                <h2 id="heading-faqs" className="help-section__heading">
                  Frequently asked questions
                </h2>
                <AnimatedContent className="help-faqs-list" distance={63} duration={0.8} stagger={0.07} threshold={0.1} once={false}>
                  {FAQS.map(faq => (
                    <details key={faq.id} className="help-faq-item" id={faq.id}>
                      <summary className="help-faq-summary">
                        <span>{faq.q}</span>
                        <svg
                          className="help-faq-chevron"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div className="help-faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </AnimatedContent>
              </section>

              {/* 6. Contact us */}
              <section id="contact" className="help-section" aria-labelledby="heading-contact">
                <h2 id="heading-contact" className="help-section__heading">
                  Contact us
                </h2>
                <AnimatedContent distance={60} duration={0.75} stagger={0.07} threshold={0.1} once={false}>
                  <div className="page-copy">
                    <p>We are easiest to reach on WhatsApp or Instagram.</p>
                  </div>
                  <div className="contact-rows-list">
                  {hasWhatsApp() && (
                    <div className="contact-row-item">
                      <span className="contact-row-icon" aria-hidden="true">
                        <Icon name="whatsapp" size={24} />
                      </span>
                      <a
                        href={waLink('Hi Palora! I have a question.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-row-link"
                      >
                        Chat on WhatsApp
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
            </div>
          </div>
        </div>
      </section>

      {/* Global Shared Footer */}
      <Footer />
    </main>
  );
};

export default HelpPage;
