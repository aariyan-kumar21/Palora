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
    page.on('pageerror', err => console.error('PAGEERROR:', err));

    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

    // 1. Click search button -> lazy loads and opens with CardNav
    await page.locator('#searchBtn').click();
    await page.locator('.search-panel-wrap .card-nav').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(600);
    const openState = await page.evaluate(() => {
      const nav = document.querySelector('.search-panel-wrap .card-nav');
      const closeBtn = document.querySelector('.search-bar-close-btn');
      const cards = document.querySelectorAll('.search-panel-wrap .card-nav__card');
      return {
        hasOpen: nav?.hasAttribute('data-open'),
        hasShown: nav?.hasAttribute('data-shown'),
        visibility: nav ? getComputedStyle(nav).visibility : null,
        closeText: closeBtn?.textContent?.trim(),
        hasCloseSvg: Boolean(closeBtn?.querySelector('svg')),
        cardCount: cards.length
      };
    });
    console.log('Open state:', openState);
    if (!openState.hasOpen || !openState.hasShown || openState.visibility !== 'visible' || openState.closeText !== '' || !openState.hasCloseSvg || openState.cardCount !== 3) {
      throw new Error('Search CardNav did not open properly or close button is not an X icon!');
    }

    // 3. Type "bunny" -> filters products
    await page.locator('.search-bar-input').fill('bunny');
    await page.waitForTimeout(150);
    const firstCardDesc = await page.locator('.search-panel-wrap .card-nav__description').first().textContent();
    console.log('Filtered products desc:', firstCardDesc);

    // 4. Click X close button -> closes cleanly
    await page.locator('.search-bar-close-btn').click();
    await page.waitForTimeout(900);
    const closedVis = await page.evaluate(() => {
      const wrap = document.querySelector('.search-panel-wrap');
      const el = document.querySelector('.search-panel-wrap .card-nav');
      if (!el) return { exists: false, hasWrap: Boolean(wrap), rootLen: document.getElementById('root')?.innerHTML.length };
      return {
        exists: true,
        hasOpen: el.hasAttribute('data-open'),
        hasShown: el.hasAttribute('data-shown'),
        visibility: getComputedStyle(el).visibility
      };
    });
    console.log('Closed state:', closedVis);
    if (closedVis.exists) {
      throw new Error('Search CardNav did not unmount cleanly after close animation!');
    }

    // 5. Re-open search button -> opens again cleanly
    await page.locator('#searchBtn').click();
    await page.locator('.search-panel-wrap .card-nav').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);
    const reopened = await page.locator('.search-panel-wrap .card-nav').evaluate(el => el.hasAttribute('data-open'));
    console.log('Reopened:', reopened);
    if (!reopened) {
      throw new Error('Search CardNav did not re-open!');
    }

    await browser.close();
    console.log('SEARCH CARDNAV VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
