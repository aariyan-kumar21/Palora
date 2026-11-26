import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { chromium } from 'playwright';

const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve('responsive-output/baseline');

const VIEWPORTS = [
  { name: '1900x868', width: 1900, height: 868 },
  { name: '1536x730', width: 1536, height: 730 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'collections', path: '/collections' },
  { name: 'story', path: '/story' },
  { name: 'help', path: '/help' },
  { name: 'privacy', path: '/privacy' },
];

async function waitForServer(url, retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Preview server did not start in time');
}

async function main() {
  const preview = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'],
    { stdio: 'ignore' }
  );

  try {
    await waitForServer(`${BASE_URL}/`);
    const browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });

    for (const vp of VIEWPORTS) {
      const dir = path.join(OUT_DIR, vp.name);
      fs.mkdirSync(dir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      for (const pg of PAGES) {
        await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);

        // Trigger lazy-loaded below-fold sections and scroll animations deterministically
        const totalHeight = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y <= totalHeight; y += 500) {
          await page.evaluate(pos => window.scrollTo(0, pos), y);
          await page.waitForTimeout(120);
        }
        await page.waitForTimeout(900);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);

        await page.screenshot({ path: path.join(dir, `${pg.name}.png`), fullPage: false });
        await page.screenshot({ path: path.join(dir, `${pg.name}-full.png`), fullPage: true });
        console.log(`Captured baseline: ${vp.name}/${pg.name}`);
      }

      await context.close();
    }

    await browser.close();
    console.log('BASELINE CAPTURE COMPLETE');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
