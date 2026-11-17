const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');

for (let i = 2805; i < lines.length; i++) {
  if (lines[i].startsWith('/* ---') || lines[i].startsWith('/* ===')) {
    console.log(i + 1, lines[i]);
  }
}
