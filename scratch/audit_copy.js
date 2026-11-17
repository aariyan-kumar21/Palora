const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Check Hero
console.log('--- Hero Eyebrow ---');
const eyebrowMatch = indexHtml.match(/<span class="hero__eyebrow">([\s\S]*?)<\/span>/);
console.log('Hero eyebrow:', eyebrowMatch ? eyebrowMatch[1].trim() : 'NOT FOUND');

// Check Benefits
console.log('--- Benefits ---');
const benefits = [...indexHtml.matchAll(/<h3 class="value-title">([\s\S]*?)<\/h3>[\s\S]*?<p class="value-desc">([\s\S]*?)<\/p>/g)];
benefits.forEach(b => console.log(b[1].trim(), ':', b[2].trim()));

// Check Bestselling Header
console.log('--- Bestsellers Header ---');
const bsHeader = indexHtml.match(/<section class="[^"]*bestsellers[^"]*"[\s\S]*?<\/section>/);
if (bsHeader) {
  const m = bsHeader[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const sub = bsHeader[0].match(/<p[^>]*>([\s\S]*?)<\/p>/);
  console.log('Bestseller title:', m ? m[1].trim() : 'NONE');
  console.log('Bestseller sub:', sub ? sub[1].trim() : 'NONE');
}

// Check How Ordering Works
console.log('--- How Ordering Works ---');
const howWorks = indexHtml.match(/<section class="[^"]*how-it-works[^"]*"[\s\S]*?<\/section>/);
if (howWorks) {
  const m = howWorks[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  console.log('How it works title:', m ? m[1].trim() : 'NONE');
}

// Check Personalization Banner & Trust Strip
console.log('--- Personalize ---');
const pers = indexHtml.match(/<section class="[^"]*personalize[^"]*"[\s\S]*?<\/section>/);
if (pers) {
  console.log('Personalize found:', pers[0].slice(0, 300));
}
