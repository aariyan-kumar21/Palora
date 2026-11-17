const fs = require('fs');
let code = fs.readFileSync('js/product-ui.js', 'utf8');

// Replace the heart SVG in the default card with icon("heart")
const oldDefaultHeartRegex = /<button type="button" class="wish"[^>]*>[\s\S]*?<\/button>/;

const newDefaultHeart = `<button type="button" class="wish" data-product-id="\${product.id}" aria-pressed="\${isWishlisted ? 'true' : 'false'}" aria-label="\${isWishlisted ? \`Remove \${product.name} from wishlist\` : \`Add \${product.name} to wishlist\`}">
            \${typeof icon === "function" ? icon("heart", { size: 24, strokeWidth: 1.5, className: "wish-heart-svg", fill: isWishlisted ? "#722F37" : "none" }) : \`<svg class="wish-heart-svg" width="24" height="24" viewBox="0 0 24 24" fill="\${isWishlisted ? '#722F37' : 'none'}" stroke="\${isWishlisted ? '#722F37' : '#6A1F2C'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>\`}
          </button>`;

// Replace specifically in the default card section (after variant === "catalogue" block)
const parts = code.split('// Default variant (Bestsellers slider on homepage)');
if (parts.length === 2) {
  parts[1] = parts[1].replace(oldDefaultHeartRegex, newDefaultHeart);
  code = parts.join('// Default variant (Bestsellers slider on homepage)');
}

fs.writeFileSync('js/product-ui.js', code, 'utf8');
console.log('Successfully updated product-ui.js');
