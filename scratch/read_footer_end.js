const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');

const fStart = css.indexOf('.footer-contact-items');
console.log(css.slice(fStart, fStart + 2500));
