import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { chromium } from 'playwright';

const PORT = 4175;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const BASELINE_DIR = path.resolve('responsive-output/baseline');
const CURRENT_DIR = path.resolve('responsive-output/laptop-lock-current');

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

async function diffPngs(diffPage, fileA, fileB) {
  const b64A = fs.readFileSync(fileA).toString('base64');
  const b64B = fs.readFileSync(fileB).toString('base64');

  return diffPage.evaluate(async ({ a, b }) => {
    const loadImg = src =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = 'data:image/png;base64,' + src;
      });

    const [imgA, imgB] = await Promise.all([loadImg(a), loadImg(b)]);
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      return {
        diffPct: 100,
        reason: `Dimension mismatch: ${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height}`,
      };
    }

    const w = imgA.width;
    const h = imgA.height;
    const cA = document.createElement('canvas');
    const cB = document.createElement('canvas');
    cA.width = cB.width = w;
    cA.height = cB.height = h;
    const ctxA = cA.getContext('2d');
    const ctxB = cB.getContext('2d');
    ctxA.drawImage(imgA, 0, 0);
    ctxB.drawImage(imgB, 0, 0);
    const dA = ctxA.getImageData(0, 0, w, h).data;
    const dB = ctxB.getImageData(0, 0, w, h).data;

    let diffPixels = 0;
    for (let i = 0; i < dA.length; i += 4) {
      if (
        Math.abs(dA[i] - dB[i]) > 6 ||
        Math.abs(dA[i + 1] - dB[i + 1]) > 6 ||
        Math.abs(dA[i + 2] - dB[i + 2]) > 6 ||
        Math.abs(dA[i + 3] - dB[i + 3]) > 6
      ) {
        diffPixels++;
      }
    }
    const total = w * h;
    const diffPct = Number(((diffPixels / total) * 100).toFixed(4));
    return { diffPct, diffPixels, total };
  }, { a: b64A, b: b64B });
}

async function main() {
  if (!fs.existsSync(BASELINE_DIR)) {
    throw new Error(`Baseline directory not found at ${BASELINE_DIR}. Run scripts/baseline.mjs first.`);
  }

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

    const diffContext = await browser.newContext();
    const diffPage = await diffContext.newPage();
    const results = [];
    let failures = 0;

    for (const vp of VIEWPORTS) {
      const curDir = path.join(CURRENT_DIR, vp.name);
      fs.mkdirSync(curDir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      for (const pg of PAGES) {
        await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);

        const totalHeight = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y <= totalHeight; y += 500) {
          await page.evaluate(pos => window.scrollTo(0, pos), y);
          await page.waitForTimeout(120);
        }
        await page.waitForTimeout(900);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);

        const vpCur = path.join(curDir, `${pg.name}.png`);
        const vpBase = path.join(BASELINE_DIR, vp.name, `${pg.name}.png`);
        await page.screenshot({ path: vpCur, fullPage: false });

        const vpDiff = await diffPngs(diffPage, vpBase, vpCur);
        const pass = vpDiff.diffPct === 0;
        if (!pass) failures++;

        results.push({
          viewport: vp.name,
          page: pg.name,
          diffPct: `${vpDiff.diffPct}%`,
          status: pass ? 'PASS' : `FAIL (${vpDiff.reason || vpDiff.diffPixels + ' px'})`,
        });
      }

      await context.close();
    }

    await diffContext.close();
    await browser.close();

    console.table(results);
    if (failures > 0) {
      throw new Error(`Laptop-lock failed on ${failures} viewport/page pair(s).`);
    }
    console.log('LAPTOP-LOCK PASSED: 0% diff across all locked viewports.');
  } finally {
    preview.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
