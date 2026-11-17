const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const pages = [
  { name: 'Home', file: 'index.html' },
  { name: 'Collections', file: 'catalogue.html' },
  { name: 'Our Story', file: 'story.html' },
  { name: 'Help', file: 'help.html' },
  { name: 'Privacy', file: 'privacy.html' }
];

const measureScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      const getR = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      };

      const links = Array.from(document.querySelectorAll('.site-header .nav-link')).map(l => {
        const r = l.getBoundingClientRect();
        return { text: l.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      });

      const data = {
        header: getR('.site-header'),
        links: links,
        wordmark: getR('.site-wordmark'),
        wordmarkTitle: getR('.wordmark-title'),
        wordmarkTagline: getR('.wordmark-tagline'),
        actions: getR('.header-actions'),
        savedBtn: getR('#savedBtn'),
        cartBtn: getR('#cartBtn'),
        menuBtn: getR('#mobileToggleBtn')
      };

      const div = document.createElement('div');
      div.id = 'NAV_RESULT';
      div.textContent = JSON.stringify(data);
      document.body.appendChild(div);
    }, 600);
  });
`;

async function measurePage(page) {
  return new Promise((resolve, reject) => {
    let rawHtml = fs.readFileSync(path.join('c:\\Users\\Aariy\\Palora', page.file), 'utf8');
    rawHtml = rawHtml.replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
    const injected = rawHtml.replace('</body>', `<script>${measureScript}</script></body>`);
    const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'test_' + page.file);
    fs.writeFileSync(testFile, injected, 'utf8');

    const fileUrl = 'file:///C:/Users/Aariy/Palora/scratch/test_' + page.file;
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      '--virtual-time-budget=4000',
      '--dump-dom',
      fileUrl
    ];

    const proc = spawn(chromePath, args);
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.on('close', () => {
      const match = out.match(/<div id="NAV_RESULT">([\s\S]*?)<\/div>/);
      if (match) {
        try {
          const res = JSON.parse(match[1]);
          resolve({ name: page.name, file: page.file, data: res });
        } catch (e) {
          reject(e);
        }
      } else {
        resolve({ name: page.name, file: page.file, error: 'NAV_RESULT not found' });
      }
    });
  });
}

async function run() {
  const results = [];
  for (const p of pages) {
    const r = await measurePage(p);
    results.push(r);
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
