const fs = require('fs');
const layout = fs.readFileSync('js/layout.js', 'utf8');

const col1Start = layout.indexOf('<!-- Column 1: Brand -->');
console.log(layout.slice(col1Start, col1Start + 700));

const bStart = layout.indexOf('<!-- Bottom Bar -->');
console.log(layout.slice(bStart, bStart + 800));
