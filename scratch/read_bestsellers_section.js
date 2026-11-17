const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const bIdx = html.indexOf('<section class="bestsellers"');
console.log(html.slice(bIdx, bIdx + 2000));
