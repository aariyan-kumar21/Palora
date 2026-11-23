import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const upBase64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795443526243_f0da2205.jpg').toString('base64');
  const r1024Base64 = fs.readFileSync('react-1024x465.png').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  await page.setContent(`
    <img id="up" src="data:image/jpeg;base64,${upBase64}" />
    <img id="re" src="data:image/png;base64,${r1024Base64}" />
  `);

  const diff = await page.evaluate(() => {
    const up = document.getElementById('up');
    const re = document.getElementById('re');

    function getCanvas(img) {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, c.width, c.height);
    }

    const dUp = getCanvas(up);
    const dRe = getCanvas(re);

    // Let's compare row by row or find differences
    let diffPixels = 0;
    const diffRows = [];
    for (let y = 0; y < 465; y++) {
      let rowDiff = 0;
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        const dr = Math.abs(dUp.data[idx] - dRe.data[idx]);
        const dg = Math.abs(dUp.data[idx+1] - dRe.data[idx+1]);
        const db = Math.abs(dUp.data[idx+2] - dRe.data[idx+2]);
        if (dr > 30 || dg > 30 || db > 30) {
          diffPixels++;
          rowDiff++;
        }
      }
      if (rowDiff > 50) diffRows.push(y);
    }

    return {
      totalPixels: 1024 * 465,
      diffPixels,
      pctDiff: ((diffPixels / (1024 * 465)) * 100).toFixed(2) + '%',
      diffRowRange: diffRows.length > 0 ? [diffRows[0], diffRows[diffRows.length - 1]] : null
    };
  });

  console.log('Diff result between uploaded and react-1024x465:', diff);
  await browser.close();
}

main().catch(console.error);
