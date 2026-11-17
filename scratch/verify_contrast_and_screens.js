const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

const testScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Calculate WCAG contrast
      function parseColor(str) {
        if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return null;
        const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
        if (m) {
          return {
            r: parseInt(m[1], 10),
            g: parseInt(m[2], 10),
            b: parseInt(m[3], 10),
            a: m[4] !== undefined ? parseFloat(m[4]) : 1
          };
        }
        return null;
      }

      function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function contrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      // Check footer contrast
      const footer = document.querySelector('footer#site-footer');
      const footerBgL = getLuminance(74, 35, 40); // darkest stop #4A2328
      const footerLowContrasts = [];

      if (footer) {
        const textNodes = footer.querySelectorAll('h2, h3, p, a, span, div');
        textNodes.forEach(el => {
          if (el.children.length === 0 && el.textContent.trim().length > 0) {
            // Leaf text element
            if (el.classList.contains('footer-watermark')) return; // Watermark is decorative
            const cs = getComputedStyle(el);
            const fg = parseColor(cs.color);
            if (fg) {
              // Blend fg over bg if fg has alpha
              const blendedR = Math.round(fg.r * fg.a + 74 * (1 - fg.a));
              const blendedG = Math.round(fg.g * fg.a + 35 * (1 - fg.a));
              const blendedB = Math.round(fg.b * fg.a + 40 * (1 - fg.a));
              const fgL = getLuminance(blendedR, blendedG, blendedB);
              const ratio = contrastRatio(fgL, footerBgL);
              if (ratio < 4.5) {
                footerLowContrasts.push({ text: el.textContent.trim().slice(0, 30), color: cs.color, ratio: ratio.toFixed(2) });
              }
            }
          }
        });
      }

      // Check drawer contrast
      const drawer = document.querySelector('#mobileDrawer');
      const drawerBgL = getLuminance(87, 46, 46); // stop #572E2E
      const drawerLowContrasts = [];
      if (drawer) {
        const textNodes = drawer.querySelectorAll('h2, h3, p, a, span, div');
        textNodes.forEach(el => {
          if (el.children.length === 0 && el.textContent.trim().length > 0) {
            const cs = getComputedStyle(el);
            const fg = parseColor(cs.color);
            if (fg) {
              const blendedR = Math.round(fg.r * fg.a + 87 * (1 - fg.a));
              const blendedG = Math.round(fg.g * fg.a + 46 * (1 - fg.a));
              const blendedB = Math.round(fg.b * fg.a + 46 * (1 - fg.a));
              const fgL = getLuminance(blendedR, blendedG, blendedB);
              const ratio = contrastRatio(fgL, drawerBgL);
              if (ratio < 4.5) {
                drawerLowContrasts.push({ text: el.textContent.trim().slice(0, 30), color: cs.color, ratio: ratio.toFixed(2) });
              }
            }
          }
        });
      }

      const fCs = footer ? getComputedStyle(footer) : {};
      const res = {
        footerBgImageHasLinear: (fCs.backgroundImage || '').includes('linear-gradient'),
        footerBgColor: fCs.backgroundColor,
        footerLowContrasts,
        drawerLowContrasts,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };

      const div = document.createElement('div');
      div.id = 'TEST_RESULT';
      div.textContent = JSON.stringify(res);
      document.body.appendChild(div);
    }, 600);
  });
`;

const pages = [
  { name: 'Home', file: 'index.html', snap: 'footer-restored-home-1900x868.png' },
  { name: 'Collections', file: 'catalogue.html', snap: 'footer-restored-catalogue-1900x868.png' },
  { name: 'Our Story', file: 'story.html', snap: 'footer-restored-story-1900x868.png' },
  { name: 'Help', file: 'help.html', snap: 'footer-restored-help-1900x868.png' },
  { name: 'Privacy', file: 'privacy.html', snap: 'footer-restored-privacy-1900x868.png' }
];

async function testPage(page) {
  return new Promise((resolve) => {
    let rawHtml = fs.readFileSync(page.file, 'utf8');
    rawHtml = rawHtml.replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">');
    const scrollFooterScript = `<script>
      ${testScript}
      window.addEventListener('load', () => {
        setTimeout(() => {
          const footer = document.querySelector('#site-footer');
          if (footer) footer.scrollIntoView({ block: 'end' });
        }, 300);
      });
    </script>`;
    const injected = rawHtml.replace('</body>', scrollFooterScript + '</body>');
    const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'verify_' + page.file);
    fs.writeFileSync(testFile, injected, 'utf8');

    const outPath = path.join(artifactDir, page.snap);
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--window-size=1900,868',
      `--screenshot=${outPath}`,
      '--virtual-time-budget=3500',
      '--dump-dom',
      'file:///' + testFile.replace(/\\/g, '/')
    ];

    const proc = spawn(chromePath, args);
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.on('close', () => {
      const match = out.match(/<div id="TEST_RESULT">([\s\S]*?)<\/div>/);
      const data = match ? JSON.parse(match[1]) : { error: 'No result' };
      console.log(`Page: ${page.name}`);
      console.log(`  footerBgImageHasLinear: ${data.footerBgImageHasLinear}`);
      console.log(`  footerBgColor: ${data.footerBgColor}`);
      console.log(`  low contrasts in footer (<4.5:1):`, data.footerLowContrasts);
      console.log(`  low contrasts in drawer (<4.5:1):`, data.drawerLowContrasts);
      console.log(`  horizontal scroll: ${data.scrollWidth > data.clientWidth}`);
      console.log(`  screenshot saved: ${page.snap} (size: ${fs.existsSync(outPath) ? fs.statSync(outPath).size : 0} bytes)`);
      resolve(data);
    });
  });
}

async function run() {
  for (const p of pages) {
    await testPage(p);
  }

  // Also take drawer open screenshot on homepage
  const homeHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          const btn = document.querySelector('#mobileToggleBtn');
          if (btn) btn.click();
        }, 500);
      });
    </script></body>`);
  const drawerTestFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'verify_drawer_home.html');
  fs.writeFileSync(drawerTestFile, homeHtml, 'utf8');
  const drawerOutPath = path.join(artifactDir, 'drawer-open-1900x868.png');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    `--screenshot=${drawerOutPath}`,
    '--virtual-time-budget=3500',
    'file:///' + drawerTestFile.replace(/\\/g, '/')
  ]);
  proc.on('close', () => {
    console.log(`Drawer screenshot saved: drawer-open-1900x868.png (size: ${fs.existsSync(drawerOutPath) ? fs.statSync(drawerOutPath).size : 0} bytes)`);
  });
}

run();
