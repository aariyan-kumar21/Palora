import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const f1Base64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795343807793_50c0c804.jpg').toString('base64');
  const f2Base64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795443526243_f0da2205.jpg').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setContent(`
    <img id="f1" src="data:image/jpeg;base64,${f1Base64}" />
    <img id="f2" src="data:image/jpeg;base64,${f2Base64}" />
  `);

  const res = await page.evaluate(() => {
    const f1 = document.getElementById('f1');
    const f2 = document.getElementById('f2');
    const c1 = document.createElement('canvas'); c1.width = 1024; c1.height = 465;
    const c2 = document.createElement('canvas'); c2.width = 1024; c2.height = 465;
    const ctx1 = c1.getContext('2d'); ctx1.drawImage(f1, 0, 0);
    const ctx2 = c2.getContext('2d'); ctx2.drawImage(f2, 0, 0);
    const d1 = ctx1.getImageData(0, 0, 1024, 465);
    const d2 = ctx2.getImageData(0, 0, 1024, 465);

    // Let's sample colors in f1 vs f2 at y = 20 (navbar)
    // and at y = 200 (hero)
    // and at y = 430 (benefits)
    function sampleRow(d, y) {
      const colors = [];
      for (let x = 0; x < 1024; x += 100) {
        const i = (y * 1024 + x) * 4;
        colors.push(`rgb(${d.data[i]},${d.data[i+1]},${d.data[i+2]})`);
      }
      return colors;
    }

    return {
      f1_nav: sampleRow(d1, 20),
      f2_nav: sampleRow(d2, 20),
      f1_hero: sampleRow(d1, 200),
      f2_hero: sampleRow(d2, 200),
      f1_ben: sampleRow(d1, 430),
      f2_ben: sampleRow(d2, 430)
    };
  });

  console.log('Sampled colors:', JSON.stringify(res, null, 2));
  await browser.close();
}

main().catch(console.error);
