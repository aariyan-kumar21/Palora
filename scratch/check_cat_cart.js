const fs = require('fs');
const cat = fs.readFileSync('catalogue.html', 'utf8');
const cartMatch = cat.match(/<div class="cart-overlay"[\s\S]*?<\/div>[\s\S]*?<aside class="cart-modal"[\s\S]*?<\/aside>/);
console.log(cartMatch ? cartMatch[0].slice(0, 300) : 'Not found by regex');
if (!cartMatch) {
  const lines = cat.split('\n').filter(l => l.includes('cartModal') || l.includes('cartOverlay') || l.includes('cart-modal'));
  console.log(lines);
}
