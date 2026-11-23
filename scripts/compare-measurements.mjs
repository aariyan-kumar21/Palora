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

async function collectPageMetrics(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Scroll down to trigger any below-fold / lazy content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

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

    // Elements to inspect
    const selectors = {
      nav: '#site-header',
      navLink: '.nav-link',
      wordmark: '.site-wordmark',
      wordmarkTitle: '.wordmark-title',
      wordmarkTagline: '.wordmark-tagline',
      icons: '.header-actions',
      hamburger: '#mobileToggleBtn',
      heroTextBlock: '.hero__content',
      heroEyebrow: '.hero__eyebrow',
      heroHeadline: '.hero-heading',
      heroSubtext: '.hero-subtext',
      heroImage: '.hero__bg',
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
      filtersCard: '.filters'
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

    // Font faces loaded
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

async function main() {
  const legacyServer = createStaticServer(LEGACY);
  await new Promise(r => legacyServer.listen(5174, '127.0.0.1', r));
  console.log('Legacy server listening on http://127.0.0.1:5174');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage({
    viewport: { width: 1900, height: 868 }
  });

  const routes = [
    { label: 'Home', legacy: 'index.html', react: '' },
    { label: 'Collections', legacy: 'catalogue.html', react: 'collections' },
    { label: 'Story', legacy: 'story.html', react: 'story' },
    { label: 'Help', legacy: 'help.html', react: 'help' },
    { label: 'Privacy', legacy: 'privacy.html', react: 'privacy' }
  ];

  for (const r of routes) {
    console.log(`\n=================== COMPARING: ${r.label} ===================`);
    const legData = await collectPageMetrics(page, `http://127.0.0.1:5174/${r.legacy}`);
    const reactData = await collectPageMetrics(page, `http://127.0.0.1:3000/${r.react}`);

    console.log('\n--- ROOT & BODY ---');
    console.log('Legacy HTML font-size:', legData.html.fontSize, '| React HTML font-size:', reactData.html.fontSize);
    console.log('Legacy Body font-size:', legData.body.fontSize, '| React Body font-size:', reactData.body.fontSize);
    console.log('Legacy Body line-height:', legData.body.lineHeight, '| React Body line-height:', reactData.body.lineHeight);
    console.log('Legacy viewport:', legData.metaViewport, '| React viewport:', reactData.metaViewport);
    console.log('Legacy doctype:', legData.doctype, '| React doctype:', reactData.doctype);

    console.log('\n--- COMPUTED FONT SIZES & RATIOS ---');
    const tableData = [];
    const allKeys = new Set([...Object.keys(legData.computed), ...Object.keys(reactData.computed)]);
    for (const k of allKeys) {
      const leg = legData.computed[k];
      const rec = reactData.computed[k];
      if (!leg || !rec) continue;
      const legFs = parseFloat(leg.fontSize);
      const recFs = parseFloat(rec.fontSize);
      const ratio = legFs ? (recFs / legFs).toFixed(3) : '1.000';
      const diffPct = legFs ? (((recFs - legFs) / legFs) * 100).toFixed(1) + '%' : '0%';
      tableData.push({
        Element: k,
        Legacy_FS: leg.fontSize,
        React_FS: rec.fontSize,
        FS_Ratio: ratio,
        Legacy_LH: leg.lineHeight,
        React_LH: rec.lineHeight,
        Legacy_Font: leg.fontFamily.split(',')[0],
        React_Font: rec.fontFamily.split(',')[0],
        Diff: diffPct
      });
    }
    console.table(tableData);

    console.log('\n--- BOUNDING RECT WIDTH / HEIGHT & RATIOS ---');
    const rectTable = [];
    const allRectKeys = new Set([...Object.keys(legData.rects), ...Object.keys(reactData.rects)]);
    for (const k of allRectKeys) {
      const legR = legData.rects[k];
      const recR = reactData.rects[k];
      if (!legR || !recR) continue;
      const wRatio = legR.width ? (recR.width / legR.width).toFixed(3) : '1.000';
      const hRatio = legR.height ? (recR.height / legR.height).toFixed(3) : '1.000';
      rectTable.push({
        Element: k,
        Legacy_W: Math.round(legR.width),
        React_W: Math.round(recR.width),
        W_Ratio: wRatio,
        Legacy_H: Math.round(legR.height),
        React_H: Math.round(recR.height),
        H_Ratio: hRatio
      });
    }
    console.table(rectTable);

    console.log('\n--- LOADED FONTS ---');
    console.log('Legacy fonts count:', legData.loadedFonts.length, legData.loadedFonts);
    console.log('React fonts count:', reactData.loadedFonts.length, reactData.loadedFonts);
  }

  await browser.close();
  legacyServer.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
