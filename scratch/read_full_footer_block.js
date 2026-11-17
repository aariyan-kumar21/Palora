const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');

const fStart = css.indexOf('/* ===== FOOTER ===== */');
const fEnd = css.indexOf('/* --------------------------------------------------------------------------\n   11. Product Card');
console.log('--- Current Footer Block ---');
console.log(css.slice(fStart, fStart + 2500));
