/**
 * Palora Product Catalog & Collections Data
 * Single source of truth for the homepage Bestselling slider and Collections catalogue page.
 * Easy for a non-technical client to edit.
 */

const DESC = "Handmade to order with care. Add a personalization note below.";

const COLLECTIONS = [
  { slug: "crochet-crafts", label: "Crochet Crafts", icon: "yarn" },
  { slug: "resin-keepsakes", label: "Resin Keepsakes", icon: "gem" },
  { slug: "floral-decor", label: "Floral & Decor", icon: "flower" },
  { slug: "frames-letters", label: "Frames & Letters", icon: "frame" },
  { slug: "luxe-hampers", label: "Luxe Hampers", icon: "gift" }
];

const CATEGORIES = [
  { slug: "keychains", label: "Keychains", type: "product", icon: "key" },
  { slug: "home-decor", label: "Home decor", type: "product", icon: "house" },
  { slug: "birthdays", label: "Birthdays", type: "occasion", icon: "cake" },
  { slug: "anniversaries", label: "Anniversaries", type: "occasion", icon: "hearts" },
  { slug: "just-because", label: "Just because", type: "occasion", icon: "heart" },
  { slug: "bouquets-flowers", label: "Bouquets & flowers", type: "product", icon: "flower" },
  { slug: "crochet-items", label: "Crochet items", type: "product", icon: "yarn" },
  { slug: "designed-frames", label: "Designed frames", type: "product", icon: "frame" },
  { slug: "letters-cards", label: "Letters and cards", type: "product", icon: "mail" },
  { slug: "hampers", label: "Hampers", type: "product", icon: "gift" },
  { slug: "festivals", label: "Festivals", type: "occasion", icon: "lotus" }
];

function productsInCategory(slug) {
  const c = CATEGORIES.find(x => x.slug === slug);
  if (!c) return [];
  return PRODUCTS.filter(p => c.type === "product" ? p.category === slug : (p.occasions || []).includes(slug));
}

function countInCategory(slug) {
  return productsInCategory(slug).length;
}

// Placeholder tagging so every category has at least one product; adjust when real products are added.
const PRODUCTS = [
  { id: "crochet-sunflower-bouquet", name: "Crochet Sunflower Bouquet", price: 899, badge: "Bestseller", collection: "crochet-crafts", category: "crochet-items", occasions: ["birthdays", "just-because"], customizable: false, featured: true, image: "assets/products/crochet-sunflower-bouquet.jpg", description: DESC },
  { id: "floral-resin-coasters", name: "Floral Resin Coasters", price: 649, badge: "New", collection: "resin-keepsakes", category: "home-decor", occasions: ["festivals"], customizable: true, featured: true, image: "assets/products/floral-resin-coasters.jpg", description: DESC },
  { id: "crochet-bunny", name: "Crochet Bunny", price: 1049, badge: "Handmade", collection: "crochet-crafts", category: "crochet-items", occasions: ["birthdays"], customizable: false, featured: true, image: "assets/products/crochet-bunny.jpg", description: DESC },
  { id: "custom-photo-frame", name: "Custom Photo Frame", price: 799, badge: "Personalizable", collection: "frames-letters", category: "designed-frames", occasions: ["anniversaries"], customizable: true, featured: true, image: "assets/products/custom-photo-frame.jpg", description: DESC },
  { id: "self-care-hamper", name: "The Self-Care Hamper", price: 2499, badge: "Luxe", collection: "luxe-hampers", category: "hampers", occasions: ["just-because"], customizable: false, featured: false, image: "assets/products/self-care-hamper.jpg", description: DESC },
  { id: "initial-resin-keychain", name: "Initial Resin Keychain", price: 349, badge: "Personalizable", collection: "resin-keepsakes", category: "keychains", occasions: ["birthdays"], customizable: true, featured: false, image: "assets/products/initial-resin-keychain.jpg", description: DESC },
  { id: "crochet-rose-bouquet", name: "Crochet Rose Bouquet", price: 1199, badge: "Bestseller", collection: "crochet-crafts", category: "bouquets-flowers", occasions: ["anniversaries", "just-because"], customizable: false, featured: false, image: "assets/products/crochet-rose-bouquet.jpg", description: DESC },
  { id: "scented-soy-candle", name: "Scented Soy Candle", price: 599, badge: "Handmade", collection: "floral-decor", category: "home-decor", occasions: ["festivals", "just-because"], customizable: false, featured: false, image: "assets/products/scented-soy-candle.jpg", description: DESC },
  // SAMPLE products:
  { id: "personalized-name-keychain", name: "Personalized Name Keychain", price: 299, badge: "Personalizable", collection: "resin-keepsakes", category: "keychains", occasions: ["birthdays", "anniversaries"], customizable: true, featured: true, image: "assets/products/personalized-name-keychain.jpg", description: DESC },
  { id: "letter-and-card-set", name: "Handwritten Letter & Card Set", price: 349, badge: "Handmade", collection: "frames-letters", category: "letters-cards", occasions: ["anniversaries"], customizable: true, featured: true, image: "assets/products/letter-and-card-set.jpg", description: DESC },
  { id: "festive-gift-hamper", name: "Festive Gift Hamper", price: 1499, badge: "New", collection: "luxe-hampers", category: "hampers", occasions: ["festivals"], customizable: false, featured: true, image: "assets/products/festive-gift-hamper.jpg", description: DESC },
  { id: "mini-floral-bouquet", name: "Mini Floral Bouquet", price: 599, badge: "Bestseller", collection: "floral-decor", category: "bouquets-flowers", occasions: ["birthdays", "just-because"], customizable: false, featured: true, image: "assets/products/mini-floral-bouquet.jpg", description: DESC }
];
