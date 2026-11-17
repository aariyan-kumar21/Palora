const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');
console.log('Total lines in style.css:', lines.length);
console.log(lines.slice(2800, 2815).join('\n'));
console.log('--- End of file ---');
console.log(lines.slice(-30).join('\n'));
