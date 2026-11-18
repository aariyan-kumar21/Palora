const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

async function takeSnap(filename, w, h) {
  const html = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
  
  const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'snap_redesign.html');
  fs.writeFileSync(testFile, html, 'utf8');

  const outPath = path.join(artifactDir, filename);

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--window-size=${w || 1900},${h || 868}`,
    `--screenshot=${outPath}`,
    '--virtual-time-budget=3500',
    'file:///' + testFile.replace(/\\/g, '/')
  ];

  return new Promise((resolve) => {
    const proc = spawn(chromePath, args);
    proc.on('close', () => {
      console.log(`Saved screenshot: ${filename} (size: ${fs.existsSync(outPath) ? fs.statSync(outPath).size : 0} bytes)`);
      resolve(outPath);
    });
  });
}

async function run() {
  await takeSnap('landing_page_redesigned_1900x868.png', 1900, 868);
}

run();
