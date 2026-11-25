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

    // 1. Open search -> pill bar + Most Trending list + blur backdrop
    await page.locator('#searchBtn').click();
    await page.locator('#searchPanel').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(500);

    const trendingState = await page.evaluate(() => {
      const pill = document.querySelector('.search-pill-bar');
      const heading = document.querySelector('.search-results-heading')?.textContent;
      const rows = document.querySelectorAll('.search-product-row');
      const backdrop = document.querySelector('.search-backdrop');
      const closeBtn = document.querySelector('.search-bar-close-btn');
      return {
        pillRadius: pill ? getComputedStyle(pill).borderTopLeftRadius : null,
        heading,
        trendingCount: rows.length,
        hasBackdropBlur: backdrop ? getComputedStyle(backdrop).backdropFilter.includes('blur(8px)') : false,
        closeBtnBorder: closeBtn ? getComputedStyle(closeBtn).borderTopStyle : null
      };
    });
    console.log('Trending state:', trendingState);
    if (
      trendingState.pillRadius !== '9999px' ||
      trendingState.heading !== 'MOST TRENDING' ||
      trendingState.trendingCount === 0 ||
      !trendingState.hasBackdropBlur ||
      trendingState.closeBtnBorder !== 'none'
    ) {
      throw new Error('Trending state check failed!');
    }

    // 2. Type "bunny" -> detailed search results with image, badge, description, and Jost price
    await page.locator('.search-bar-input').fill('bunny');
    await page.waitForTimeout(150);
    const searchState = await page.evaluate(() => {
      const heading = document.querySelector('.search-results-heading')?.textContent;
      const row = document.querySelector('.search-product-row.is-detailed');
      const img = row?.querySelector('img');
      const desc = row?.querySelector('.search-product-desc')?.textContent;
      const price = row?.querySelector('.search-product-price');
      return {
        heading,
        hasImg: Boolean(img),
        desc,
        priceText: price?.textContent,
        priceFont: price ? getComputedStyle(price).fontFamily : null
      };
    });
    console.log('Search results state:', searchState);
    if (!searchState.hasImg || !searchState.desc || !searchState.priceFont?.toLowerCase().includes('jost')) {
      throw new Error('Detailed search results check failed!');
    }

    // 3. Click X -> closes and unmounts cleanly
    await page.locator('.search-bar-close-btn').click();
    await page.locator('#searchPanel').waitFor({ state: 'detached', timeout: 800 });
    console.log('Closed via X cleanly: true');

    // 4. Reopen and click outside -> closes cleanly
    await page.locator('#searchBtn').click();
    await page.locator('#searchPanel').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(350);
    await page.mouse.click(40, 400);
    await page.locator('#searchPanel').waitFor({ state: 'detached', timeout: 800 });
    console.log('Closed via outside click cleanly: true');

    await browser.close();
    console.log('ALL SEARCH UI VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
