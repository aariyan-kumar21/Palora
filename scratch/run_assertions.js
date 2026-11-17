const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Aariy\\.gemini\\antigravity\\brain\\766f3924-9b4e-4809-9a9f-0edd6fdfd864';

// 1. Check assertions in console for closed state on index.html
function testClosedAssertions() {
  const rawHtml = fs.readFileSync('index.html', 'utf8')
    .replace('<head>', '<head><base href="file:///C:/Users/Aariy/Palora/">')
    .replace('</body>', `<script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          const header = document.querySelector("#site-header");
          const drawer = document.querySelector("#mobileDrawer");
          const hHeight = header ? Math.round(header.getBoundingClientRect().height) : null;
          const dVis = drawer ? getComputedStyle(drawer).visibility : null;
          const dHidden = drawer ? drawer.hasAttribute('hidden') : null;
          const scrollW = document.documentElement.scrollWidth;
          const clientW = document.documentElement.clientWidth;
          const hasHScroll = scrollW > clientW;
          
          const result = {
            headerHeight: hHeight,
            drawerVisibility: dVis,
            drawerHasHidden: dHidden,
            hasHorizontalScroll: hasHScroll
          };
          const div = document.createElement('div');
          div.id = 'ASSERTION_RESULT';
          div.textContent = JSON.stringify(result);
          document.body.appendChild(div);
        }, 500);
      });
    </script></body>`);
  
  const testFile = path.join('c:\\Users\\Aariy\\Palora\\scratch', 'test_assert.html');
  fs.writeFileSync(testFile, rawHtml, 'utf8');

  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--window-size=1900,868',
    '--virtual-time-budget=3000',
    '--dump-dom',
    'file:///C:/Users/Aariy/Palora/scratch/test_assert.html'
  ]);

  let out = '';
  proc.stdout.on('data', d => out += d.toString());
  proc.on('close', () => {
    const match = out.match(/<div id="ASSERTION_RESULT">([\s\S]*?)<\/div>/);
    if (match) {
      console.log('ASSERTION RESULTS:', JSON.parse(match[1]));
    } else {
      console.log('ASSERTION FAILED to read result');
    }
  });
}

testClosedAssertions();
