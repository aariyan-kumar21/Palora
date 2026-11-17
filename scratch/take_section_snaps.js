const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

async function takeSnap(selector, filename) {
  let homeHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
  
  if (selector) {
    homeHtml = homeHtml.replace('</body>', `<script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          const el = document.querySelector('${selector}');
          if (el) el.scrollIntoView({ block: 'center' });
        }, 500);
      });
    </script></body>`);
  }

  const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'snap_' + path.basename(filename, '.png') + '.html');
  fs.writeFileSync(testFile, homeHtml, 'utf8');
  const outPath = path.join(artifactDir, filename);

  return new Promise((resolve) => {
    const proc = spawn(chromePath, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      `--screenshot=${outPath}`,
      '--virtual-time-budget=3500',
      'file:///' + testFile.replace(/\\/g, '/')
    ]);
    proc.on('close', () => {
      console.log(`Saved screenshot: ${filename} (${fs.existsSync(outPath) ? fs.statSync(outPath).size : 0} bytes)`);
      resolve();
    });
  });
}

async function run() {
  // 1. Hero / Navbar / Scroll button
  await takeSnap(null, 'fix1_hero_navbar_scroll.png');
  // 2. Bestsellers
  await takeSnap('#bestsellers', 'fix2_bestsellers.png');
  // 3. How it works & Personalize gap
  await takeSnap('.callout', 'fix3_how_it_works_gap.png');
  // 4. Footer
  await takeSnap('#site-footer', 'fix4_footer_social_watermark.png');
}

run();
