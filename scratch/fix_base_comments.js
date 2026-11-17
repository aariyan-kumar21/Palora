const fs = require('fs');

let css = fs.readFileSync('css/base.css', 'utf8');

// 1. Fix comment block before MENU DRAWER
const badDrawerComment = `/* ==========================================================================
   /* ===== MENU DRAWER ===== */
   Slide-in drawer: 460px wide, full height, deep burgundy gradient, cream text
   ========================================================================== */`;

const goodDrawerComment = `/* ===== MENU DRAWER ===== */
/* Slide-in drawer: 460px wide, full height, deep burgundy gradient, cream text */`;

if (css.includes(badDrawerComment)) {
  css = css.replace(badDrawerComment, goodDrawerComment);
  console.log('Fixed badDrawerComment');
}

// 2. Fix comment block before FOOTER
const badFooterComment = `/* ==========================================================================
   /* ===== FOOTER ===== */
   Full-bleed deep burgundy gradient, top band, 5 columns grid, watermark, bottom bar
   ========================================================================== */`;

const goodFooterComment = `/* ===== FOOTER ===== */
/* Full-bleed deep burgundy gradient, top band, 5 columns grid, watermark, bottom bar */`;

if (css.includes(badFooterComment)) {
  css = css.replace(badFooterComment, goodFooterComment);
  console.log('Fixed badFooterComment');
}

fs.writeFileSync('css/base.css', css, 'utf8');
console.log('Updated base.css comments');
