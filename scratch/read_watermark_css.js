const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');
const wIdx = css.indexOf('.footer-watermark');
console.log(css.slice(wIdx, wIdx + 600));
