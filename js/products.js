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

// Keep the NEWEST products at the TOP of this list. "occasions" is for later (homepage categories), leave empty for now. Products marked SAMPLE are placeholders to replace.
const PRODUCTS = [
  { id:"crochet-sunflower-bouquet", name:"Crochet Sunflower Bouquet", price:899, badge:"Bestseller", collection:"crochet-crafts", category:"crochet-items", occasions:[], customizable:false, featured:true, image:"assets/products/crochet-sunflower-bouquet.jpg", description:DESC },
  { id:"floral-resin-coasters", name:"Floral Resin Coasters", price:649, badge:"New", collection:"resin-keepsakes", category:"home-decor", occasions:[], customizable:true, featured:true, image:"assets/products/floral-resin-coasters.jpg", description:DESC },
  { id:"crochet-bunny", name:"Crochet Bunny", price:1049, badge:"Handmade", collection:"crochet-crafts", category:"crochet-items", occasions:[], customizable:false, featured:true, image:"assets/products/crochet-bunny.jpg", description:DESC },
  { id:"custom-photo-frame", name:"Custom Photo Frame", price:799, badge:"Personalizable", collection:"frames-letters", category:"designed-frames", occasions:[], customizable:true, featured:true, image:"assets/products/custom-photo-frame.jpg", description:DESC },
  { id:"self-care-hamper", name:"The Self-Care Hamper", price:2499, badge:"Luxe", collection:"luxe-hampers", category:"hampers", occasions:[], customizable:false, featured:false, image:"assets/products/self-care-hamper.jpg", description:DESC },
  { id:"initial-resin-keychain", name:"Initial Resin Keychain", price:349, badge:"Personalizable", collection:"resin-keepsakes", category:"keychains", occasions:[], customizable:true, featured:false, image:"assets/products/initial-resin-keychain.jpg", description:DESC },
  { id:"crochet-rose-bouquet", name:"Crochet Rose Bouquet", price:1199, badge:"Bestseller", collection:"crochet-crafts", category:"bouquets-flowers", occasions:[], customizable:false, featured:false, image:"assets/products/crochet-rose-bouquet.jpg", description:DESC },
  { id:"scented-soy-candle", name:"Scented Soy Candle", price:599, badge:"Handmade", collection:"floral-decor", category:"home-decor", occasions:[], customizable:false, featured:false, image:"assets/products/scented-soy-candle.jpg", description:DESC },
  // SAMPLE products:
  { id:"personalized-name-keychain", name:"Personalized Name Keychain", price:299, badge:"Personalizable", collection:"resin-keepsakes", category:"keychains", occasions:[], customizable:true, featured:true, image:"assets/products/personalized-name-keychain.jpg", description:DESC },
  { id:"letter-and-card-set", name:"Handwritten Letter & Card Set", price:349, badge:"Handmade", collection:"frames-letters", category:"letters-cards", occasions:[], customizable:true, featured:true, image:"assets/products/letter-and-card-set.jpg", description:DESC },
  { id:"festive-gift-hamper", name:"Festive Gift Hamper", price:1499, badge:"New", collection:"luxe-hampers", category:"hampers", occasions:[], customizable:false, featured:true, image:"assets/products/festive-gift-hamper.jpg", description:DESC },
  { id:"mini-floral-bouquet", name:"Mini Floral Bouquet", price:599, badge:"Bestseller", collection:"floral-decor", category:"bouquets-flowers", occasions:[], customizable:false, featured:true, image:"assets/products/mini-floral-bouquet.jpg", description:DESC }
];
