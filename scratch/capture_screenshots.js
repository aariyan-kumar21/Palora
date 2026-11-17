const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

const targets = [
  { name: 'homepage-restored-1900x868.png', url: 'file:///C:/Users/Aariy/Palora/index.html' },
  { name: 'catalogue-restored-1900x868.png', url: 'file:///C:/Users/Aariy/Palora/catalogue.html' },
  { name: 'story-restored-1900x868.png', url: 'file:///C:/Users/Aariy/Palora/story.html' }
];

async function capture(target) {
  return new Promise((resolve) => {
    const outPath = path.join(artifactDir, target.name);
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      '--virtual-time-budget=3000',
      `--screenshot=${outPath}`,
      target.url
    ];

    const proc = spawn(chromePath, args);
    proc.on('close', (code) => {
      console.log(`Saved ${target.name} (exit code ${code})`);
      resolve();
    });
  });
}

// Also test drawer open screenshot
async function captureDrawer() {
  const script = `
    window.addEventListener('load', () => {
      setTimeout(() => {
        const btn = document.getElementById('mobileToggleBtn');
        if (btn) btn.click();
      }, 500);
    });
  `;
  let html = fs.readFileSync('C:\\Users\\Aariy\\Palora\\index.html', 'utf8');
  html = html.replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
  html = html.replace('</body>', `<script>${script}</script></body>`);
  fs.writeFileSync('C:\\Users\\Aariy\\Palora\\scratch\\test_drawer.html', html, 'utf8');

  return new Promise((resolve) => {
    const outPath = path.join(artifactDir, 'drawer-open-1900x868.png');
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      '--virtual-time-budget=4000',
      `--screenshot=${outPath}`,
      'file:///C:/Users/Aariy/Palora/scratch/test_drawer.html'
    ];

    const proc = spawn(chromePath, args);
    proc.on('close', (code) => {
      console.log(`Saved drawer-open-1900x868.png (exit code ${code})`);
      resolve();
    });
  });
}

async function run() {
  for (const t of targets) {
    await capture(t);
  }
  await captureDrawer();
  console.log('All screenshots captured!');
}

run();
