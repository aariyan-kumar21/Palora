const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const pStart = html.indexOf('class="trust"');
console.log(html.slice(pStart, pStart + 1600));
