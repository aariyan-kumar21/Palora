const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const measureScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      const hero = document.querySelector('.hero');
      const benefits = document.querySelector('#benefits');
      const bestsellers = document.querySelector('#bestsellers');
      const scroll = document.querySelector('.hero__scroll');

      const hRect = hero.getBoundingClientRect();
      const bRect = benefits.getBoundingClientRect();
      const bsRect = bestsellers.getBoundingClientRect();
      const sRect = scroll ? scroll.getBoundingClientRect() : null;

      const out = {
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        hero: {
          top: Math.round(hRect.top),
          height: Math.round(hRect.height),
          bottom: Math.round(hRect.bottom)
        },
        benefits: {
          top: Math.round(bRect.top),
          height: Math.round(bRect.height),
          bottom: Math.round(bRect.bottom)
        },
        bestsellersTop: Math.round(bsRect.top),
        whiteSectionVisibleOnLoad: Math.round(bsRect.top) < window.innerHeight,
        gapBetweenBenefitsAndWindowBottom: window.innerHeight - Math.round(bRect.bottom),
        scrollButton: sRect ? {
          x: Math.round(sRect.x),
          y: Math.round(sRect.y),
          width: Math.round(sRect.width),
          height: Math.round(sRect.height)
        } : null
      };

      const div = document.createElement('div');
      div.id = 'LANDING_MEASURE';
      div.textContent = JSON.stringify(out);
      document.body.appendChild(div);
    }, 500);
  });
`;

async function testLanding(customHomeCss) {
  if (customHomeCss) {
    fs.writeFileSync('scratch/test_home.css', customHomeCss, 'utf8');
  }

  let html = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
  
  if (customHomeCss) {
    html = html.replace('css/home.css?v=3', 'scratch/test_home.css');
  }

  html = html.replace('</body>', `<script>${measureScript}</script></body>`);
  fs.writeFileSync('scratch/test_landing.html', html, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/scratch/test_landing.html'
  ];

  return new Promise((resolve) => {
    const proc = spawn(chromePath, args);
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.on('close', () => {
      const match = out.match(/<div id="LANDING_MEASURE">([\s\S]*?)<\/div>/);
      if (match) {
        resolve(JSON.parse(match[1]));
      } else {
        resolve({ error: 'No measurement found' });
      }
    });
  });
}

async function run() {
  const currentResult = await testLanding(null);
  console.log('Current landing measurement at 1900x868:\n', currentResult);
}

run();
