const fs = require('fs');

const files = ['index.html', 'catalogue.html', 'story.html', 'help.html', 'privacy.html'];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log('=== ' + f + ' ===');
  const cssMatches = content.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  const scriptMatches = content.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) || [];
  console.log('CSS:', cssMatches);
  console.log('Scripts:', scriptMatches);
});
