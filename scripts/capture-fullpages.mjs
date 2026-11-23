import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1536, height: 730 } });
  
  const pages = [
    { url: 'http://127.0.0.1:3000/', name: 'home' },
    { url: 'http://127.0.0.1:3000/collections', name: 'collections' },
    { url: 'http://127.0.0.1:3000/story', name: 'story' },
    { url: 'http://127.0.0.1:3000/help', name: 'help' }
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    // Scroll down to load all content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `parity-output/fullpage-${p.name}-1536.png`, fullPage: true });
  }

  await browser.close();
  console.log('Fullpage screenshots captured at 1536x730');
}

main().catch(console.error);
