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

    // 3. Type "bunny" -> filters products & verify only 1 X button with no circle
    await page.locator('.search-bar-input').fill('bunny');
    await page.waitForTimeout(150);
    const typedState = await page.evaluate(() => {
      const panel = document.querySelector('.search-panel-wrap .card-nav__panel');
      const closeBtn = document.querySelector('.search-bar-close-btn');
      const clearBtns = document.querySelectorAll('.search-bar-clear-btn');
      const backdrop = document.querySelector('.search-backdrop');
      return {
        panelRadius: panel ? getComputedStyle(panel).borderTopLeftRadius : null,
        clearBtnCount: clearBtns.length,
        closeBtnBorder: closeBtn ? getComputedStyle(closeBtn).borderTopStyle : null,
        backdropBlur: backdrop ? getComputedStyle(backdrop).backdropFilter : null,
        backdropOpen: backdrop?.classList.contains('is-open'),
        firstCardDesc: document.querySelector('.search-panel-wrap .card-nav__description')?.textContent
      };
    });
    console.log('Typed & style state:', typedState);
    if (
      typedState.panelRadius !== '30px' ||
      typedState.clearBtnCount !== 0 ||
      typedState.closeBtnBorder !== 'none' ||
      !typedState.backdropOpen ||
      !typedState.backdropBlur?.includes('blur(8px)')
    ) {
      throw new Error('Pill shape, single unbordered X, or blur backdrop verification failed!');
    }

    // 4. Click X button -> closes search bar completely within 600ms
    await page.locator('.search-bar-close-btn').click();
    await page.locator('.search-panel-wrap .card-nav').waitFor({ state: 'detached', timeout: 800 });
    const closedVis = await page.evaluate(() => {
      const wrap = document.querySelector('.search-panel-wrap');
      const el = document.querySelector('.search-panel-wrap .card-nav');
      const backdrop = document.querySelector('.search-backdrop');
      return {
        exists: Boolean(el),
        hasWrap: Boolean(wrap),
        backdropOpen: backdrop?.classList.contains('is-open')
      };
    });
    console.log('Closed via X state:', closedVis);
    if (closedVis.exists || closedVis.backdropOpen) {
      throw new Error('Search CardNav did not close cleanly on X click!');
    }

    // 5. Re-open and click outside on screen -> closes cleanly
    await page.locator('#searchBtn').click();
    await page.locator('.search-panel-wrap .card-nav').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(400);
    await page.mouse.click(40, 400);
    await page.locator('.search-panel-wrap .card-nav').waitFor({ state: 'detached', timeout: 1500 });
    console.log('Closed via outside click: true');

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
