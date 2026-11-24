import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1900, height: 868 } });
  await page.goto('http://127.0.0.1:3001/', { waitUntil: 'networkidle' });
  
  // Find all elements containing svg or button or arrow
  const elements = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('button, a, [class*="arrow"], [class*="nav"], [class*="btn"], svg').forEach(el => {
      const rect = el.getBoundingClientRect();
      const text = (el.innerText || '').trim();
      const cls = el.className?.baseVal || el.className || '';
      if (rect.width > 0 && rect.height > 0 && rect.top < 1500) {
        results.push({
          tag: el.tagName,
          cls: String(cls),
          text: text.substring(0, 30),
          rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) }
        });
      }
    });
    return results;
  });
  
  console.log(JSON.stringify(elements, null, 2));
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
