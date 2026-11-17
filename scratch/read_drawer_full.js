const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');

const dStart = css.indexOf('/* ===== MENU DRAWER ===== */');
const dEnd = css.indexOf('/* --------------------------------------------------------------------------\n   6. Saved Items Panel');
console.log(css.slice(dStart, dEnd));
