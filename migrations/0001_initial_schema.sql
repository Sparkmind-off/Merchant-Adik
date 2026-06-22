-- Merchant Adik — Fish It Marketplace Schema
-- Bagian dari ekosistem SparkMind, MoR Oasis BI Pro

-- Kategori produk
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Produk Fish It
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER,
  price_idr INTEGER NOT NULL,
  rarity TEXT,                 -- contoh: "1 in 8M"
  image_url TEXT,
  stock INTEGER DEFAULT 999,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  promo_text TEXT,             -- contoh: "Beli 10 gratis 1"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Order/transaksi
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref TEXT UNIQUE NOT NULL,        -- merchantOrderId untuk Duitku
  customer_name TEXT NOT NULL,
  roblox_username TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  note TEXT,
  subtotal_idr INTEGER NOT NULL,
  total_idr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | PAID | EXPIRED | FAILED | DELIVERED
  payment_method TEXT,                      -- duitku payment code
  payment_provider TEXT DEFAULT 'duitku',
  payment_ref TEXT,                         -- duitku reference
  payment_url TEXT,                         -- duitku paymentUrl
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Item dalam order
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit_price_idr INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  line_total_idr INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Log webhook / callback Duitku (audit trail)
CREATE TABLE IF NOT EXISTS payment_callbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref TEXT,
  provider TEXT DEFAULT 'duitku',
  raw_payload TEXT,
  result_code TEXT,
  signature_valid INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
