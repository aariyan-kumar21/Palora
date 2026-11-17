const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

const checkScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      // 1. Header
      const header = document.querySelector('#site-header');
      const hCs = getComputedStyle(header);
      const hRect = header.getBoundingClientRect();
      const burger = document.querySelector('#mobileToggleBtn');
      const bCs = getComputedStyle(burger);

      // 2. Scroll Button
      const scrollBtn = document.querySelector('.hero__scroll');
      const sRect = scrollBtn ? scrollBtn.getBoundingClientRect() : null;

      // 3. Bestsellers footer and nav buttons
      const bsFooter = document.querySelector('.bestsellers__footer');
      const bsFooterRect = bsFooter ? bsFooter.getBoundingClientRect() : null;
      const firstCard = document.querySelector('.bestsellers__track .product-card');
      const firstCardRect = firstCard ? firstCard.getBoundingClientRect() : null;
      const prevBtn = document.querySelector('.bestseller-nav-btn--prev');
      const nextBtn = document.querySelector('.bestseller-nav-btn--next');
      const prevRect = prevBtn ? prevBtn.getBoundingClientRect() : null;
      const nextRect = nextBtn ? nextBtn.getBoundingClientRect() : null;

      // 4. How it works to Personalize gap
      const hiw = document.querySelector('#how-it-works');
      const pers = document.querySelector('#personalize');
      const hiwRect = hiw ? hiw.getBoundingClientRect() : null;
      const persRect = pers ? pers.getBoundingClientRect() : null;
      const hiwLearnMore = document.querySelector('.how-it-works__footer a');
      const lmRect = hiwLearnMore ? hiwLearnMore.getBoundingClientRect() : null;
      const callout = document.querySelector('.callout');
      const calloutRect = callout ? callout.getBoundingClientRect() : null;

      // 5. Footer Social Row & Watermark
      const socialRow = document.querySelector('.footer-social-row');
      const socialLinks = socialRow ? Array.from(socialRow.querySelectorAll('a')).map(a => ({
        label: a.getAttribute('aria-label'),
        border: getComputedStyle(a).border,
        borderRadius: getComputedStyle(a).borderRadius,
        bg: getComputedStyle(a).backgroundColor
      })) : [];

      const wm = document.querySelector('.footer-watermark');
      const bar = document.querySelector('.footer-bottom-bar');
      const wmRect = wm ? wm.getBoundingClientRect() : null;
      const barRect = bar ? bar.getBoundingClientRect() : null;

      const results = {
        header: {
          height: Math.round(hRect.height),
          borderBottom: hCs.borderBottom,
          backgroundColor: hCs.backgroundColor
        },
        hamburger: {
          border: bCs.border,
          borderRadius: bCs.borderRadius,
          width: Math.round(burger.getBoundingClientRect().width),
          height: Math.round(burger.getBoundingClientRect().height)
        },
        scrollButton: sRect ? {
          x: Math.round(sRect.x),
          centerX: Math.round(sRect.x + sRect.width / 2),
          bottom: Math.round(sRect.bottom),
          windowWidth: window.innerWidth
        } : null,
        bestsellers: {
          footerAlign: getComputedStyle(bsFooter).textAlign,
          footerX: bsFooterRect ? Math.round(bsFooterRect.x) : null,
          firstCardX: firstCardRect ? Math.round(firstCardRect.x) : null,
          prevBtnX: prevRect ? Math.round(prevRect.x) : null,
          nextBtnX: nextRect ? Math.round(nextRect.x) : null,
          prevBorder: getComputedStyle(prevBtn).border,
          prevBg: getComputedStyle(prevBtn).backgroundColor
        },
        spacing: {
          gapBetweenLearnMoreAndCallout: (lmRect && calloutRect) ? Math.round(calloutRect.top - lmRect.bottom) : null
        },
        footer: {
          socialLinks,
          watermarkBottom: wmRect ? Math.round(wmRect.bottom) : null,
          barTop: barRect ? Math.round(barRect.top) : null,
          watermarkOnLineDiff: (wmRect && barRect) ? Math.round(barRect.top - wmRect.bottom) : null
        }
      };

      const div = document.createElement('div');
      div.id = 'FIXES_VERIFICATION';
      div.textContent = JSON.stringify(results);
      document.body.appendChild(div);
    }, 600);
  });
`;

async function run() {
  const homeHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>${checkScript}</script></body>`);
  
  const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'verify_fixes.html');
  fs.writeFileSync(testFile, homeHtml, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3500',
    '--dump-dom',
    'file:///' + testFile.replace(/\\/g, '/')
  ];

  const proc = spawn(chromePath, args);
  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', () => {
    const match = out.match(/<div id="FIXES_VERIFICATION">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('VERIFICATION RESULTS:\n', JSON.stringify(JSON.parse(match[1]), null, 2));
    } else {
      console.log('Failed to parse output');
    }
  });
}

run();
