import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const upBase64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795443526243_f0da2205.jpg').toString('base64');
  const r1024Base64 = fs.readFileSync('react-1024x465.png').toString('base64');
  const r1900Base64 = fs.readFileSync('react-current-hero.png').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1800 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 20px; background: #1a1a1a; color: #fff; font-family: sans-serif; }
        .row { margin-bottom: 30px; }
        img { display: block; border: 2px solid #555; max-width: 1024px; }
      </style>
    </head>
    <body>
      <div class="row">
        <h3>1. USER UPLOADED IMAGE: Target scale & centering</h3>
        <img id="up" src="data:image/jpeg;base64,${upBase64}" />
      </div>
      <div class="row">
        <h3>2. REACT CURRENT AT 1024x465</h3>
        <img id="r1024" src="data:image/png;base64,${r1024Base64}" />
      </div>
      <div class="row">
        <h3>3. REACT CURRENT AT 1900x868 (scaled down to 1024 wide for display)</h3>
        <img id="r1900" src="data:image/png;base64,${r1900Base64}" />
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'parity-output/comparison-visual.png', fullPage: true });

  const analysis = await page.evaluate(() => {
    function getBox(imgId) {
      const img = document.getElementById(imgId);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Sample a few key regions to see differences:
      // Let's sample header, wordmark, hero text position, benefits bar
      return {
        id: imgId,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      };
    }
    return [getBox('up'), getBox('r1024'), getBox('r1900')];
  });

  console.log('Images analysis:', analysis);
  await browser.close();
}

main().catch(console.error);
