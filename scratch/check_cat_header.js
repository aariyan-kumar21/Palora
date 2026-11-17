const fs = require('fs');
const cat = fs.readFileSync('catalogue.html', 'utf8');
const hMatch = cat.match(/<header[\s\S]*?<\/header>/);
console.log(hMatch ? hMatch[0] : 'None');
