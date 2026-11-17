const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(265, 290).join('\n'));
