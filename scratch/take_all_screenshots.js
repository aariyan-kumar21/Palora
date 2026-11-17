const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

async function takeScreenshot(htmlContent, outFilename, options = {}) {
  const testHtml = htmlContent.replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
  const tempPath = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'snap_' + path.basename(outFilename, '.png') + '.html');
  fs.writeFileSync(tempPath, testHtml, 'utf8');

  const outPath = path.join(artifactDir, outFilename);

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--window-size=${options.width || 1900},${options.height || 868}`,
    `--screenshot=${outPath}`,
    '--virtual-time-budget=4000',
    'file:///' + tempPath.replace(/\\/g, '/')
  ];

  return new Promise((resolve) => {
    const proc = spawn(chromePath, args);
    proc.on('close', (code) => {
      console.log(`Saved screenshot: ${outFilename} (exit ${code}, size: ${fs.existsSync(outPath) ? fs.statSync(outPath).size : 0} bytes)`);
      resolve();
    });
  });
}

async function runScreenshots() {
  // 1. Homepage closed
  const homeHtml = fs.readFileSync('index.html', 'utf8');
  await takeScreenshot(homeHtml, 'homepage-restored-1900x868.png');

  // 2. Drawer open on homepage
  const drawerOpenHtml = homeHtml.replace('</body>', `<script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        const btn = document.querySelector('#mobileToggleBtn');
        if (btn) btn.click();
      }, 500);
    });
  </script></body>`);
  await takeScreenshot(drawerOpenHtml, 'drawer-open-1900x868.png');

  // 3. Footer on homepage
  const footerHtml = homeHtml.replace('</body>', `<script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        const footer = document.querySelector('#site-footer');
        if (footer) footer.scrollIntoView({ block: 'end' });
      }, 500);
    });
  </script></body>`);
  await takeScreenshot(footerHtml, 'footer-restored-1900x868.png');

  // 4. Catalogue page
  const catHtml = fs.readFileSync('catalogue.html', 'utf8');
  await takeScreenshot(catHtml, 'catalogue-restored-1900x868.png');

  // 5. Story page
  const storyHtml = fs.readFileSync('story.html', 'utf8');
  await takeScreenshot(storyHtml, 'story-restored-1900x868.png');
}

runScreenshots();
