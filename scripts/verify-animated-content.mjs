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
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    for (const path of ['/collections', '/story', '/help', '/privacy']) {
      await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      // Scroll through page to trigger ScrollTrigger animations
      const totalHeight = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y <= totalHeight; y += 500) {
        await page.evaluate(pos => window.scrollTo(0, pos), y);
        await page.waitForTimeout(200);
      }
      await page.waitForTimeout(900);
      const summary = await page.evaluate(() => {
        const cards = Array.from(
          document.querySelectorAll('.product-card--catalogue, .story-process-card, .story-belief-card, .help-step, .help-faq-item, .privacy-section p')
        );
        const hidden = cards.filter(c => parseFloat(getComputedStyle(c).opacity) < 0.99);
        return { total: cards.length, hidden: hidden.length };
      });
      console.log(path, summary);
      if (summary.hidden > 0) {
        throw new Error(`Some animated elements on ${path} stayed hidden: ${JSON.stringify(summary)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Page errors: ${errors.join('; ')}`);
    }

    await browser.close();
    console.log('ALL ANIMATED CONTENT VERIFICATIONS PASSED');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  preview.kill();
  process.exit(1);
});
