const fs = require('fs');
const icons = fs.readFileSync('js/icons.js', 'utf8');
console.log(icons.slice(0, 1500));
