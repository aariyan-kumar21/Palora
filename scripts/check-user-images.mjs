import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const s1 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795491637552_af2cb288.png').toString('base64');
  const s2 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795491691331_925056c1.jpg').toString('base64');
  const s3 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795491728498_6b0952ae.png').toString('base64');
  const s4 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795491802912_ea432256.png').toString('base64');
  const s5 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795491870075_7e65a788.png').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setContent(`
    <img id="s1" src="data:image/png;base64,${s1}" />
    <img id="s2" src="data:image/jpeg;base64,${s2}" />
  `);

  const info = await page.evaluate(() => {
    const s1 = document.getElementById('s1');
    const s2 = document.getElementById('s2');
    return {
      s1: { w: s1.naturalWidth, h: s1.naturalHeight },
      s2: { w: s2.naturalWidth, h: s2.naturalHeight }
    };
  });

  console.log('Images dimensions:', info);
  await browser.close();
}

main().catch(console.error);
