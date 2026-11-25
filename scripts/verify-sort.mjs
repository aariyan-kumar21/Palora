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

    await page.goto('http://127.0.0.1:4173/collections', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // 1. Open sort dropdown
    await page.locator('.custom-sort-trigger').click();
    await page.waitForTimeout(250);
    const dropdownState = await page.locator('.custom-sort-dropdown').evaluate(el => ({
      isOpenClass: el.classList.contains('is-open'),
      visibility: getComputedStyle(el).visibility,
      opacity: getComputedStyle(el).opacity
    }));
    console.log('Dropdown open state:', dropdownState);
    if (!dropdownState.isOpenClass || dropdownState.visibility !== 'visible' || dropdownState.opacity !== '1') {
      throw new Error('Sort dropdown did not become visible!');
    }

    // 2. Select Price: Low to High
    await page.locator('.custom-sort-item', { hasText: 'Price: Low to High' }).click();
    await page.waitForTimeout(200);
    const lowToHighPrices = await page.locator('#catalogueGrid .product-card__price').allTextContents();
    const numsLow = lowToHighPrices.map(t => parseInt(t.replace(/[^\d]/g, ''), 10));
    console.log('Low to High:', { label: await page.locator('.custom-sort-current').textContent(), prices: numsLow });
    if (numsLow[0] > numsLow[numsLow.length - 1]) {
      throw new Error('Products not sorted Low to High!');
    }

    // 3. Select Price: High to Low
    await page.locator('.custom-sort-trigger').click();
    await page.waitForTimeout(200);
    await page.locator('.custom-sort-item', { hasText: 'Price: High to Low' }).click();
    await page.waitForTimeout(200);
    const highToLowPrices = await page.locator('#catalogueGrid .product-card__price').allTextContents();
    const numsHigh = highToLowPrices.map(t => parseInt(t.replace(/[^\d]/g, ''), 10));
    console.log('High to Low:', { label: await page.locator('.custom-sort-current').textContent(), prices: numsHigh });
    if (numsHigh[0] < numsHigh[numsHigh.length - 1]) {
      throw new Error('Products not sorted High to Low!');
    }

    await browser.close();
    console.log('SORT VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
