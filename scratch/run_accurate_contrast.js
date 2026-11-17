const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const contrastCheckScript = `
  window.addEventListener('load', () => {
    setTimeout(() => {
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

      function getEffectiveBg(el) {
        let cur = el;
        while (cur) {
          const cs = getComputedStyle(cur);
          const bg = parseColor(cs.backgroundColor);
          if (bg && bg.a > 0.8) {
            return { r: bg.r, g: bg.g, b: bg.b };
          }
          if ((cs.backgroundImage || '').includes('linear-gradient')) {
            // Dark burgundy gradient background: darkest stop (74, 35, 40)
            return { r: 74, g: 35, b: 40 };
          }
          cur = cur.parentElement;
        }
        return { r: 74, g: 35, b: 40 };
      }

      const lowContrasts = [];
      const footer = document.querySelector('footer#site-footer');
      if (footer) {
        const textNodes = footer.querySelectorAll('h2, h3, p, a, span, div');
        textNodes.forEach(el => {
          if (el.children.length === 0 && el.textContent.trim().length > 0) {
            if (el.classList.contains('footer-watermark')) return; // Decorative
            const cs = getComputedStyle(el);
            const fg = parseColor(cs.color);
            const bg = getEffectiveBg(el);
            if (fg && bg) {
              const blendedR = Math.round(fg.r * fg.a + bg.r * (1 - fg.a));
              const blendedG = Math.round(fg.g * fg.a + bg.g * (1 - fg.a));
              const blendedB = Math.round(fg.b * fg.a + bg.b * (1 - fg.a));
              const fgL = getLuminance(blendedR, blendedG, blendedB);
              const bgL = getLuminance(bg.r, bg.g, bg.b);
              const ratio = contrastRatio(fgL, bgL);
              if (ratio < 4.5) {
                lowContrasts.push({ text: el.textContent.trim().slice(0, 30), color: cs.color, bg: bg, ratio: ratio.toFixed(2) });
              }
            }
          }
        });
      }

      const fCs = footer ? getComputedStyle(footer) : {};
      const res = {
        footerBgImageHasLinear: (fCs.backgroundImage || '').includes('linear-gradient'),
        footerBgColor: fCs.backgroundColor,
        lowContrasts
      };

      const div = document.createElement('div');
      div.id = 'ACCURATE_CONTRAST';
      div.textContent = JSON.stringify(res);
      document.body.appendChild(div);
    }, 500);
  });
`;

async function checkAccurateContrast() {
  const homeHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>${contrastCheckScript}</script></body>`);
  const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'accurate_contrast.html');
  fs.writeFileSync(testFile, homeHtml, 'utf8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///' + testFile.replace(/\\/g, '/')
  ];

  const proc = spawn(chromePath, args);
  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', () => {
    const match = out.match(/<div id="ACCURATE_CONTRAST">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('Accurate Contrast Result:\n', JSON.parse(match[1]));
    } else {
      console.log('Failed to parse contrast result');
    }
  });
}

checkAccurateContrast();
