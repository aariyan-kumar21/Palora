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
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.locator('#categories').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#categories').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const cardCount = await page.locator('.rb-depth-carousel__card').count();
    const firstStyle = await page.locator('.rb-depth-carousel__card').first().evaluate(el => ({
      transform: el.style.transform,
      transition: getComputedStyle(el).transition
    }));
    const secondStyle = await page.locator('.rb-depth-carousel__card').nth(1).evaluate(el => ({
      transform: el.style.transform,
      filter: el.style.filter
    }));
    console.log('DepthCarousel initial:', { cardCount, firstStyle, secondStyle });

    if (cardCount !== 11) {
      throw new Error(`Expected 11 category cards, got ${cardCount}`);
    }

    // Click 3rd dot indicator
    await page.locator('.rb-depth-carousel__dot').nth(2).click();
    await page.waitForTimeout(850);
    const dot2Active = await page.locator('.rb-depth-carousel__dot').nth(2).getAttribute('aria-selected');
    const card2Active = await page.locator('.rb-depth-carousel__card').nth(2).evaluate(el => el.classList.contains('is-active'));
    console.log('After dot 3 click:', { dot2Active, card2Active });

    if (dot2Active !== 'true' || !card2Active) {
      throw new Error('DepthCarousel did not advance to slide 3!');
    }

    // Click the active card -> should navigate to /collections?category=...
    await page.locator('.rb-depth-carousel__card').nth(2).click();
    await page.waitForTimeout(300);
    const currentUrl = page.url();
    console.log('Navigated URL:', currentUrl);
    if (!currentUrl.includes('/collections?category=')) {
      throw new Error(`Expected navigation to /collections?category=..., got ${currentUrl}`);
    }

    await browser.close();
    console.log('DEPTH CAROUSEL VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
