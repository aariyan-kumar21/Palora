const fs = require('fs');

const styleCss = fs.readFileSync('style.css', 'utf8');
const catCss = fs.readFileSync('css/catalogue.css', 'utf8');

const lines = styleCss.split('\n');
// Extract catalogue rules from line 2807 to prefers-reduced-motion around line 3415
const catSection = lines.slice(2806, 3415).join('\n');

// Remove .page-catalogue .site-header and .page-catalogue .nav-link overrides so base.css controls header
const cleanedCatSection = catSection.replace(/\.page-catalogue \.site-header\s*\{[\s\S]*?\}\s*/, '')
                                    .replace(/\.page-catalogue \.nav-link\s*\{[\s\S]*?\}\s*/, '')
                                    .replace(/\.page-catalogue \.nav-link\.active\s*\{[\s\S]*?\}\s*/, '');

// Remove @import url("../style.css"); from catalogue.css
const cleanedCatCss = catCss.replace(/@import\s+url\([^)]+\);?/, '').trim();

const combinedCatCss = `/* ==========================================================================
   Palora - Collections Catalogue Stylesheet (catalogue.css)
   Laptop Viewport (1024px and up, primary target 1900x868)
   ========================================================================== */

/* Header and page spacing unified with var(--nav-h, 115px) in css/base.css */
body[data-page="catalogue"] .catalogue-main {
  padding-top: var(--nav-h, 115px);
}

${cleanedCatSection}

${cleanedCatCss}
`;

fs.writeFileSync('css/catalogue.css', combinedCatCss, 'utf8');
console.log('catalogue.css updated! Total lines:', combinedCatCss.split('\n').length);
