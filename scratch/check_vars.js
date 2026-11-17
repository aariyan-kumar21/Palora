const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');

const fStart = css.indexOf('.site-footer {');
const fEnd = css.indexOf('.footer-bottom-bar');
const footerBlock = css.slice(fStart, fEnd + 500);
console.log('--- Footer vars ---');
const fVars = footerBlock.match(/var\(--[^)]+\)/g);
console.log('Footer vars:', [...new Set(fVars)]);

const dStart = css.indexOf('.mobile-drawer {');
const dEnd = css.indexOf('.drawer-footer');
const drawerBlock = css.slice(dStart, dEnd + 500);
console.log('--- Drawer vars ---');
const dVars = drawerBlock.match(/var\(--[^)]+\)/g);
console.log('Drawer vars:', [...new Set(dVars)]);
