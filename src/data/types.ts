export type ProductBadge = "Bestseller" | "New" | "Handmade" | "Personalizable" | "Luxe";

export interface Product {
  id: string;
  name: string;
  price: number;
  badge: ProductBadge;
  collection: string;
  category: string;
  occasions?: string[];
  customizable: boolean;
  featured: boolean;
  image: string;
  description: string;
}

export interface CollectionItem {
  slug: string;
  label: string;
  icon: string;
}

export interface CategoryItem {
  slug: string;
  label: string;
  type: "product" | "occasion";
  icon: string;
}

export interface CartItem {
  cartItemId: string;
  id: string;
  name: string;
  price: number;
  image: string;
  note: string;
  quantity: number;
}
