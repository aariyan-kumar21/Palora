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
    // Scroll to bestsellers so lazy HomeBelowFold mounts
    await page.locator('#bestsellers').waitFor({ state: 'attached', timeout: 5000 }).catch(async () => {
      await page.evaluate(() => window.scrollTo(0, 700));
      await page.locator('#bestsellers').waitFor({ state: 'visible', timeout: 5000 });
    });
    await page.locator('#bestsellers').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // 1. Check View all products alignment vs first product card
    const alignment = await page.evaluate(() => {
      const firstCard = document.querySelector('#bestsellerTrack .product-card')?.getBoundingClientRect();
      const footerLink = document.querySelector('.bestsellers__footer .link-arrow')?.getBoundingClientRect();
      return {
        cardLeft: firstCard?.left,
        cardBottom: firstCard?.bottom,
        linkLeft: footerLink?.left,
        linkTop: footerLink?.top,
        gap: footerLink && firstCard ? footerLink.top - firstCard.bottom : null
      };
    });
    console.log('Alignment:', JSON.stringify(alignment));

    // 2. Click heart button on first bestseller card
    const firstHeart = page.locator('#bestsellerTrack .product-card .wish').first();
    const initialPressed = await firstHeart.getAttribute('aria-pressed');
    await firstHeart.click();
    await page.waitForTimeout(30);
    const heartCanvasCount = await page.locator('canvas').count();
    const afterPressed = await firstHeart.getAttribute('aria-pressed');
    const qvOpenAfterHeart = await page.locator('#quickViewDialog').evaluate(el => el.open);
    console.log('Heart toggle:', { initialPressed, afterPressed, qvOpenAfterHeart, heartCanvasCount });

    if (initialPressed === afterPressed) {
      throw new Error('Heart button did not toggle aria-pressed!');
    }
    if (qvOpenAfterHeart) {
      throw new Error('Clicking heart button should not open QuickView!');
    }

    // 3. Click first bestseller product card -> opens QuickView
    const firstCard = page.locator('#bestsellerTrack .product-card').first();
    await firstCard.click();
    await page.waitForTimeout(150);
    const qvState = await page.evaluate(() => {
      const dialog = document.getElementById('quickViewDialog');
      return {
        open: dialog?.open,
        title: document.getElementById('qv-title')?.textContent,
        price: document.getElementById('qvPrice')?.textContent,
        desc: document.getElementById('qvDesc')?.textContent,
        hasAddBtn: Boolean(document.getElementById('qvAddBtn'))
      };
    });
    console.log('QuickView state:', JSON.stringify(qvState));
    if (!qvState.open || !qvState.title || !qvState.hasAddBtn) {
      throw new Error('QuickView did not open properly on bestseller card click!');
    }

    // 4. Click Add to Cart -> ClickSpark canvas spawns and cart updates
    await page.locator('#qvAddBtn').click();
    await page.waitForTimeout(30);
    const sparkCanvasCount = await page.locator('#quickViewDialog canvas').count();
    const totalCanvasCount = await page.locator('canvas').count();
    await page.waitForTimeout(500);
    const cartCount = await page.locator('#cartBadge').textContent();
    const qvOpenAfterAdd = await page.locator('#quickViewDialog').evaluate(el => el.open);
    console.log('Add to cart:', { sparkCanvasCount, totalCanvasCount, cartCount, qvOpenAfterAdd });

    if (cartCount !== '1') {
      throw new Error(`Expected cartCount to be '1', got '${cartCount}'`);
    }

    // 5. Verify Collections page card & heart
    await page.goto('http://127.0.0.1:4173/collections', { waitUntil: 'networkidle' });
    const catHeart = page.locator('#catalogueGrid .product-card--catalogue .wish--catalogue').first();
    const catInitial = await catHeart.getAttribute('aria-pressed');
    await catHeart.click();
    await page.waitForTimeout(100);
    const catAfter = await catHeart.getAttribute('aria-pressed');
    console.log('Catalogue heart toggle:', { catInitial, catAfter });
    if (catInitial === catAfter) {
      throw new Error('Catalogue heart button did not toggle!');
    }

    await page.locator('#catalogueGrid .product-card--catalogue').first().click();
    await page.waitForTimeout(150);
    const catQvOpen = await page.locator('#quickViewDialog').evaluate(el => el.open);
    console.log('Catalogue QuickView open:', catQvOpen);
    if (!catQvOpen) {
      throw new Error('Catalogue card click did not open QuickView!');
    }

    await browser.close();
    console.log('ALL VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
