const fs = require('fs');
const content = fs.readFileSync('scratch/build_clean_base_css.js', 'utf8');

const dStart = content.indexOf('const drawerBlock');
const mStart = content.indexOf('const middlePart');
const fStart = content.indexOf('const footerBlock');
const cStart = content.indexOf('const cardsBlock');

console.log('drawerBlock snippet:', content.slice(dStart, dStart + 800));
console.log('footerBlock snippet:', content.slice(fStart, fStart + 800));
