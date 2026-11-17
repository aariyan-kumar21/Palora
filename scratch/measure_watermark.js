const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const script = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      const bar = document.querySelector('.footer-bottom-bar');
      const watermark = document.querySelector('.footer-watermark');
      const footer = document.querySelector('#site-footer');
      
      const fRect = footer.getBoundingClientRect();
      const bRect = bar.getBoundingClientRect();
      const wRect = watermark.getBoundingClientRect();

      const out = {
        footerBottom: Math.round(fRect.bottom),
        barTop: Math.round(bRect.top),
        barHeight: Math.round(bRect.height),
        barDistanceToFooterBottom: Math.round(fRect.bottom - bRect.top),
        watermarkBottom: Math.round(wRect.bottom),
        watermarkTop: Math.round(wRect.top),
        watermarkHeight: Math.round(wRect.height),
        watermarkDistanceToFooterBottom: Math.round(fRect.bottom - wRect.bottom)
      };

      const div = document.createElement('div');
      div.id = 'MEASURE_WATERMARK';
      div.textContent = JSON.stringify(out);
      document.body.appendChild(div);
    }, 500);
  });
`;

async function run() {
  const homeHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>${script}</script></body>`);
  fs.writeFileSync('scratch/test_watermark.html', homeHtml, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/scratch/test_watermark.html'
  ];

  const proc = spawn(chromePath, args);
  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', () => {
    const match = out.match(/<div id="MEASURE_WATERMARK">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('Watermark & Bar measurements:\n', JSON.parse(match[1]));
    }
  });
}

run();
