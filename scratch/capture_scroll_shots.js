const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

async function captureScroll(name, selector) {
  const script = `
    window.addEventListener('load', () => {
      setTimeout(() => {
        const el = document.querySelector('${selector}');
        if (el) el.scrollIntoView({ block: 'start' });
      }, 500);
    });
  `;
  let html = fs.readFileSync('C:\\Users\\Aariy\\Palora\\index.html', 'utf8');
  html = html.replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
  html = html.replace('</body>', `<script>${script}</script></body>`);
  const testFile = `C:\\Users\\Aariy\\Palora\\scratch\\test_${name}.html`;
  fs.writeFileSync(testFile, html, 'utf8');

  return new Promise((resolve) => {
    const outPath = path.join(artifactDir, name);
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      '--virtual-time-budget=4000',
      `--screenshot=${outPath}`,
      `file:///${testFile.replace(/\\\\/g, '/')}`
    ];

    const proc = spawn(chromePath, args);
    proc.on('close', (code) => {
      console.log(`Saved ${name} (exit code ${code})`);
      resolve();
    });
  });
}

async function run() {
  await captureScroll('bestsellers-restored-1900x868.png', '#bestsellers');
  await captureScroll('footer-restored-1900x868.png', '#site-footer');
  console.log('Scroll screenshots complete!');
}

run();
