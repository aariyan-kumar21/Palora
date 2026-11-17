const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');

console.log('--- Drawer Section Search ---');
const dMatch = css.indexOf('/* ===== MENU DRAWER ===== */');
const fMatch = css.indexOf('/* ===== FOOTER ===== */');
console.log('dMatch:', dMatch, 'fMatch:', fMatch);
if (dMatch !== -1) {
  console.log(css.slice(dMatch, dMatch + 600));
}
if (fMatch !== -1) {
  console.log(css.slice(fMatch, fMatch + 600));
}
