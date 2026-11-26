import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { chromium } from 'playwright';

const PORT = 4176;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve('responsive-output');

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x640', width: 360, height: 640 },
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
  { name: '430x932', width: 430, height: 932 },
  { name: '600x960', width: 600, height: 960 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '820x1180', width: 820, height: 1180 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1180x820', width: 1180, height: 820 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1536x730', width: 1536, height: 730 },
  { name: '1900x868', width: 1900, height: 868 },
  { name: '2560x1440', width: 2560, height: 1440 },
  { name: '667x375-landscape', width: 667, height: 375 },
  { name: '844x390-landscape', width: 844, height: 390 },
  { name: '1024x768-landscape', width: 1024, height: 768 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'collections', path: '/collections' },
  { name: 'story', path: '/story' },
  { name: 'help', path: '/help' },
  { name: 'privacy', path: '/privacy' },
  { name: 'notfound', path: '/non-existent-route' },
];

async function waitForServer(url, retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Preview server did not start in time');
}

async function main() {
  const preview = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'],
    { stdio: 'ignore' }
  );

  try {
    await waitForServer(`${BASE_URL}/`);
    const browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });

    const summaryRows = [];
    let totalFailures = 0;

    for (const vp of VIEWPORTS) {
      const isTouch = vp.width < 1024;
      const vpDir = path.join(OUT_DIR, vp.name);
      fs.mkdirSync(vpDir, { recursive: true });

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: isTouch,
        hasTouch: isTouch,
      });
      const page = await context.newPage();

      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore offline Google Fonts CDN in sandboxed runs and intentional missing placeholder image fallback
          if (text.includes('ERR_NAME_NOT_RESOLVED') || text.includes('status of 404')) return;
          consoleErrors.push(text);
        }
      });
      page.on('pageerror', err => consoleErrors.push(err.message));

      for (const pg of PAGES) {
        consoleErrors.length = 0;
        await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(250);

        const totalHeight = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y <= totalHeight; y += 600) {
          await page.evaluate(pos => window.scrollTo(0, pos), y);
          await page.waitForTimeout(80);
        }
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(250);

        await page.screenshot({ path: path.join(vpDir, `${pg.name}.png`), fullPage: false });
        await page.screenshot({ path: path.join(vpDir, `${pg.name}-full.png`), fullPage: true });

        const metrics = await page.evaluate(touch => {
          const vw = window.innerWidth;
          const sw = document.documentElement.scrollWidth;
          const overflow = sw > vw;
          const offenders = [];
          if (overflow) {
            for (const el of document.querySelectorAll('body *')) {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.height > 0 && (r.right > vw + 1 || r.left < -1)) {
                const cs = getComputedStyle(el);
                if (cs.visibility !== 'hidden' && cs.display !== 'none') {
                  offenders.push(`${el.tagName}.${String(el.className).slice(0, 30)} (right:${Math.round(r.right)})`);
                  if (offenders.length >= 5) break;
                }
              }
            }
          }

          // Check touch target sizes (< 44x44) on touch viewports
          const touchViolations = [];
          if (touch) {
            const interactive = document.querySelectorAll('a, button, select, summary, input:not([type="range"]):not([type="checkbox"])');
            for (const el of interactive) {
              const cs = getComputedStyle(el);
              if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
              if (el.closest('[aria-hidden="true"]') || el.closest('.menu-drawer:not(.is-open)') || el.closest('.saved-panel:not(.is-open)') || el.closest('.cart-modal:not(.is-open)') || el.closest('.filters:not(.is-sheet-open)')) continue;
              // Allow depth carousel dots which expand hit area via ::after
              if (el.classList.contains('rb-depth-carousel__dot')) continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (r.width < 43.5 || r.height < 43.5) {
                touchViolations.push(`${el.tagName}.${String(el.className).slice(0, 28)}(${Math.round(r.width)}x${Math.round(r.height)})`);
              }
            }
          }

          // Check small font sizes (< 12px) excluding allowed decorative/badge/watermark elements
          const smallText = [];
          const exempt = ['.wordmark-tagline', '.footer-brand-sub', '.hero__scroll-text', '.saved-badge', '.cart-badge', '.footer-watermark', '.md-tagline', '.md-wm-sub', '.product-badge-pill', '.search-product-badge', '.mobile-filters-count', '.cart-counter', '.quickview__counter'];
          for (const el of document.querySelectorAll('body *')) {
            if (el.children.length > 0) continue;
            const txt = el.textContent?.trim();
            if (!txt) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (exempt.some(sel => el.matches(sel) || el.closest(sel))) continue;
            const fs = parseFloat(cs.fontSize);
            if (fs < 11.9) {
              smallText.push(`${el.tagName}.${String(el.className).slice(0, 24)}(${fs}px)`);
            }
          }

          // Check form inputs >= 16px on touch viewports
          const smallInputs = [];
          if (touch) {
            for (const inp of document.querySelectorAll('input:not([type="range"]):not([type="checkbox"]), textarea, select')) {
              const cs = getComputedStyle(inp);
              if (cs.display === 'none' || cs.visibility === 'hidden') continue;
              const fs = parseFloat(cs.fontSize);
              if (fs < 16) smallInputs.push(`${inp.tagName}(${fs}px)`);
            }
          }

          return {
            overflow,
            scrollWidth: sw,
            innerWidth: vw,
            offenders,
            touchViolations: touchViolations.slice(0, 8),
            smallText: smallText.slice(0, 8),
            smallInputs,
          };
        }, isTouch);

        const pass =
          !metrics.overflow &&
          consoleErrors.length === 0 &&
          metrics.touchViolations.length === 0 &&
          metrics.smallText.length === 0 &&
          metrics.smallInputs.length === 0;

        if (!pass) {
          totalFailures++;
          console.error(`FAIL [${vp.name} ${pg.name}]:`, {
            overflow: metrics.overflow ? `${metrics.scrollWidth} > ${metrics.innerWidth} ${metrics.offenders.join(', ')}` : false,
            consoleErrors,
            touchViolations: metrics.touchViolations,
            smallText: metrics.smallText,
            smallInputs: metrics.smallInputs,
          });
        }

        summaryRows.push({
          viewport: vp.name,
          page: pg.name,
          overflow: metrics.overflow ? `${metrics.scrollWidth}>${metrics.innerWidth}` : 'OK',
          consoleErr: consoleErrors.length,
          touchErr: metrics.touchViolations.length,
          fontErr: metrics.smallText.length + metrics.smallInputs.length,
          status: pass ? 'PASS' : 'FAIL',
        });
      }

      await context.close();
    }

    await browser.close();
    console.table(summaryRows);
    if (totalFailures > 0) {
      throw new Error(`responsive-check failed on ${totalFailures} viewport/page check(s).`);
    }
    console.log('ALL RESPONSIVE CHECKS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
