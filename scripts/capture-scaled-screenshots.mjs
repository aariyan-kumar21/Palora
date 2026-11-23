import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const viewports = [
    { width: 1900, height: 868, name: '1900x868' },
    { width: 1536, height: 730, name: '1536x730' }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Viewport screenshot (Hero + Benefits)
    await page.screenshot({ path: `parity-output/scaled-hero-${vp.name}.png` });

    // Scroll to bestsellers and snap
    await page.evaluate(() => {
      document.querySelector('#bestsellers')?.scrollIntoView();
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `parity-output/scaled-bestsellers-${vp.name}.png` });

    // Full page screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `parity-output/scaled-fullpage-${vp.name}.png`, fullPage: true });

    await page.close();
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
}

main().catch(console.error);
