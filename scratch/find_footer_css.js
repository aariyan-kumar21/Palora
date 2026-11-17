const fs = require('fs');

['css/base.css', 'css/home.css', 'css/pages.css', 'css/catalogue.css'].forEach(f => {
  const css = fs.readFileSync(f, 'utf8');
  const lines = css.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('.site-footer') || l.includes('#site-footer') || (l.includes('footer') && l.includes('{'))) {
      console.log(f, i + 1, l);
    }
  });
});
