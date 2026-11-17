const fs = require('fs');
const css = fs.readFileSync('css/catalogue.css', 'utf8');
console.log(css.slice(0, 1000));
