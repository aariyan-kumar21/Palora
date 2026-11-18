const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const hIdx = html.indexOf('class="hero"');
const bIdx = html.indexOf('</section>', html.indexOf('id="benefits"'));
console.log(html.slice(hIdx - 15, bIdx + 10));
