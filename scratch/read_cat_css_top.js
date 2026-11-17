const fs = require('fs');
const catCss = fs.readFileSync('css/catalogue.css', 'utf8');
console.log(catCss.slice(0, 500));
