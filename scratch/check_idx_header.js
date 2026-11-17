const fs = require('fs');
const idx = fs.readFileSync('index.html', 'utf8');
const hMatch = idx.match(/<header[\s\S]*?<\/header>/);
console.log(hMatch ? hMatch[0] : 'None');
