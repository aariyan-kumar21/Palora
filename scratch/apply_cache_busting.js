const fs = require('fs');

const pages = ['index.html', 'catalogue.html', 'story.html', 'help.html', 'privacy.html'];

pages.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  // Replace css/*.css (with or without existing query strings)
  html = html.replace(/href="(css\/[a-zA-Z0-9_\-]+\.css)(?:\?[^"]*)?"/g, 'href="$1?v=3"');
  // Also if style.css
  html = html.replace(/href="(style\.css)(?:\?[^"]*)?"/g, 'href="$1?v=3"');

  // Replace js/*.js (with or without existing query strings)
  html = html.replace(/src="(js\/[a-zA-Z0-9_\-]+\.js)(?:\?[^"]*)?"/g, 'src="$1?v=3"');
  // Also if script.js
  html = html.replace(/src="(script\.js)(?:\?[^"]*)?"/g, 'src="$1?v=3"');

  fs.writeFileSync(file, html, 'utf8');
  console.log(`Updated cache busting ?v=3 in ${file}`);
});
