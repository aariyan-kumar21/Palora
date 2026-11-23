import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2'
};

function createStaticServer(rootDirectory) {
  return http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/') cleanUrl = '/index.html';
    let filePath = path.join(rootDirectory, cleanUrl);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function collectPageMetrics(page, url, isDrawerTest = false) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Scroll to trigger any lazy / below fold elements
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  if (isDrawerTest) {
    const toggle = await page.$('#mobileToggleBtn');
    if (toggle) {
      await toggle.click();
      await page.waitForTimeout(400);
    }
  }

  return await page.evaluate(() => {
    const getEl = sel => document.querySelector(sel);
    const getComp = sel => {
      const el = getEl(sel);
      return el ? window.getComputedStyle(el) : null;
    };
    const getRect = sel => {
      const el = getEl(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, top: r.top, left: r.left };
    };

    const htmlStyle = window.getComputedStyle(document.documentElement);
    const bodyStyle = window.getComputedStyle(document.body);
    const metaViewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
    const doctype = document.doctype ? document.doctype.name : null;

    const selectors = {
      navbar: '#site-header',
      navLink: '.nav-link',
      wordmark: '.site-wordmark',
      wordmarkTitle: '.wordmark-title',
      wordmarkTagline: '.wordmark-tagline',
      icons: '.header-actions',
      hamburger: '#mobileToggleBtn',
      heroTextBlock: '.hero__content, .page-banner__content',
      heroEyebrow: '.hero__eyebrow, .page-banner__eyebrow',
      heroHeadline: '.hero-heading, .page-banner__heading',
      heroSubtext: '.hero-subtext, .page-banner__subtext',
      heroImage: '.hero__bg, .page-banner__media',
      benefitsStrip: '#benefits',
      benefitTitle: '.value-title',
      benefitDesc: '.value-desc',
      bestsellingCard: '.product-card',
      bestsellingCardName: '.product-card__name',
      bestsellingCardPrice: '.product-card__price',
      sectionHeading: '.title-lined',
      footer: '#site-footer',
      footerText: '.footer-col-text, .footer-brand-tagline, .footer-desc',
      catalogueCard: '.product-card--catalogue',
      filtersCard: '.filters',
      drawer: '.menu-drawer.is-open, .mobile-drawer.is-open, .mobile-drawer, .menu-drawer'
    };

    const computed = {};
    const rects = {};

    for (const [key, sel] of Object.entries(selectors)) {
      const cs = getComp(sel);
      if (cs) {
        computed[key] = {
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily
        };
      }
      rects[key] = getRect(sel);
    }

    const loadedFonts = [];
    document.fonts.forEach(f => {
      if (f.status === 'loaded') {
        loadedFonts.push(`${f.family} ${f.weight} ${f.style}`);
      }
    });

    return {
      html: {
        fontSize: htmlStyle.fontSize,
        boxSizing: htmlStyle.boxSizing
      },
      body: {
        fontSize: bodyStyle.fontSize,
        lineHeight: bodyStyle.lineHeight,
        boxSizing: bodyStyle.boxSizing,
        textSizeAdjust: bodyStyle.webkitTextSizeAdjust || bodyStyle.textSizeAdjust
      },
      metaViewport,
      doctype,
      computed,
      rects,
      loadedFonts: Array.from(new Set(loadedFonts))
    };
  });
}

function parsePx(val) {
  if (!val) return NaN;
  const num = parseFloat(val);
  return isNaN(num) ? NaN : num;
}

async function main() {
  const legacyPort = 5178;
  const legacyServer = createStaticServer(LEGACY);
  await new Promise(r => legacyServer.listen(legacyPort, '127.0.0.1', r));
  console.log(`Legacy server listening on http://127.0.0.1:${legacyPort}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const viewports = [
    { width: 1900, height: 868, name: '1900x868 (Primary Desktop)' },
    { width: 1536, height: 730, name: '1536x730 (Standard Laptop)' }
  ];

  const routes = [
    { label: 'Home', legacy: 'index.html', react: '', testDrawer: true },
    { label: 'Collections', legacy: 'catalogue.html', react: 'collections', testDrawer: false },
    { label: 'Our Story', legacy: 'story.html', react: 'story', testDrawer: false },
    { label: 'Help', legacy: 'help.html', react: 'help', testDrawer: false },
    { label: 'Privacy', legacy: 'privacy.html', react: 'privacy', testDrawer: false }
  ];

  let hasRatioFailure = false;
  const failureList = [];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(` TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });

    for (const r of routes) {
      console.log(`\n--- PAGE: ${r.label} at ${vp.width}x${vp.height} ---`);
      const legUrl = `http://127.0.0.1:${legacyPort}/${r.legacy}`;
      const recUrl = `http://127.0.0.1:3000/${r.react}`;

      const legData = await collectPageMetrics(page, legUrl, r.testDrawer);
      const recData = await collectPageMetrics(page, recUrl, r.testDrawer);

      // Verify Root & Body
      const legHtmlFs = parsePx(legData.html.fontSize);
      const recHtmlFs = parsePx(recData.html.fontSize);
      const htmlFsRatio = recHtmlFs / legHtmlFs;
      if (Math.abs(htmlFsRatio - 1) > 0.01) {
        hasRatioFailure = true;
        failureList.push(`[${vp.width}x${vp.height}] ${r.label} html.fontSize ratio: ${htmlFsRatio.toFixed(3)}`);
      }

      const legBodyFs = parsePx(legData.body.fontSize);
      const recBodyFs = parsePx(recData.body.fontSize);
      const bodyFsRatio = recBodyFs / legBodyFs;
      if (Math.abs(bodyFsRatio - 1) > 0.01) {
        hasRatioFailure = true;
        failureList.push(`[${vp.width}x${vp.height}] ${r.label} body.fontSize ratio: ${bodyFsRatio.toFixed(3)}`);
      }

      // Computed Typography Table
      const fontTable = [];
      const compKeys = new Set([...Object.keys(legData.computed), ...Object.keys(recData.computed)]);
      for (const k of compKeys) {
        const leg = legData.computed[k];
        const rec = recData.computed[k];
        if (!leg || !rec) continue;

        const lFs = parsePx(leg.fontSize);
        const rFs = parsePx(rec.fontSize);
        const ratio = lFs ? (rFs / lFs) : 1;
        const diff = lFs ? (((rFs - lFs) / lFs) * 100).toFixed(1) + '%' : '0%';

        if (Math.abs(ratio - 1) > 0.01) {
          hasRatioFailure = true;
          failureList.push(`[${vp.width}x${vp.height}] ${r.label} ${k} fontSize ratio: ${ratio.toFixed(3)}`);
        }

        fontTable.push({
          Element: k,
          Legacy_FS: leg.fontSize,
          React_FS: rec.fontSize,
          Ratio: ratio.toFixed(3),
          Diff: diff,
          Legacy_Font: leg.fontFamily.split(',')[0].replace(/"/g, ''),
          React_Font: rec.fontFamily.split(',')[0].replace(/"/g, '')
        });
      }
      console.log('Typography:');
      console.table(fontTable);

      // Bounding Rect Table
      const rectTable = [];
      const rectKeys = new Set([...Object.keys(legData.rects), ...Object.keys(recData.rects)]);
      for (const k of rectKeys) {
        const legR = legData.rects[k];
        const recR = recData.rects[k];
        if (!legR || !recR) continue;

        // Ignore 0-sized hidden elements
        if (legR.width === 0 && recR.width === 0) continue;

        const wRatio = legR.width ? (recR.width / legR.width) : 1;
        const hRatio = legR.height ? (recR.height / legR.height) : 1;

        if (legR.width > 0 && Math.abs(wRatio - 1) > 0.01) {
          hasRatioFailure = true;
          failureList.push(`[${vp.width}x${vp.height}] ${r.label} ${k} width ratio: ${wRatio.toFixed(3)} (Legacy: ${legR.width}, React: ${recR.width})`);
        }

        if (legR.height > 0 && Math.abs(hRatio - 1) > 0.01) {
          hasRatioFailure = true;
          failureList.push(`[${vp.width}x${vp.height}] ${r.label} ${k} height ratio: ${hRatio.toFixed(3)} (Legacy: ${legR.height}, React: ${recR.height})`);
        }

        rectTable.push({
          Element: k,
          Legacy_W: Math.round(legR.width),
          React_W: Math.round(recR.width),
          W_Ratio: wRatio.toFixed(3),
          Legacy_H: Math.round(legR.height),
          React_H: Math.round(recR.height),
          H_Ratio: hRatio.toFixed(3)
        });
      }
      console.log('Bounding Rectangles:');
      console.table(rectTable);
    }

    await page.close();
  }

  await browser.close();
  legacyServer.close();

  console.log('\n======================================================');
  console.log(' SIZE-CHECK SUITE SUMMARY');
  console.log('======================================================');

  if (failureList.length > 0) {
    console.error(`FAILED: ${failureList.length} element(s) outside [0.99, 1.01] ratio:`);
    failureList.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('SUCCESS: All elements across all 5 pages at 1900x868 and 1536x730 have ratios within [0.99, 1.01]!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error in size-check:', err);
  process.exit(1);
});
