import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const f1Base64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795343807793_50c0c804.jpg').toString('base64');
  const f2Base64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795443526243_f0da2205.jpg').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1200 } });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>body { margin: 10px; background: #222; color: #fff; font-family: sans-serif; }</style></head>
    <body>
      <h3>f1: media_1795343807793_50c0c804.jpg (from Request 3)</h3>
      <img src="data:image/jpeg;base64,${f1Base64}" style="max-width: 100%; border: 2px solid cyan;" />
      <h3>f2: media_1795443526243_f0da2205.jpg (Current Upload)</h3>
      <img src="data:image/jpeg;base64,${f2Base64}" style="max-width: 100%; border: 2px solid yellow;" />
    </body>
    </html>
  `);

  await page.screenshot({ path: 'parity-output/f1-vs-f2.png', fullPage: true });

  const info = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).map(img => ({ w: img.naturalWidth, h: img.naturalHeight }));
  });

  console.log('f1 vs f2 info:', info);
  await browser.close();
}

main().catch(console.error);
