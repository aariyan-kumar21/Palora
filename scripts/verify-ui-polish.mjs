import { chromium } from 'playwright';
import { spawn } from 'child_process';

const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', '4173', '--host', '127.0.0.1', '--strictPort'], {
  stdio: 'ignore'
});

async function waitForServer(url, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error('Server did not start in time');
}

async function main() {
  try {
    await waitForServer('http://127.0.0.1:4173/');
    const browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage({ viewport: { width: 1536, height: 730 } });

    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

    // 1. Check navbar indicator on HOME and on hover COLLECTIONS
    const indHome = await page.evaluate(() => {
      const ind = document.querySelector('.nav-indicator');
      const home = document.querySelector('a[data-nav-path="/"]');
      const indRect = ind?.getBoundingClientRect();
      const homeRect = home?.getBoundingClientRect();
      return {
        indLeft: ind?.style.left,
        indWidth: ind?.style.width,
        gapPx: indRect && homeRect ? indRect.top - homeRect.bottom : null
      };
    });

    await page.locator('a[data-nav-path="/collections"]').hover();
    await page.waitForTimeout(350);
    const indHover = await page.evaluate(() => {
      const ind = document.querySelector('.nav-indicator');
      const col = document.querySelector('a[data-nav-path="/collections"]');
      return {
        indLeft: ind?.style.left,
        indWidth: ind?.style.width,
        hasHoverClass: ind?.classList.contains('is-hovering'),
        colTransform: getComputedStyle(col).transform
      };
    });
    console.log('Navbar indicator:', { indHome, indHover });

    if (indHome.indLeft === indHover.indLeft || !indHover.hasHoverClass) {
      throw new Error('Navbar indicator did not move on hover!');
    }

    // 2. Scroll to bestsellers, open QuickView, add to cart, open cart, check all pricing fonts
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.locator('#bestsellers').waitFor({ state: 'visible', timeout: 5000 });
    const sliderPriceFont = await page.locator('.product-card__price').first().evaluate(el => getComputedStyle(el).fontFamily);

    await page.locator('#bestsellerTrack .product-card').first().click();
    await page.waitForTimeout(150);
    const qvPriceFont = await page.locator('#qvPrice').evaluate(el => getComputedStyle(el).fontFamily);

    await page.locator('#qvAddBtn').click();
    await page.waitForTimeout(550);

    await page.locator('#cartBtn').click();
    await page.waitForTimeout(200);
    const cartFonts = await page.evaluate(() => {
      const unit = document.querySelector('.cart-item-unit-price');
      const summary = document.querySelector('.cart-summary-item-price');
      const grand = document.querySelector('.cart-grand-total-amount');
      const input = document.querySelector('#cartModal input');
      return {
        unit: unit ? getComputedStyle(unit).fontFamily : null,
        summary: summary ? getComputedStyle(summary).fontFamily : null,
        grand: grand ? getComputedStyle(grand).fontFamily : null,
        input: input ? getComputedStyle(input).fontFamily : null
      };
    });
    console.log('Pricing fonts:', { sliderPriceFont, qvPriceFont, cartFonts });

    for (const [k, v] of Object.entries({ sliderPriceFont, qvPriceFont, ...cartFonts })) {
      if (!v || !v.toLowerCase().includes('jost')) {
        throw new Error(`Expected ${k} to use Jost, got ${v}`);
      }
    }

    await browser.close();
    console.log('ALL POLISH VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
