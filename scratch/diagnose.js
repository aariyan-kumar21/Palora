const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\Aariy\\Palora';
const pages = ['index.html', 'catalogue.html', 'story.html', 'help.html', 'privacy.html'];

console.log('=== (a) LINK TAGS ===');
for (const p of pages) {
  const content = fs.readFileSync(path.join(root, p), 'utf8');
  const links = content.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  console.log(p + ':');
  links.forEach(l => {
    const hrefMatch = l.match(/href=["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : '';
    const exists = fs.existsSync(path.join(root, href.split('?')[0]));
    console.log('  ' + l + ' -> Exists: ' + exists);
  });
}

console.log('\n=== (b) CLASSES IN LAYOUT.JS vs BASE.CSS ===');
const layoutContent = fs.readFileSync(path.join(root, 'js/layout.js'), 'utf8');
const baseCss = fs.readFileSync(path.join(root, 'css/base.css'), 'utf8');

// Extract drawer & footer templates from layout.js
const drawerMatch = layoutContent.match(/function ensureDrawer\(\)[\s\S]*?function renderFooterContent/);
const footerMatch = layoutContent.match(/function renderFooterContent[\s\S]*?function ensureFloatingWhatsApp/);

function getClasses(str) {
  const matches = str.matchAll(/class=["']([^"']+)["']/g);
  const classes = new Set();
  for (const m of matches) {
    m[1].split(/\s+/).forEach(c => {
      if (c && !c.includes('${')) classes.add(c);
    });
  }
  return Array.from(classes);
}

function getIds(str) {
  const matches = str.matchAll(/id=["']([^"']+)["']/g);
  const ids = new Set();
  for (const m of matches) {
    if (m[1] && !m[1].includes('${')) ids.add(m[1]);
  }
  return Array.from(ids);
}

const drawerClasses = getClasses(drawerMatch ? drawerMatch[0] : '');
const footerClasses = getClasses(footerMatch ? footerMatch[0] : '');
const drawerIds = getIds(drawerMatch ? drawerMatch[0] : '');
const footerIds = getIds(footerMatch ? footerMatch[0] : '');

console.log('Drawer classes count:', drawerClasses.length);
const missingDrawer = drawerClasses.filter(c => !baseCss.includes('.' + c));
console.log('Missing drawer classes in base.css:', missingDrawer);

console.log('Footer classes count:', footerClasses.length);
const missingFooter = footerClasses.filter(c => !baseCss.includes('.' + c));
console.log('Missing footer classes in base.css:', missingFooter);

console.log('Drawer IDs:', drawerIds);
console.log('Footer IDs:', footerIds);

console.log('\n=== (c) CSS VALIDITY & PARSING ===');
const cssFiles = ['css/base.css', 'css/home.css', 'css/pages.css', 'css/catalogue.css'];
for (const f of cssFiles) {
  const content = fs.readFileSync(path.join(root, f), 'utf8');
  let open = 0;
  let inComm = false;
  let lines = content.split('\n');
  let firstErr = null;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
      if (!inComm && line[j] === '/' && line[j+1] === '*') {
        inComm = true;
        j++;
      } else if (inComm && line[j] === '*' && line[j+1] === '/') {
        inComm = false;
        j++;
      } else if (!inComm) {
        if (line[j] === '{') open++;
        if (line[j] === '}') {
          open--;
          if (open < 0 && !firstErr) firstErr = `Negative brace at line ${i+1}`;
        }
      }
    }
  }
  console.log(`${f}: unclosed braces = ${open}, in comment at EOF = ${inComm}, error = ${firstErr || (open !== 0 ? 'Imbalanced braces' : 'OK')}`);
}
