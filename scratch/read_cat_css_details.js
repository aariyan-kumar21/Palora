const fs = require('fs');
const catCss = fs.readFileSync('css/catalogue.css', 'utf8');
console.log('Total lines in catalogue.css:', catCss.split('\n').length);
console.log('Selectors in catalogue.css:', catCss.slice(0, 2000));
