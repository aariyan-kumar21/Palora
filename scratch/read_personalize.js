const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const pStart = html.indexOf('personalize');
console.log(html.slice(pStart - 20, pStart + 1600));
