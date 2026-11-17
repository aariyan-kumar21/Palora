const fs = require('fs');
const css = fs.readFileSync('css/base.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('MENU DRAWER')) {
    console.log(i + 1, l);
    console.log(lines.slice(i - 2, i + 8).join('\n'));
  }
});
