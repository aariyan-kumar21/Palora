const fs = require('fs');
let code = fs.readFileSync('scratch/build_clean_base_css.js', 'utf8');

// Ensure exact comments
code = code.replace(/\/\* ==========================================================================\s+===== MENU DRAWER =====[\s\S]*?========================================================================== \*\//,
`/* ==========================================================================
   /* ===== MENU DRAWER ===== */
   Slide-in drawer: 460px wide, full height, deep burgundy gradient, cream text
   ========================================================================== */`);

code = code.replace(/\/\* ==========================================================================\s+===== FOOTER =====[\s\S]*?========================================================================== \*\//,
`/* ==========================================================================
   /* ===== FOOTER ===== */
   Full-bleed deep burgundy gradient, top band, 5 columns grid, watermark, bottom bar
   ========================================================================== */`);

// Add .footer-back-to-top
if (!code.includes('.footer-back-to-top')) {
  code = code.replace('.footer-bottom-link:hover {', '.footer-back-to-top {\n  cursor: pointer;\n}\n\n.footer-bottom-link:hover {');
}

fs.writeFileSync('scratch/build_clean_base_css.js', code, 'utf8');
console.log('build_clean_base_css.js updated.');
