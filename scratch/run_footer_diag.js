const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const diagScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      const footer = document.querySelector('footer#site-footer') || document.querySelector('.site-footer') || document.querySelector('footer');
      if (!footer) {
        console.error('No footer found');
        return;
      }
      const rect = footer.getBoundingClientRect();
      const ancestors = [];
      let cur = footer;
      while (cur) {
        const cs = getComputedStyle(cur);
        ancestors.push({
          tag: cur.tagName.toLowerCase(),
          id: cur.id,
          className: cur.className,
          backgroundColor: cs.backgroundColor,
          backgroundImage: cs.backgroundImage,
          opacity: cs.opacity,
          position: cs.position,
          zIndex: cs.zIndex
        });
        cur = cur.parentElement;
      }

      const yMid = rect.top + rect.height / 2;
      const pts1 = document.elementsFromPoint(300, yMid).map(el => ({ tag: el.tagName.toLowerCase(), id: el.id, className: el.className }));
      const pts2 = document.elementsFromPoint(1500, yMid).map(el => ({ tag: el.tagName.toLowerCase(), id: el.id, className: el.className }));

      const drawer = document.querySelector('#mobileDrawer');
      let drawerInfo = null;
      if (drawer) {
        const csD = getComputedStyle(drawer);
        drawerInfo = {
          backgroundColor: csD.backgroundColor,
          backgroundImage: csD.backgroundImage,
          color: csD.color,
          position: csD.position,
          visibility: csD.visibility
        };
      }

      const out = {
        footerRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        ancestors,
        elementsAt300: pts1,
        elementsAt1500: pts2,
        drawerInfo
      };

      const div = document.createElement('div');
      div.id = 'DIAG_RESULT';
      div.textContent = JSON.stringify(out);
      document.body.appendChild(div);
    }, 600);
  });
`;

async function runDiag() {
  const rawHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>${diagScript}</script></body>`);
  const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'test_diag_footer.html');
  fs.writeFileSync(testFile, rawHtml, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/scratch/test_diag_footer.html'
  ];

  const proc = spawn(chromePath, args);
  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', () => {
    const match = out.match(/<div id="DIAG_RESULT">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('DIAG RESULT:\n', JSON.stringify(JSON.parse(match[1]), null, 2));
    } else {
      console.log('No result found. Raw output length:', out.length);
    }
  });
}

runDiag();
