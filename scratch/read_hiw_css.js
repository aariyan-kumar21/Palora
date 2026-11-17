const fs = require('fs');
const css = fs.readFileSync('css/home.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(555, 655).join('\n'));
