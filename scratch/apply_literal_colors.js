const fs = require('fs');

let css = fs.readFileSync('css/base.css', 'utf8');

// Replace footer declaration with exact requested literal values
const oldFooterDecl = `.site-footer {
  background: linear-gradient(180deg, #5E2A31 0%, #4A2328 100%);
  border-top: 1px solid rgba(215, 167, 177, 0.5);
  color: #FFF7F2;
  padding-top: 0;
  position: relative;
  overflow: hidden;
  font-family: var(--font-serif);
}`;

const newFooterDecl = `footer#site-footer,
.site-footer {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background-color: #4A2328;
  background-image: linear-gradient(180deg, #5E2A31 0%, #4A2328 100%);
  color: #FFF7F2;
  border-top: 1px solid rgba(215, 167, 177, 0.5);
  padding-top: 0;
  font-family: 'Cormorant Garamond', Garamond, Georgia, serif;
}`;

css = css.replace(oldFooterDecl, newFooterDecl);

// Update drawer panel declaration with exact requested literal values
const oldDrawerDecl = `.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 460px;
  max-width: 90vw;
  height: 100vh;
  height: 100dvh;
  background: radial-gradient(circle at top right, rgba(242, 196, 206, 0.16), transparent 60%),
              linear-gradient(165deg, #5E2A31 0%, #722F37 55%, #572E2E 100%);
  color: #FFF7F2;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  padding: 40px 44px;
  transform: translateX(110%);
  visibility: hidden;
  pointer-events: none;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), visibility 450ms ease;
  box-shadow: -12px 0 36px rgba(40, 18, 22, 0.35);
  overflow: hidden;
}`;

const newDrawerDecl = `aside#mobileDrawer,
.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 460px;
  max-width: 90vw;
  height: 100vh;
  height: 100dvh;
  background-color: #5E2A31;
  background-image: linear-gradient(165deg, #5E2A31 0%, #722F37 55%, #572E2E 100%);
  color: #FFF7F2;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  padding: 40px 44px;
  transform: translateX(110%);
  visibility: hidden;
  pointer-events: none;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), visibility 450ms ease;
  box-shadow: -12px 0 36px rgba(40, 18, 22, 0.35);
  overflow: hidden;
  font-family: 'Cormorant Garamond', Garamond, Georgia, serif;
}`;

css = css.replace(oldDrawerDecl, newDrawerDecl);

// Ensure robust literal colors in footer
css = css.replace('color: var(--footer-text);', 'color: #FFF7F2;');
css = css.replace('color: rgba(255, 247, 242, 0.85);', 'color: rgba(255, 247, 242, 0.82);');
css = css.replace('color: rgba(255, 247, 242, 0.75);', 'color: rgba(255, 247, 242, 0.82);');
css = css.replace('color: rgba(255, 247, 242, 0.7);', 'color: rgba(255, 247, 242, 0.8);');

// Ensure overlays use literal rgba
css = css.replace('background-color: rgba(87, 46, 46, 0.4);', 'background-color: rgba(40, 18, 22, 0.55);');

fs.writeFileSync('css/base.css', css, 'utf8');
console.log('Updated base.css with robust literal hex and rgba values.');
