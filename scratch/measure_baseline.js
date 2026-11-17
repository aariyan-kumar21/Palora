const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const script = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      const wm = document.querySelector('.footer-watermark');
      const bar = document.querySelector('.footer-bottom-bar');
      const footer = document.querySelector('#site-footer');

      // Create an inline canvas to measure Cormorant Garamond baseline
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cs = getComputedStyle(wm);
      ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      const metrics = ctx.measureText('PALORA');

      const wmRect = wm.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();

      // actualBoundingBoxDescent is the distance from the baseline to the bottom of the bounding box
      const descent = metrics.actualBoundingBoxDescent;
      const ascent = metrics.actualBoundingBoxAscent;

      // In wmRect, where is the baseline?
      // With line-height: 0.8, let's find the exact pixel where baseline is
      const barTopY = barRect.top;
      
      const res = {
        barTopY: Math.round(barTopY),
        wmBottomY: Math.round(wmRect.bottom),
        wmTopY: Math.round(wmRect.top),
        metrics: {
          ascent: Math.round(ascent),
          descent: Math.round(descent),
          fontBoundingBoxDescent: Math.round(metrics.fontBoundingBoxDescent || 0)
        },
        difference: Math.round(barTopY - wmRect.bottom)
      };

      const div = document.createElement('div');
      div.id = 'BASELINE_RESULT';
      div.textContent = JSON.stringify(res);
      document.body.appendChild(div);
    }, 500);
  });
`;

async function measure() {
  const html = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>${script}</script></body>`);
  fs.writeFileSync('scratch/test_baseline.html', html, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/scratch/test_baseline.html'
  ];

  const proc = spawn(chromePath, args);
  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', () => {
    const match = out.match(/<div id="BASELINE_RESULT">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('BASELINE METRICS:\n', JSON.parse(match[1]));
    }
  });
}

measure();
