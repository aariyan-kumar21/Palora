const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');
console.log('Is --footer-text in :root?', css.includes('--footer-text:'));
console.log('Where is --footer-text used?');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('--footer-text')) console.log(i + 1, l);
});
