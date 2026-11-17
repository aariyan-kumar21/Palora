const fs = require('fs');
const css = fs.readFileSync('css/catalogue.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.nav') || l.includes('header') || l.includes('actions') || l.includes('wordmark')) {
    console.log(i + 1, l);
  }
});
