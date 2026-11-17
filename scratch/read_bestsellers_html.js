const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const bIdx = html.indexOf('bestsellers');
console.log(html.slice(bIdx - 20, bIdx + 2000));
