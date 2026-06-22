export type Bindings = {
  DB: D1Database;
  // Duitku secrets (set via wrangler secret put / .dev.vars)
  DUITKU_MERCHANT_CODE?: string;
  DUITKU_API_KEY?: string;
  DUITKU_ENV?: string;        // 'sandbox' | 'production'
  DUITKU_CALLBACK_URL?: string;
  DUITKU_RETURN_URL?: string;
  // Admin
  ADMIN_TOKEN?: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category_id: number | null;
  price_idr: number;
  rarity: string | null;
  image_url: string | null;
  stock: number;
  is_active: number;
  is_featured: number;
  promo_text: string | null;
  category_name?: string;
  category_slug?: string;
};

export type CartItem = {
  sku: string;
  qty: number;
};
