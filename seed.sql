-- Merchant Adik — Seed data (kategori + produk Fish It)
-- Bagian ekosistem SparkMind · MoR Oasis BI Pro

-- ===== KATEGORI =====
INSERT OR IGNORE INTO categories (id, slug, name, icon, sort_order) VALUES
  (1, 'secret-fish', 'Ikan Secret', 'fa-fish', 1),
  (2, 'enchant', 'Batu Enchant', 'fa-gem', 2),
  (3, 'tumbal', 'Tumbal', 'fa-skull', 3),
  (4, 'rod', 'Rod / Pancingan', 'fa-fish-fins', 4),
  (5, 'gems-coins', 'Gems & Coins', 'fa-coins', 5);

-- ===== PRODUK =====
INSERT OR IGNORE INTO products (sku, name, description, category_id, price_idr, rarity, image_url, stock, is_active, is_featured, promo_text) VALUES
  ('FISH-ELSHARK', 'El Shark Gran Raja', 'Ikan secret langka El Shark Gran Raja. Langsung masuk ke akun Roblox Fish It kamu.', 1, 60000, '1 in 8M', NULL, 999, 1, 1, NULL),
  ('FISH-LOCHNESS', 'Lochness', 'Monster legendaris Lochness — koleksi secret paling dicari di Fish It.', 1, 70000, '1 in 5M', NULL, 999, 1, 1, NULL),
  ('FISH-SCARE', 'Scare', 'Ikan secret Scare dengan rarity tinggi. Harga hemat.', 1, 10000, '1 in 3M', NULL, 999, 1, 1, NULL),
  ('FISH-GHOSTSHARK', 'Ghost Shark', 'Ghost Shark — ikan hantu eksklusif untuk koleksi kamu.', 1, 10000, '1 in 500K', NULL, 999, 1, 0, NULL),
  ('FISH-THINARMOR', 'Thin Armor Shark', 'Thin Armor Shark, hiu berlapis baja tipis yang cepat.', 1, 10000, '1 in 300K', NULL, 999, 1, 0, NULL),
  ('ENC-V2', 'Batu Enchant v2', 'Batu enchant versi 2 untuk meningkatkan rod / item kamu.', 2, 10000, NULL, NULL, 999, 1, 1, NULL),
  ('ENC-PACK13', 'Batu Enchant (13 Biji)', 'Paket hemat batu enchant — dapat 13 biji sekaligus.', 2, 10000, NULL, NULL, 999, 1, 0, 'Dapat 13 biji'),
  ('TUMBAL-SECRET', 'Secret Tumbal', 'Tumbal secret untuk ritual upgrade di Fish It.', 3, 10000, NULL, NULL, 999, 1, 1, 'Beli 10 gratis 1'),
  ('COINS-1M', '1.000.000 Coins', 'Top up 1 juta coins langsung ke akun Fish It kamu.', 5, 15000, NULL, NULL, 999, 1, 0, NULL),
  ('GEMS-1K', '1.000 Gems', 'Top up 1.000 gems untuk belanja item premium di Fish It.', 5, 25000, NULL, NULL, 999, 1, 0, NULL),
  ('ROD-LEGEND', 'Rod Legendary', 'Pancingan legendary dengan stat terbaik untuk hasil maksimal.', 4, 35000, 'Legendary', NULL, 999, 1, 0, NULL);
