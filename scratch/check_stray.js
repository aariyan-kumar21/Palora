const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkStray() {
  const script = `
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const els = document.elementsFromPoint(12, 385);
        const data = JSON.stringify(els.map(e => ({
          tagName: e.tagName,
          id: e.id,
          className: e.className,
          rect: e.getBoundingClientRect()
        })));
        // Put in an element we can dump
        const div = document.createElement('div');
        div.id = 'STRAY_RESULT';
        div.textContent = data;
        document.body.appendChild(div);
      }, 500);
    });
  `;

  const html = fs.readFileSync('c:\\Users\\Aariy\\Palora\\index.html', 'utf8');
  const injected = html.replace('</body>', `<script>${script}</script></body>`);
  fs.writeFileSync('c:\\Users\\Aariy\\Palora\\scratch\\test_stray.html', injected, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/scratch/test_stray.html'
  ];

  const proc = spawn(chromePath, args);
  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', (code) => {
    const match = out.match(/<div id="STRAY_RESULT">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('STRAY RESULT:', match[1]);
    } else {
      console.log('STRAY_RESULT not found in dumped DOM');
    }
  });
}

checkStray();
