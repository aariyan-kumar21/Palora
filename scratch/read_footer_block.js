const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(1550, 1575).join('\n'));
