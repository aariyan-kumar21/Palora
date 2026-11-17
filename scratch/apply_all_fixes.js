const fs = require('fs');

// 1. Update css/base.css
let baseCss = fs.readFileSync('css/base.css', 'utf8');

// (a) Reduce nav height from 115px to 80px
baseCss = baseCss.replace(/--nav-h:\s*115px;/g, '--nav-h: 80px;');
baseCss = baseCss.replace(/height:\s*var\(--nav-h,\s*115px\);/g, 'height: var(--nav-h, 80px);');

// (b) Completely transparent navbar on homepage with no horizontal line
baseCss = baseCss.replace(
  `/* Home page transparent header when at top */
body[data-page="home"] .site-header:not(.scrolled) {
  background-color: transparent;
  border-bottom: 1px solid rgba(114, 47, 55, 0.1);
  color: #5A1623;
}`,
  `/* Home page transparent header when at top */
body[data-page="home"] .site-header:not(.scrolled) {
  background: transparent !important;
  background-color: transparent !important;
  border-bottom: none !important;
  box-shadow: none !important;
  color: #5A1623;
}`
);

// (c) Remove circle around hamburger button
baseCss = baseCss.replace(
  `/* Hamburger 2-line button (48px circle, 2 lines) */
.hamburger-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(114, 47, 55, 0.25);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  color: #5A1623;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.hamburger-btn:hover {
  border-color: rgba(114, 47, 55, 0.5);
  background-color: rgba(114, 47, 55, 0.05);
}`,
  `/* Hamburger 2-line button (clean lines, no circle) */
.hamburger-btn {
  width: 36px;
  height: 36px;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  color: #5A1623;
  padding: 0;
  transition: opacity var(--transition-fast);
}

.hamburger-btn:hover {
  border: none !important;
  background-color: transparent !important;
  opacity: 0.7;
}`
);

// (d) Update footer social links (remove circle around Instagram and support WhatsApp link next to it)
baseCss = baseCss.replace(
  `.footer-social-circle {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 247, 242, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF7F2;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
  text-decoration: none;
}

.footer-social-circle:hover {
  background-color: rgba(255, 247, 242, 0.15);
  border-color: #FFFFFF;
}`,
  `.footer-social-link,
.footer-social-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #FFF7F2;
  border: none !important;
  background: transparent !important;
  border-radius: 0 !important;
  width: auto !important;
  height: auto !important;
  padding: 4px;
  box-shadow: none !important;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  text-decoration: none;
}

.footer-social-link:hover,
.footer-social-circle:hover {
  opacity: 0.75;
  transform: translateY(-2px);
  background: transparent !important;
  border: none !important;
}`
);

// (e) Update watermark bottom so PALORA text sits on the horizontal line
baseCss = baseCss.replace(
  `/* Faint Giant Watermark */
.footer-watermark {
  position: absolute;
  left: 50%;
  bottom: 45px;
  transform: translateX(-50%);`,
  `/* Faint Giant Watermark (sitting directly on bottom bar horizontal line) */
.footer-watermark {
  position: absolute;
  left: 50%;
  bottom: 72px;
  transform: translateX(-50%);`
);

fs.writeFileSync('css/base.css', baseCss, 'utf8');
console.log('css/base.css updated.');

// 2. Update css/home.css
let homeCss = fs.readFileSync('css/home.css', 'utf8');

// (a) Scroll button centered with animated down arrow
homeCss = homeCss.replace(
  `/* Vertical Scroll Down Indicator (Left x~47) */
.hero__scroll {
  position: absolute;
  bottom: 32px;
  left: 47px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #5A1623;
  text-decoration: none;
  cursor: pointer;
}

.hero__scroll-text {
  font-family: var(--font-jost);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.hero__scroll-line {
  display: block;
  width: 1px;
  height: 65px;
  background-color: #5A1623;
}

.hero__scroll-arrow {
  display: block;
  color: #5A1623;
}`,
  `/* Centered Scroll Down Indicator */
.hero__scroll {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #5A1623;
  text-decoration: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.hero__scroll:hover {
  opacity: 0.75;
}

.hero__scroll-text {
  font-family: var(--font-jost);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  writing-mode: horizontal-tb;
  transform: none;
}

.hero__scroll-line {
  display: none;
}

.hero__scroll-arrow {
  display: block;
  color: #5A1623;
  animation: scrollArrowBounce 1.8s ease-in-out infinite;
}

@keyframes scrollArrowBounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.75;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
  }
}`
);

// (b) Reposition "View all products" to left side under first card
homeCss = homeCss.replace(
  `.bestsellers__footer {
  text-align: center;
  margin-top: 36px;
}`,
  `.bestsellers__footer {
  text-align: left;
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
  padding-left: 4px;
}`
);

// (c) Bestseller navigation buttons redesigned to plain arrows outside of the cards
homeCss = homeCss.replace(
  `.bestseller-nav-btn {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background-color: #FFFFFF;
  border: 1px solid rgba(114, 47, 55, 0.12);
  color: #5A1623;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(114, 47, 55, 0.12);
  z-index: 10;
  transition: all var(--transition-fast);
}

.bestseller-nav-btn:hover:not(:disabled) {
  background-color: #5A1623;
  color: #FFF7F2;
  border-color: #5A1623;
}

.bestseller-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.bestseller-nav-btn--prev {
  left: -22px;
}

.bestseller-nav-btn--next {
  right: -22px;
}`,
  `.bestseller-nav-btn {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 0;
  background-color: transparent !important;
  border: none !important;
  color: #5A1623;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none !important;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
}

.bestseller-nav-btn:hover:not(:disabled) {
  background-color: transparent !important;
  color: #722F37;
  border: none !important;
  transform: translateY(-50%) scale(1.2);
}

.bestseller-nav-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.bestseller-nav-btn--prev {
  left: -48px;
}

.bestseller-nav-btn--next {
  right: -48px;
}`
);

// (d) Reduce gap between How Ordering Works and Personalization banner by 40%
homeCss = homeCss.replace(
  `.how-it-works {
  background-color: #FAF0E9;
  padding: 72px 0 80px;
}`,
  `.how-it-works {
  background-color: #FAF0E9;
  padding: 72px 0 46px;
}`
);

homeCss = homeCss.replace(
  `.personalize {
  background-color: #FAF0E9;
  padding: 64px 0 56px;
}`,
  `.personalize {
  background-color: #FAF0E9;
  padding: 38px 0 56px;
}`
);

fs.writeFileSync('css/home.css', homeCss, 'utf8');
console.log('css/home.css updated.');

// 3. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// (a) Scroll button in hero
indexHtml = indexHtml.replace(
  `<a href="#bestsellers" class="hero__scroll hero__scroll-vertical" aria-label="Scroll to Bestselling Collection">
          <span class="hero__scroll-text">SCROLL</span>
          <span class="hero__scroll-line" aria-hidden="true"></span>
            <svg class="hero__scroll-arrow" width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor"
              stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M7 1v12M2 8l5 5 5-5" />
            </svg>
        </a>`,
  `<a href="#benefits" class="hero__scroll hero__scroll-centered" aria-label="Scroll down">
          <span class="hero__scroll-text">SCROLL</span>
          <svg class="hero__scroll-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>`
);

// (b) Plain arrows in bestsellers
indexHtml = indexHtml.replace(
  `<button type="button" class="bestseller-nav-btn bestseller-nav-btn--prev" aria-label="Previous products"
            disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>`,
  `<button type="button" class="bestseller-nav-btn bestseller-nav-btn--prev" aria-label="Previous products"
            disabled>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>`
);

indexHtml = indexHtml.replace(
  `<button type="button" class="bestseller-nav-btn bestseller-nav-btn--next" aria-label="Next products">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>`,
  `<button type="button" class="bestseller-nav-btn bestseller-nav-btn--next" aria-label="Next products">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>`
);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html updated.');

// 4. Update js/layout.js for footer social row
let layoutJs = fs.readFileSync('js/layout.js', 'utf8');

layoutJs = layoutJs.replace(
  `<div class="footer-social-row">
              <a href="\${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="footer-social-circle" aria-label="Instagram">
                \${icon("instagram", { size: 20 })}
              </a>
              \${footerWaCircle}
            </div>`,
  `<div class="footer-social-row">
              <a href="\${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Instagram">
                \${icon("instagram", { size: 22 })}
              </a>
              <a href="\${waLink("Hi Palora! I'd like to inquire about your gifts.") || "https://wa.me/"}" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="WhatsApp">
                \${icon("whatsapp", { size: 22 })}
              </a>
            </div>`
);

fs.writeFileSync('js/layout.js', layoutJs, 'utf8');
console.log('js/layout.js updated.');
