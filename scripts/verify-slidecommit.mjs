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
    const context = await browser.newContext({ viewport: { width: 1536, height: 730 } });
    const page = await context.newPage();
    page.on('pageerror', err => console.error('PAGEERROR:', err));

    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

    // Add an item to cart via QuickView
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.locator('#bestsellers').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#bestsellerTrack .product-card').first().click();
    await page.waitForTimeout(150);
    await page.locator('#qvAddBtn').click();
    await page.waitForTimeout(550);

    // Open cart
    await page.locator('#cartBtn').click();
    await page.waitForTimeout(350);

    // Scroll SlideCommit into view inside the modal
    await page.locator('.slide-commit__track').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);

    const scInfo = await page.evaluate(() => {
      const root = document.querySelector('.slide-commit');
      const track = document.querySelector('.slide-commit__track');
      const rect = track?.getBoundingClientRect();
      return {
        exists: Boolean(root),
        disabled: root?.hasAttribute('data-disabled'),
        phase: root?.getAttribute('data-phase'),
        label: document.querySelector('.slide-commit__text--plain')?.textContent,
        rect: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null
      };
    });
    console.log('SlideCommit info:', scInfo);

    if (!scInfo.rect || scInfo.disabled) {
      throw new Error('SlideCommit is missing or disabled!');
    }

    // Listen for popup (WhatsApp tab)
    const popupPromise = context.waitForEvent('page', { timeout: 3000 }).catch(() => null);

    // Drag from left handle to right end of track
    const startX = scInfo.rect.left + 28;
    const startY = scInfo.rect.top + scInfo.rect.height / 2;
    const endX = scInfo.rect.left + scInfo.rect.width - 10;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 60, startY, { steps: 5 });
    const midVal = await page.locator('.slide-commit__capsule').getAttribute('aria-valuenow');
    await page.mouse.move(endX, startY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const popup = await popupPromise;
    const afterState = await page.evaluate(() => ({
      phase: document.querySelector('.slide-commit')?.getAttribute('data-phase'),
      ariaNow: document.querySelector('.slide-commit__capsule')?.getAttribute('aria-valuenow')
    }));
    console.log('Drag result:', { midVal, afterState, popupUrl: popup?.url() });

    await browser.close();
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
