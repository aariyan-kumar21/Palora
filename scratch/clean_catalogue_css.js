const fs = require('fs');

const styleCss = fs.readFileSync('c:\\Users\\Aariy\\Palora\\style.css', 'utf8');
const catCss = fs.readFileSync('c:\\Users\\Aariy\\Palora\\css\\catalogue.css', 'utf8');

// Extract catalogue section from style.css (from /* Banner */ down to before /* Prefers-reduced-motion overrides */)
const bannerIdx = styleCss.indexOf('/* Banner */\n.catalogue-banner');
const motionIdx = styleCss.indexOf('/* Prefers-reduced-motion overrides */');

if (bannerIdx !== -1 && motionIdx !== -1) {
  const catSection = styleCss.substring(bannerIdx, motionIdx);
  
  // Remove @import from catalogue.css
  let newCatCss = catCss.replace('@import url("../style.css");', '/* Standalone Catalogue Styles (migrated from legacy style.css) */');
  newCatCss += '\n\n' + catSection;
  
  fs.writeFileSync('c:\\Users\\Aariy\\Palora\\css\\catalogue.css', newCatCss, 'utf8');
  console.log('Successfully updated css/catalogue.css');
} else {
  console.error('Could not find indices:', { bannerIdx, motionIdx });
}
