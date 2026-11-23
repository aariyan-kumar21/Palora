/**
 * Palora Help Page Logic (js/help.js)
 * Features:
 * - One-open-at-a-time accordion for FAQs
 * - URL hash targeting for FAQs and sections
 * - IntersectionObserver for sticky left-nav anchor highlighting
 * - Dynamic contact rows rendering based on config constants
 */

(function () {
  'use strict';

  function initHelpFaqs() {
    const faqItems = document.querySelectorAll('.help-faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (details.open) {
          faqItems.forEach((other) => {
            if (other !== details && other.open) {
              other.open = false;
            }
          });
        }
      });
    });

    // Check URL hash on load & hashchange
    function handleHash() {
      const hash = window.location.hash;
      if (!hash) return;

      const targetId = hash.substring(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      if (targetEl.classList.contains('help-faq-item')) {
        targetEl.open = true;
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const nestedFaq = targetEl.closest('.help-faq-item');
        if (nestedFaq) {
          nestedFaq.open = true;
          nestedFaq.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    window.addEventListener('hashchange', handleHash);
    // Slight timeout so DOM and scroll margins settle
    setTimeout(handleHash, 100);
  }

  function initSectionObserver() {
    const navLinks = document.querySelectorAll('.help-nav__link');
    const sections = document.querySelectorAll('.help-section[id]');
    if (!navLinks.length || !sections.length) return;

    const linkMap = new Map();
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const id = href.replace(/^#/, '');
      if (id) linkMap.set(id, link);
    });

    function setActive(id) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      const activeLink = linkMap.get(id);
      if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'true');
      }
    }

    // IntersectionObserver to highlight section in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 0.2]
      }
    );

    sections.forEach((section) => observer.observe(section));

    // Also update on click
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const id = href.replace(/^#/, '');
        if (id) {
          const target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, '', '#' + id);
            setActive(id);
          }
        }
      });
    });

    // Check initial hash
    if (window.location.hash) {
      const initialId = window.location.hash.substring(1);
      if (linkMap.has(initialId)) {
        setActive(initialId);
      }
    }
  }

  function renderContactRows() {
    const list = document.getElementById('helpContactRows');
    if (!list) return;

    let html = '';

    // 1. WhatsApp button if hasWhatsApp()
    if (typeof hasWhatsApp === 'function' && hasWhatsApp()) {
      const url = typeof waLink === 'function' ? waLink('Hi Palora! I have a question.') : '#';
      const waIcon = typeof icon === 'function' ? icon('whatsapp', { size: 20 }) : '';
      html += `
        <div class="contact-row-item">
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-burgundy">
            ${waIcon}
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      `;
    }

    // 2. Instagram row (always present)
    if (typeof INSTAGRAM_URL !== 'undefined' && INSTAGRAM_URL) {
      const handle = typeof INSTAGRAM_HANDLE !== 'undefined' ? INSTAGRAM_HANDLE : 'palora.giftsstore';
      const instaIcon = typeof icon === 'function' ? icon('instagram', { size: 24 }) : '📷';
      html += `
        <div class="contact-row-item">
          <span class="contact-row-icon" aria-hidden="true">${instaIcon}</span>
          <span>Instagram: <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="contact-row-link">@${handle}</a></span>
        </div>
      `;
    }

    // 3. Email row only if EMAIL is set
    if (typeof EMAIL !== 'undefined' && EMAIL) {
      const mailIcon = typeof icon === 'function' ? icon('mail', { size: 24 }) : '✉️';
      html += `
        <div class="contact-row-item">
          <span class="contact-row-icon" aria-hidden="true">${mailIcon}</span>
          <span>Email: <a href="mailto:${EMAIL}" class="contact-row-link">${EMAIL}</a></span>
        </div>
      `;
    }

    // 4. Delivering across India
    const truckIcon = typeof icon === 'function' ? icon('truck', { size: 24 }) : '🚚';
    html += `
      <div class="contact-row-item">
        <span class="contact-row-icon" aria-hidden="true">${truckIcon}</span>
        <span>Delivering across India</span>
      </div>
    `;

    list.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHelpFaqs();
    initSectionObserver();
    renderContactRows();
  });
})();
