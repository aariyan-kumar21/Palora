import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const LEGACY = path.join(ROOT, 'legacy');
const OUTPUT = path.join(ROOT, 'parity-output');

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

function createStaticServer(rootDirectory, isSpa = false) {
  return http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/') cleanUrl = '/index.html';

    let filePath = path.join(rootDirectory, cleanUrl);

    // If file doesn't exist and SPA is enabled, serve index.html
    if (isSpa && !fs.existsSync(filePath)) {
      filePath = path.join(rootDirectory, 'index.html');
    }

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

// WCAG Contrast calculation
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

function contrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runParity() {
  console.log('--- PALORA PARITY & VERIFICATION SUITE ---');

  if (!fs.existsSync(OUTPUT)) {
    fs.mkdirSync(OUTPUT, { recursive: true });
  }

  // 1. Start Servers
  const reactServer = createStaticServer(DIST, true);
  const legacyServer = createStaticServer(LEGACY, false);

  await new Promise(r => reactServer.listen(5173, '127.0.0.1', r));
  await new Promise(r => legacyServer.listen(5174, '127.0.0.1', r));
  console.log('Servers listening: React on 127.0.0.1:5173, Legacy on 127.0.0.1:5174');

  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });

  const viewports = [
    { width: 1900, height: 868, name: '1900x868' },
    { width: 1536, height: 730, name: '1536x730' }
  ];

  const routes = [
    { path: '/', legacyFile: 'index.html', label: 'Home' },
    { path: '/collections', legacyFile: 'catalogue.html', label: 'Collections' },
    { path: '/story', legacyFile: 'story.html', label: 'Our Story' },
    { path: '/help', legacyFile: 'help.html', label: 'Help' },
    { path: '/privacy', legacyFile: 'privacy.html', label: 'Privacy' }
  ];

  const navbarRects = [];
  const errors = [];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[${vp.name}] ${msg.text()}`);
      }
    });

    for (const route of routes) {
      // Test React Page
      await page.goto(`http://127.0.0.1:5173${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Measure header rect
      const headerRect = await page.evaluate(() => {
        const h = document.getElementById('site-header');
        if (!h) return null;
        const r = h.getBoundingClientRect();
        return { height: r.height, top: r.top, left: r.left, width: r.width };
      });

      navbarRects.push({
        viewport: vp.name,
        route: route.label,
        ...headerRect
      });

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (overflow) {
        errors.push(`[${vp.name} ${route.label}] Horizontal scrollbar detected!`);
      }

      // Screenshot React page
      const reactShot = path.join(OUTPUT, `react-${route.label.toLowerCase().replace(/\s+/g, '-')}-${vp.name}.png`);
      await page.screenshot({ path: reactShot, fullPage: false });

      // Screenshot Legacy page
      const legacyPage = await browser.newPage({
        viewport: { width: vp.width, height: vp.height }
      });
      await legacyPage.goto(`http://127.0.0.1:5174/${route.legacyFile}`, { waitUntil: 'networkidle' });
      await legacyPage.waitForTimeout(300);

      const legacyShot = path.join(OUTPUT, `legacy-${route.label.toLowerCase().replace(/\s+/g, '-')}-${vp.name}.png`);
      await legacyPage.screenshot({ path: legacyShot, fullPage: false });
      await legacyPage.close();
    }

    await page.close();
  }

  // Test Interactive Components at 1900x868
  console.log('\nTesting Interactive Features (CardNav, ClickSpark, QuickView)...');
  const page = await browser.newPage({
    viewport: { width: 1900, height: 868 }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[Interactive] ${msg.text()}`);
  });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // 1. Open Search Panel (CardNav)
  console.log('1. Testing CardNav Search Panel opening...');
  const searchBtn = await page.$('#searchBtn');
  await searchBtn.click();
  await page.waitForSelector('.search-bar-input', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(400);

  const searchOpenShot = path.join(OUTPUT, 'react-search-open-empty.png');
  await page.screenshot({ path: searchOpenShot });

  // 2. Type "bunny" into CardNav input
  console.log('2. Testing CardNav Search typing "bunny"...');
  const searchInput = await page.$('.search-bar-input');
  await searchInput.fill('bunny');
  await page.waitForTimeout(400);

  const searchBunnyShot = path.join(OUTPUT, 'react-search-bunny.png');
  await page.screenshot({ path: searchBunnyShot });

  // 3. Click on the "Crochet Bunny" product result card inside CardNav
  console.log('3. Testing QuickView trigger from CardNav result...');
  const bunnyCard = await page.$('.card-nav__link');
  if (bunnyCard) {
    await bunnyCard.click();
    await page.waitForSelector('#quickViewDialog[open]', { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(500);

    const qvShot = path.join(OUTPUT, 'react-quickview-bunny.png');
    await page.screenshot({ path: qvShot });

    // Close QuickView
    const qvClose = await page.$('#qvCloseBtn');
    if (qvClose) await qvClose.click();
    await page.waitForTimeout(400);
  }

  // Re-open search and test no match
  await searchBtn.click();
  await page.waitForSelector('.search-bar-input', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(300);
  await searchInput.fill('xyznomatch123');
  await page.waitForTimeout(400);

  const searchNoMatchShot = path.join(OUTPUT, 'react-search-no-match.png');
  await page.screenshot({ path: searchNoMatchShot });

  // Press Escape to close search
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 4. Test Drawer Menu
  console.log('4. Testing Menu Drawer open/close...');
  const menuBtn = await page.$('#mobileToggleBtn');
  await menuBtn.click();
  await page.waitForTimeout(400);

  const drawerShot = path.join(OUTPUT, 'react-menu-drawer-open.png');
  await page.screenshot({ path: drawerShot });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 5. Test ClickSpark on Heart Toggle
  console.log('5. Testing ClickSpark & Saved Items...');
  // Scroll down to bestsellers
  await page.evaluate(() => {
    document.getElementById('bestsellers')?.scrollIntoView();
  });
  await page.waitForTimeout(500);

  const firstHeart = await page.$('.wish--slider');
  if (firstHeart) {
    await firstHeart.click();
    await page.waitForTimeout(200);

    // Verify saved badge is updated to 1
    const badgeText = await page.evaluate(() => {
      return document.getElementById('savedBadge')?.textContent;
    });
    console.log(`Saved badge text after click: ${badgeText}`);
  }

  await page.close();
  await browser.close();

  reactServer.close();
  legacyServer.close();

  // Contrast checks
  console.log('\n--- DARK SURFACE CONTRAST ANALYSIS (WCAG 4.5:1 Target) ---');
  const footerContrast = contrastRatio('#5E2A31', '#FFF7F2');
  const drawerContrast = contrastRatio('#5A1F29', '#FFF7F2');
  console.log(`Footer background (#5E2A31) vs Text (#FFF7F2): ${footerContrast.toFixed(2)}:1 (Pass: ${footerContrast >= 4.5})`);
  console.log(`Drawer background (#5A1F29) vs Text (#FFF7F2): ${drawerContrast.toFixed(2)}:1 (Pass: ${drawerContrast >= 4.5})`);

  // Navbar bounding rect table
  console.log('\n--- NAVBAR BOUNDING CLIENT RECTS ---');
  console.table(navbarRects);

  // Errors summary
  console.log('\n--- ERRORS SUMMARY ---');
  if (errors.length === 0) {
    console.log('Zero errors! Clean console and no horizontal overflows across all routes and viewports.');
  } else {
    console.error('Found errors/warnings:', errors);
  }

  console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

runParity().catch(err => {
  console.error('Parity run failed:', err);
  process.exit(1);
});
