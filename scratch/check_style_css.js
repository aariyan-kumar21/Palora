const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.nav') || l.includes('header') || l.includes('actions') || l.includes('wordmark') || l.includes('icon-btn') || l.includes('mobile-toggle')) {
    console.log(i + 1, l);
  }
});
