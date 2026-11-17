const fs = require('fs');
const css = fs.readFileSync('css/home.css', 'utf8');
const lines = css.split('\n');

lines.forEach((l, i) => {
  if (l.includes('how-it-works') || l.includes('personalize') || l.includes('callout')) {
    console.log(i + 1, l);
  }
});
