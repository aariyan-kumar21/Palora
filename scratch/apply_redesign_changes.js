const fs = require('fs');

// 1. Update index.html hero section
let html = fs.readFileSync('index.html', 'utf8');

// Replace centered scroll button with left vertical scroll indicator matching reference image
const oldScrollHtml = `<a href="#benefits" class="hero__scroll hero__scroll-centered" aria-label="Scroll down">
          <span class="hero__scroll-text">SCROLL</span>
          <svg class="hero__scroll-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>`;

const newScrollHtml = `<a href="#bestsellers" class="hero__scroll hero__scroll-vertical" aria-label="Scroll to Bestselling Collection">
          <span class="hero__scroll-text">SCROLL</span>
          <span class="hero__scroll-line" aria-hidden="true"></span>
          <svg class="hero__scroll-arrow" width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M7 1v12M2 8l5 5 5-5" />
          </svg>
        </a>`;

html = html.replace(oldScrollHtml, newScrollHtml);

// Ensure CTA says "EXPLORE OUR COLLECTIONS" matching reference image
html = html.replace(
  `<span>Explore Collections</span>`,
  `<span>EXPLORE OUR COLLECTIONS</span>`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated.');

// 2. Update css/home.css
let homeCss = fs.readFileSync('css/home.css', 'utf8');

// (a) Update .hero to calc(100vh - 80px) and 100dvh with min-height: 0, max-height: none
homeCss = homeCss.replace(
  /\.hero\s*\{[\s\S]*?background:\s*linear-gradient\(180deg,\s*#E3A8A4 0%,\s*#E0A29E 50%,\s*#E5A9A5 100%\);/,
  `.hero {
  position: relative;
  display: flex;
  align-items: center;
  height: calc(100vh - 80px);
  height: calc(100dvh - 80px);
  min-height: 0;
  max-height: none;
  background: linear-gradient(180deg, #E3A8A4 0%, #E0A29E 50%, #E5A9A5 100%);`
);

// (b) Update CTA link font and tracking to match reference image
homeCss = homeCss.replace(
  /\.hero__cta\s*\{[\s\S]*?\.hero__cta svg/m,
  `.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-jost);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5A1623;
  transition: color var(--transition-fast);
  text-decoration: none;
}

.hero__cta svg`
);

// (c) Update .hero__scroll to vertical orientation on left side near bottom
const oldScrollCss = `/* Centered Scroll Down Indicator */
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
}`;

const newScrollCss = `/* Vertical Scroll Down Indicator (Left side, matching reference image) */
.hero__scroll {
  position: absolute;
  bottom: 35px;
  left: 45px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #5A1623;
  text-decoration: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.hero__scroll:hover {
  opacity: 0.7;
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
  height: 55px;
  background-color: #5A1623;
}

.hero__scroll-arrow {
  display: block;
  color: #5A1623;
  transition: transform var(--transition-fast);
}

.hero__scroll:hover .hero__scroll-arrow {
  transform: translateY(3px);
}`;

homeCss = homeCss.replace(oldScrollCss, newScrollCss);

// (d) Update .value-bar to exact 80px height, warm soft rosy cream tint, matching reference image
homeCss = homeCss.replace(
  /\.value-bar\s*\{[\s\S]*?\.value-bar-container/m,
  `.value-bar {
  height: 80px;
  box-sizing: border-box;
  background-color: #EEDCD4;
  border-top: 1px solid rgba(114, 47, 55, 0.12);
  border-bottom: 1px solid rgba(114, 47, 55, 0.08);
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  margin: 0;
}

.value-bar-container`
);

homeCss = homeCss.replace(
  /\.value-title\s*\{[\s\S]*?\.value-desc/m,
  `.value-title {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.15rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5A1623;
  line-height: 1.2;
  margin-bottom: 2px;
}

.value-desc`
);

fs.writeFileSync('css/home.css', homeCss, 'utf8');
console.log('css/home.css updated.');
