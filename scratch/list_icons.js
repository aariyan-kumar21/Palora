const fs = require('fs');
const icons = fs.readFileSync('js/icons.js', 'utf8');
console.log(Object.keys(eval(`(function(){ ${icons}; return ICONS; })()`)));
