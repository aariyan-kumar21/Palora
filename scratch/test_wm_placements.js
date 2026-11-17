const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testWatermarkPlacement(bottomValue) {
  let baseCss = fs.readFileSync('css/base.css', 'utf8');
  baseCss = baseCss.replace(/\.footer-watermark\s*\{[\s\S]*?\}/, `
.footer-watermark {
  position: absolute;
  left: 50%;
  bottom: ${bottomValue};
  transform: translateX(-50%);
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(8rem, 17vw, 18rem);
  letter-spacing: 0.25em;
  color: rgba(255, 247, 242, 0.05);
  line-height: 0.8;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}
`);
  fs.writeFileSync('scratch/test_base.css', baseCss, 'utf8');

  let homeHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('css/base.css?v=3', 'scratch/test_base.css')
    .replace('</body>', `<script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          const footer = document.querySelector('#site-footer');
          if (footer) footer.scrollIntoView({ block: 'end' });
        }, 400);
      });
    </script></body>`);
  
  const testFile = 'scratch/test_snap_wm.html';
  fs.writeFileSync(testFile, homeHtml, 'utf8');
  const outPath = `scratch/wm_bottom_${bottomValue.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

  return new Promise((resolve) => {
    const proc = spawn(chromePath, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      `--screenshot=${outPath}`,
      '--virtual-time-budget=3000',
      'file:///C:/Users/Aariy/Palora/' + testFile
    ]);
    proc.on('close', () => {
      console.log('Tested bottom:', bottomValue, 'Saved:', outPath);
      resolve(outPath);
    });
  });
}

async function run() {
  await testWatermarkPlacement('72px');
  await testWatermarkPlacement('90px');
  await testWatermarkPlacement('100px');
}

run();
