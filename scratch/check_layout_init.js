const fs = require('fs');
const layout = fs.readFileSync('js/layout.js', 'utf8');
console.log(layout.slice(300, 363 * 10));
