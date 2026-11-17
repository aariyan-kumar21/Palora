const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');

const sIdx = css.indexOf('.saved-panel {');
console.log('Saved panel snippet:', css.slice(sIdx, sIdx + 400));

const cIdx = css.indexOf('.cart-modal {');
console.log('Cart modal snippet:', css.slice(cIdx, cIdx + 400));
