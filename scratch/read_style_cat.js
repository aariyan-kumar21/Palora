const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(2810, 2860).join('\n'));
