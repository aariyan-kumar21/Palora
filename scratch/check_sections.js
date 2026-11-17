const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const sections = ['hero', 'benefits', 'bestsellers', 'categories', 'how-it-works', 'personalize'];
sections.forEach(sec => {
  const re = new RegExp('<section[^>]*id=["\']' + sec + '["\'][\\s\\S]*?<\\/section>', 'i');
  const match = html.match(re);
  if (match) {
    console.log(`=== ${sec} ===`);
    const headings = [...match[0].matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log('Headings:', headings);
  } else {
    console.log(`=== ${sec} NOT FOUND ===`);
  }
});
