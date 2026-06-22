# Merchant Adik — Marketplace Kebutuhan Fish It (Roblox)

Marketplace untuk menjual kebutuhan game **Fish It (Roblox)**: ikan secret, batu enchant, tumbal, rod/pancingan, gems & coins. Bagian dari ekosistem **SparkMind**, pembayaran diproses via **Duitku POP** (Merchant-of-Record: Oasis BI Pro).

## Project Overview
- **Name**: Merchant Adik (`merchant-adik`)
- **Goal**: Marketplace bertema underwater/ocean untuk jual-beli item Fish It dengan checkout + payment gateway sungguhan (Duitku POP) dan data persisten di Cloudflare D1.
- **Tech Stack**: Hono + TypeScript + Cloudflare Pages/Workers + D1 + TailwindCSS (CDN)

## Currently Completed Features
- ✅ Katalog produk Fish It (kartu produk, gambar, harga IDR, rarity badge, filter kategori)
- ✅ Keranjang belanja (localStorage) + drawer
- ✅ Checkout (form data pembeli: nama, username Roblox, WhatsApp, email, catatan)
- ✅ Integrasi pembayaran **Duitku POP** (createInvoice + signature HMAC-SHA256 via Web Crypto)
- ✅ Webhook callback Duitku (verifikasi signature + audit log)
- ✅ Halaman status order
- ✅ Panel Admin (token-protected): kelola produk (CRUD), lihat order, deliver order, statistik dashboard
- ✅ Database Cloudflare D1 (categories, products, orders, order_items, payment_callbacks)
- ✅ STUB mode otomatis bila kredensial Duitku belum lengkap (untuk dev/testing)

## Functional Entry URIs
### Halaman (HTML)
- `GET /` — Home / katalog produk
- `GET /checkout` — Halaman checkout
- `GET /status/:ref` — Status order
- `GET /admin` — Panel admin (login token)

### API Publik
- `GET /api/categories` — Daftar kategori
- `GET /api/products?category=<slug>` — Daftar produk (filter kategori opsional)
- `GET /api/products/:sku` — Detail produk
- `GET /api/payment-config` — Konfigurasi pembayaran untuk frontend
- `POST /api/checkout` — Buat order + invoice. Body: `{customer_name, roblox_username, whatsapp, email, note, items:[{sku, qty}], payment_method}`
- `GET /api/orders/:ref` — Detail order + item

### Webhook & Payment
- `POST /webhook/duitku` — Callback pembayaran Duitku
- `GET /pay/stub` + `POST /pay/stub/confirm` — Simulasi pembayaran (mode STUB/dev)

### Admin API (header `x-admin-token` atau `?token=`)
- `GET /api/admin/stats` — Statistik
- `GET /api/admin/orders` — Daftar order
- `GET /api/admin/products` — Daftar produk
- `POST /api/admin/products` — Tambah/update produk
- `DELETE /api/admin/products/:id` — Nonaktifkan produk
- `POST /api/admin/orders/:ref/deliver` — Tandai order DELIVERED

## Data Architecture
- **Storage**: Cloudflare D1 (SQLite)
- **Tables**: `categories`, `products`, `orders`, `order_items`, `payment_callbacks`
- **Data Flow**: Frontend (cart localStorage) → `/api/checkout` → validasi harga dari D1 → buat order → Duitku createInvoice → popup/redirect pembayaran → webhook update status order.

## User Guide
1. Buka halaman utama, telusuri katalog & filter kategori.
2. Tambahkan item ke keranjang, lalu klik **Lanjut Checkout**.
3. Isi data pembeli (nama, username Roblox, WhatsApp) → **Bayar Sekarang**.
4. Selesaikan pembayaran via Duitku (QRIS/VA/e-wallet). Mode STUB tersedia bila kredensial belum lengkap.
5. Pantau status di `/status/:ref`.
6. Admin: buka `/admin`, masukkan token (default dev: `admin123`).

## Deployment
- **Platform**: Cloudflare Pages (BYOK — akun Cloudflare sendiri)
- **Production DB**: `merchant-adik-production` (D1)
- **Secrets produksi** (set via `wrangler pages secret put`): `DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`, `DUITKU_ENV`, `DUITKU_CALLBACK_URL`, `DUITKU_RETURN_URL`, `ADMIN_TOKEN`
- **Status**: Local ✅ Active

## Catatan Konfigurasi Duitku
- `DUITKU_API_KEY` sudah tersedia. **`DUITKU_MERCHANT_CODE` masih placeholder** (`DXXXXX`) sehingga app berjalan di **STUB mode**. Untuk menerima pembayaran riil, isi merchant code asli + set `DUITKU_ENV=production`.

## Development
```bash
npm install
npm run build
npm run db:migrate:local && npm run db:seed
pm2 start ecosystem.config.cjs
curl http://localhost:3000
```

---
*Bagian dari ekosistem SparkMind. Dioperasikan & diproses pembayarannya oleh Oasis BI Pro (Merchant-of-Record, Duitku PJP). Bukan afiliasi resmi Roblox / Fish It.*
