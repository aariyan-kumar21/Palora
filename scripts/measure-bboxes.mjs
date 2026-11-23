import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const upBase64 = fs.readFileSync('C:/Users/Aariy/.gemini/antigravity/brain/766f3924-9b4e-4809-9a9f-0edd6fdfd864/.user_uploaded/media_1795443526243_f0da2205.jpg').toString('base64');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setContent(`<img id="up" src="data:image/jpeg;base64,${upBase64}" />`);

  const info = await page.evaluate(() => {
    const up = document.getElementById('up');
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 465;
    const ctx = c.getContext('2d');
    ctx.drawImage(up, 0, 0);
    const d = ctx.getImageData(0, 0, 1024, 465);

    // Let's find dark pixels (text) in the hero text area (x: 50 to 450, y: 100 to 350)
    // Dark pixels have low R, G, B: for #5A1623, R ~ 90, G ~ 22, B ~ 35.
    let minX = 1024, maxX = 0, minY = 465, maxY = 0;
    for (let y = 100; y < 350; y++) {
      for (let x = 50; x < 450; x++) {
        const i = (y * 1024 + x) * 4;
        const r = d.data[i], g = d.data[i+1], b = d.data[i+2];
        // Dark burgundy text:
        if (r < 140 && g < 80 && b < 80) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Also let's find navbar wordmark position (x: 400 to 600, y: 0 to 80)
    let wmMinX = 1024, wmMaxX = 0, wmMinY = 465, wmMaxY = 0;
    for (let y = 0; y < 80; y++) {
      for (let x = 400; x < 624; x++) {
        const i = (y * 1024 + x) * 4;
        const r = d.data[i], g = d.data[i+1], b = d.data[i+2];
        if (r < 140 && g < 80 && b < 80) {
          if (x < wmMinX) wmMinX = x;
          if (x > wmMaxX) wmMaxX = x;
          if (y < wmMinY) wmMinY = y;
          if (y > wmMaxY) wmMaxY = y;
        }
      }
    }

    // Also let's find benefits bar Y position
    let benY = 0;
    for (let y = 380; y < 465; y++) {
      const i = (y * 1024 + 100) * 4;
      const r = d.data[i], g = d.data[i+1], b = d.data[i+2];
      // Benefits bar is cream #FAF0E9 (r ~ 250, g ~ 240, b ~ 233)
      if (r > 240 && g > 230 && b > 220) {
        benY = y;
        break;
      }
    }

    return {
      heroTextBBox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
      wordmarkBBox: { wmMinX, wmMaxX, wmMinY, wmMaxY, width: wmMaxX - wmMinX, height: wmMaxY - wmMinY },
      benefitsBarStartY: benY
    };
  });

  console.log('Detected BBoxes in uploaded image:', info);

  // Now measure the same in React at 1024x465
  const pageReact = await browser.newPage({ viewport: { width: 1024, height: 465 } });
  await pageReact.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await pageReact.waitForSelector('.hero-heading');
  const reactInfo = await pageReact.evaluate(() => {
    const heading = document.querySelector('.hero-heading')?.getBoundingClientRect();
    const content = document.querySelector('.hero__content')?.getBoundingClientRect();
    const wm = document.querySelector('.site-wordmark')?.getBoundingClientRect();
    const ben = document.querySelector('#benefits')?.getBoundingClientRect();
    return { heading, content, wm, ben };
  });

  console.log('React at 1024x465 BBoxes:', reactInfo);

  // Now measure the same in React at 1900x868 scaled to 1024x465 ratio
  const pageReact1900 = await browser.newPage({ viewport: { width: 1900, height: 868 } });
  await pageReact1900.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await pageReact1900.waitForSelector('.hero-heading');
  const react1900Info = await pageReact1900.evaluate(() => {
    const heading = document.querySelector('.hero-heading').getBoundingClientRect();
    const content = document.querySelector('.hero__content').getBoundingClientRect();
    const wm = document.querySelector('.site-wordmark').getBoundingClientRect();
    const ben = document.querySelector('#benefits').getBoundingClientRect();
    const scale = 1024 / 1900;
    return {
      scale,
      headingScaled: { x: heading.x * scale, y: heading.y * scale, w: heading.width * scale, h: heading.height * scale },
      contentScaled: { x: content.x * scale, y: content.y * scale, w: content.width * scale, h: content.height * scale },
      wmScaled: { x: wm.x * scale, y: wm.y * scale, w: wm.width * scale, h: wm.height * scale },
      benScaled: { y: ben.y * scale, h: ben.height * scale }
    };
  });

  console.log('React at 1900x868 (scaled to 1024):', react1900Info);

  await browser.close();
}

main().catch(console.error);
