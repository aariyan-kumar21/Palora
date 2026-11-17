const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');
const sIdx = css.indexOf('.footer-social-row');
console.log(css.slice(sIdx, sIdx + 500));
