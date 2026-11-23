import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const upBase64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795443526243_f0da2205.jpg').toString('base64');
  const r1024Base64 = fs.readFileSync('react-1024x465.png').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1200 } });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body style="margin:0; background:#000;">
      <canvas id="cDiff" width="1024" height="465"></canvas>
      <img id="up" src="data:image/jpeg;base64,${upBase64}" style="display:none;" />
      <img id="re" src="data:image/png;base64,${r1024Base64}" style="display:none;" />
    </body>
    </html>
  `);

  await page.evaluate(() => {
    const up = document.getElementById('up');
    const re = document.getElementById('re');
    const cDiff = document.getElementById('cDiff');
    const ctx = cDiff.getContext('2d');

    const cUp = document.createElement('canvas');
    cUp.width = 1024; cUp.height = 465;
    const ctxUp = cUp.getContext('2d');
    ctxUp.drawImage(up, 0, 0);
    const dUp = ctxUp.getImageData(0, 0, 1024, 465);

    const cRe = document.createElement('canvas');
    cRe.width = 1024; cRe.height = 465;
    const ctxRe = cRe.getContext('2d');
    ctxRe.drawImage(re, 0, 0);
    const dRe = ctxRe.getImageData(0, 0, 1024, 465);

    const out = ctx.createImageData(1024, 465);
    for (let i = 0; i < dUp.data.length; i += 4) {
      const dr = Math.abs(dUp.data[i] - dRe.data[i]);
      const dg = Math.abs(dUp.data[i+1] - dRe.data[i+1]);
      const db = Math.abs(dUp.data[i+2] - dRe.data[i+2]);
      if (dr > 30 || dg > 30 || db > 30) {
        // Red highlight for diff
        out.data[i] = 255;
        out.data[i+1] = 0;
        out.data[i+2] = 0;
        out.data[i+3] = 255;
      } else {
        // Grayscale background
        const g = (dUp.data[i] + dUp.data[i+1] + dUp.data[i+2]) / 3;
        out.data[i] = g * 0.3;
        out.data[i+1] = g * 0.3;
        out.data[i+2] = g * 0.3;
        out.data[i+3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  });

  await page.screenshot({ path: 'parity-output/diff-highlight.png' });

  // Let's also inspect specific coordinates in the uploaded image!
  const coords = await page.evaluate(() => {
    const up = document.getElementById('up');
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 465;
    const ctx = c.getContext('2d');
    ctx.drawImage(up, 0, 0);

    // Let's sample along horizontal lines to find:
    // 1. Where navbar ends
    // 2. Where benefits bar starts and ends
    // 3. Where the hero text is horizontally
    return {
      // Sample top-left (HOME link)
      // Sample center (PALORA)
      // Sample bottom (benefits)
    };
  });

  console.log('Diff highlight generated at parity-output/diff-highlight.png');
  await browser.close();
}

main().catch(console.error);
