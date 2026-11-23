import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1536, height: 730 } });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // Scroll to load all sections
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);

  const sections = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('section, footer, header, .container, .bestsellers-grid, .depth-carousel, .how-steps, .personalize-wrap').forEach(el => {
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      list.push({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        width: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        margin: cs.margin,
        maxWidth: cs.maxWidth
      });
    });
    return list;
  });

  console.log('Sections layout at 1536x730:');
  console.table(sections.slice(0, 20));

  await browser.close();
}

main().catch(console.error);
