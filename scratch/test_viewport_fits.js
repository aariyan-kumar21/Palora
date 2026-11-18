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

async function testViewport(w, h, htmlFile) {
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--window-size=${w},${h}`,
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/' + htmlFile
  ];

  return new Promise((resolve) => {
    const proc = spawn(chromePath, args);
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.on('close', () => {
      const match = out.match(/<div id="LANDING_MEASURE">([\s\S]*?)<\/div>/);
      resolve(match ? JSON.parse(match[1]) : { error: 'none' });
    });
  });
}

async function run() {
  let homeCss = fs.readFileSync('css/home.css', 'utf8');

  // Replace hero height with dynamic calc matching value-bar
  homeCss = homeCss.replace(/\.hero\s*\{[\s\S]*?background:/, `
.hero {
  position: relative;
  display: flex;
  align-items: center;
  height: calc(100vh - 80px);
  height: calc(100dvh - 80px);
  min-height: 0;
  max-height: none;
  background:`);

  // Replace value-bar with exact 80px height
  homeCss = homeCss.replace(/\.value-bar\s*\{[\s\S]*?position:\s*relative;/, `
.value-bar {
  height: 80px;
  box-sizing: border-box;
  background-color: #EEDCD4;
  border-top: 1px solid rgba(114, 47, 55, 0.12);
  border-bottom: 1px solid rgba(114, 47, 55, 0.08);
  position: relative;`);

  fs.writeFileSync('scratch/test_home_fit.css', homeCss, 'utf8');

  let html = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('css/home.css?v=3', 'scratch/test_home_fit.css')
    .replace('</body>', `<script>${measureScript}</script></body>`);
  fs.writeFileSync('scratch/test_landing_fit.html', html, 'utf8');

  const res1 = await testViewport(1900, 868, 'scratch/test_landing_fit.html');
  console.log('1900x868:', res1);

  const res2 = await testViewport(1536, 730, 'scratch/test_landing_fit.html');
  console.log('1536x730:', res2);

  const res3 = await testViewport(1920, 1080, 'scratch/test_landing_fit.html');
  console.log('1920x1080:', res3);
}

run();
