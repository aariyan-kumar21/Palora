const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const vIdx = html.indexOf('<section class="value-bar"');
const vEnd = html.indexOf('</section>', vIdx);
console.log(html.slice(vIdx, vEnd + 10));
