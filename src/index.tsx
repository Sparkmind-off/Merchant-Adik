import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import type { Bindings, Product } from './types'
import { getDuitkuConfig, createInvoice, verifyCallbackSignature, isConfigured, duitkuJsUrl } from './duitku'
import { HomePage } from './pages/home'
import { CheckoutPage } from './pages/checkout'
import { AdminPage } from './pages/admin'
import { StatusPage } from './pages/status'

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))
app.use(renderer)

const DISCLOSURE = 'Bagian dari ekosistem SparkMind. Dioperasikan & diproses pembayarannya oleh Oasis BI Pro.'

// Favicon (emoji ikan) — hindari 500 pada /favicon.ico
app.get('/favicon.ico', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#04111f"/><text x="50" y="72" font-size="60" text-anchor="middle">🎣</text></svg>`
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } })
})

// ============ API: PRODUK ============
app.get('/api/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC'
  ).all()
  return c.json({ categories: results })
})

app.get('/api/products', async (c) => {
  const cat = c.req.query('category')
  let query = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1`
  const binds: any[] = []
  if (cat) { query += ' AND c.slug = ?'; binds.push(cat) }
  query += ' ORDER BY p.is_featured DESC, p.id ASC'
  const stmt = binds.length ? c.env.DB.prepare(query).bind(...binds) : c.env.DB.prepare(query)
  const { results } = await stmt.all()
  return c.json({ products: results })
})

app.get('/api/products/:sku', async (c) => {
  const sku = c.req.param('sku')
  const row = await c.env.DB.prepare(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.sku = ? AND p.is_active = 1`
  ).bind(sku).first()
  if (!row) return c.json({ error: 'Produk tidak ditemukan' }, 404)
  return c.json({ product: row })
})

// ============ API: PAYMENT CONFIG (frontend) ============
app.get('/api/payment-config', (c) => {
  const cfg = getDuitkuConfig(c.env)
  const configured = isConfigured(cfg)
  return c.json({
    pop_enabled: configured,
    env: cfg.env,
    duitku_js: configured ? duitkuJsUrl(cfg) : null
  })
})

// ============ API: CHECKOUT ============
app.post('/api/checkout', async (c) => {
  const body = await c.req.json<any>()
  const { customer_name, roblox_username, whatsapp, email, note, items, payment_method } = body

  if (!customer_name || !roblox_username || !Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'Data tidak lengkap. Nama, username Roblox, dan minimal 1 item wajib diisi.' }, 400)
  }

  // Hitung total dari harga DB (jangan percaya harga dari client)
  let subtotal = 0
  const validated: any[] = []
  for (const it of items) {
    const p = await c.env.DB.prepare('SELECT * FROM products WHERE sku = ? AND is_active = 1')
      .bind(it.sku).first<Product>()
    if (!p) return c.json({ error: `Produk ${it.sku} tidak tersedia.` }, 400)
    const qty = Math.max(1, parseInt(it.qty) || 1)
    const lineTotal = p.price_idr * qty
    subtotal += lineTotal
    validated.push({ p, qty, lineTotal })
  }
  const total = subtotal

  // Buat order_ref unik
  const orderRef = 'MA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()

  // Insert order
  const orderRes = await c.env.DB.prepare(
    `INSERT INTO orders (order_ref, customer_name, roblox_username, whatsapp, email, note, subtotal_idr, total_idr, status, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`
  ).bind(orderRef, customer_name, roblox_username, whatsapp || '', email || '', note || '', subtotal, total, payment_method || '').run()
  const orderId = orderRes.meta.last_row_id

  // Insert order_items
  for (const v of validated) {
    await c.env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price_idr, qty, line_total_idr)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(orderId, v.p.id, v.p.name, v.p.sku, v.p.price_idr, v.qty, v.lineTotal).run()
  }

  // Buat invoice Duitku POP
  const cfg = getDuitkuConfig(c.env)
  const productNames = validated.map((v) => `${v.p.name} x${v.qty}`).join(', ')
  const itemDetails = validated.map((v) => ({
    name: String(v.p.name).slice(0, 50),
    price: v.p.price_idr,
    quantity: v.qty
  }))
  const invoice = await createInvoice(cfg, {
    merchantOrderId: orderRef,
    paymentAmount: total,
    productDetails: productNames.slice(0, 255),
    customerName: customer_name,
    email: email || 'noemail@merchant-adik.web.id',
    phoneNumber: whatsapp || '',
    paymentMethod: payment_method || undefined,
    itemDetails,
    expiryMinutes: 60
  })

  if (!invoice.ok) {
    await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind('FAILED', orderId).run()
    return c.json({ error: 'Gagal membuat invoice pembayaran: ' + (invoice.statusMessage || 'unknown') }, 502)
  }

  await c.env.DB.prepare(
    'UPDATE orders SET payment_ref = ?, payment_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(invoice.reference || '', invoice.paymentUrl || '', orderId).run()

  return c.json({
    ok: true,
    order_ref: orderRef,
    total_idr: total,
    payment_url: invoice.paymentUrl,
    reference: invoice.reference,
    stub: invoice.stub || false,
    // Info untuk Duitku POP (popup) di frontend
    duitku_js: invoice.stub ? null : duitkuJsUrl(cfg),
    pop_enabled: !invoice.stub,
    message: invoice.statusMessage
  })
})

// ============ API: ORDER STATUS ============
app.get('/api/orders/:ref', async (c) => {
  const ref = c.req.param('ref')
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?').bind(ref).first()
  if (!order) return c.json({ error: 'Order tidak ditemukan' }, 404)
  const { results: items } = await c.env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  ).bind((order as any).id).all()
  return c.json({ order, items })
})

// ============ DUITKU WEBHOOK CALLBACK ============
app.post('/webhook/duitku', async (c) => {
  const cfg = getDuitkuConfig(c.env)
  let form: Record<string, string> = {}
  const ct = c.req.header('content-type') || ''
  if (ct.includes('application/json')) {
    form = await c.req.json()
  } else {
    const fd = await c.req.formData()
    fd.forEach((v, k) => { form[k] = String(v) })
  }

  const merchantOrderId = form.merchantOrderId
  const amount = form.amount
  const resultCode = form.resultCode // '00' = success, '01' = failed
  const reference = form.reference
  const signature = form.signature

  const valid = await verifyCallbackSignature(cfg, merchantOrderId, amount, signature)

  // Audit log
  await c.env.DB.prepare(
    `INSERT INTO payment_callbacks (order_ref, provider, raw_payload, result_code, signature_valid)
     VALUES (?, 'duitku', ?, ?, ?)`
  ).bind(merchantOrderId || '', JSON.stringify(form), resultCode || '', valid ? 1 : 0).run()

  if (!valid && isConfigured(cfg)) {
    return c.text('Invalid signature', 400)
  }

  if (merchantOrderId) {
    const newStatus = resultCode === '00' ? 'PAID' : 'FAILED'
    await c.env.DB.prepare(
      `UPDATE orders SET status = ?, payment_ref = ?, paid_at = CASE WHEN ? = 'PAID' THEN CURRENT_TIMESTAMP ELSE paid_at END, updated_at = CURRENT_TIMESTAMP WHERE order_ref = ?`
    ).bind(newStatus, reference || '', newStatus, merchantOrderId).run()
  }
  return c.text('OK')
})

// STUB pay page (untuk dev, simulasi bayar)
app.get('/pay/stub', (c) => {
  const order = c.req.query('order') || ''
  const amount = c.req.query('amount') || '0'
  return c.html(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pembayaran (Sandbox) — ${order}</title><script src="https://cdn.tailwindcss.com"></script></head>
  <body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-cyan-500/30 shadow-2xl">
    <div class="text-center mb-6"><i class="fas fa-flask text-4xl text-amber-400"></i></div>
    <h1 class="text-xl font-bold text-center mb-2">Halaman Pembayaran (SANDBOX/STUB)</h1>
    <p class="text-sm text-slate-400 text-center mb-6">Kredensial Duitku asli belum diisi. Ini simulasi pembayaran untuk testing.</p>
    <div class="bg-slate-900 rounded-lg p-4 mb-6 text-sm">
      <div class="flex justify-between py-1"><span class="text-slate-400">Order Ref</span><span class="font-mono">${order}</span></div>
      <div class="flex justify-between py-1"><span class="text-slate-400">Jumlah</span><span class="font-bold text-cyan-400">Rp ${Number(amount).toLocaleString('id-ID')}</span></div>
    </div>
    <form method="POST" action="/pay/stub/confirm">
      <input type="hidden" name="order" value="${order}"><input type="hidden" name="amount" value="${amount}">
      <button class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl mb-3"><i class="fas fa-check mr-2"></i>Simulasikan Bayar BERHASIL</button>
    </form>
    <a href="/status/${order}" class="block text-center text-sm text-slate-400 hover:text-slate-200">Lihat status order</a>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  </div></body></html>`)
})

app.post('/pay/stub/confirm', async (c) => {
  const fd = await c.req.formData()
  const order = String(fd.get('order') || '')
  if (order) {
    await c.env.DB.prepare(
      `UPDATE orders SET status = 'PAID', paid_at = CURRENT_TIMESTAMP, payment_ref = ?, updated_at = CURRENT_TIMESTAMP WHERE order_ref = ?`
    ).bind('STUB-PAID-' + Date.now(), order).run()
  }
  return c.redirect('/status/' + order)
})

// ============ ADMIN API (token-protected) ============
function adminAuth(c: any): boolean {
  const token = c.req.header('x-admin-token') || c.req.query('token')
  const expected = c.env.ADMIN_TOKEN || 'admin123'
  return token === expected
}

app.get('/api/admin/orders', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM orders ORDER BY created_at DESC LIMIT 200'
  ).all()
  return c.json({ orders: results })
})

app.get('/api/admin/products', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id ASC`
  ).all()
  return c.json({ products: results })
})

app.post('/api/admin/products', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const b = await c.req.json<any>()
  if (b.id) {
    await c.env.DB.prepare(
      `UPDATE products SET name=?, description=?, category_id=?, price_idr=?, rarity=?, image_url=?, stock=?, is_active=?, is_featured=?, promo_text=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).bind(b.name, b.description||'', b.category_id||null, b.price_idr, b.rarity||null, b.image_url||null, b.stock??999, b.is_active??1, b.is_featured??0, b.promo_text||null, b.id).run()
    return c.json({ ok: true, id: b.id })
  } else {
    const res = await c.env.DB.prepare(
      `INSERT INTO products (sku, name, description, category_id, price_idr, rarity, image_url, stock, is_active, is_featured, promo_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(b.sku, b.name, b.description||'', b.category_id||null, b.price_idr, b.rarity||null, b.image_url||null, b.stock??999, b.is_active??1, b.is_featured??0, b.promo_text||null).run()
    return c.json({ ok: true, id: res.meta.last_row_id })
  }
})

app.delete('/api/admin/products/:id', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  await c.env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

app.post('/api/admin/orders/:ref/deliver', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  await c.env.DB.prepare("UPDATE orders SET status='DELIVERED', updated_at=CURRENT_TIMESTAMP WHERE order_ref=?")
    .bind(c.req.param('ref')).run()
  return c.json({ ok: true })
})

// Admin: ringkasan dashboard (statistik)
app.get('/api/admin/stats', async (c) => {
  if (!adminAuth(c)) return c.json({ error: 'Unauthorized' }, 401)
  const totalOrders = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM orders').first<any>()
  const paidAgg = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n, COALESCE(SUM(total_idr),0) AS revenue FROM orders WHERE status IN ('PAID','DELIVERED')"
  ).first<any>()
  const pending = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM orders WHERE status='PENDING'").first<any>()
  const products = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM products WHERE is_active=1').first<any>()
  return c.json({
    total_orders: totalOrders?.n || 0,
    paid_orders: paidAgg?.n || 0,
    revenue_idr: paidAgg?.revenue || 0,
    pending_orders: pending?.n || 0,
    active_products: products?.n || 0
  })
})

// ============ PAGES ============
app.get('/', (c) => c.render(<HomePage />, { title: 'Merchant Adik — Kebutuhan Fish It (Roblox)' }))
app.get('/checkout', (c) => c.render(<CheckoutPage />, { title: 'Checkout — Merchant Adik' }))
app.get('/status/:ref', (c) => c.render(<StatusPage orderRef={c.req.param('ref')} />, { title: 'Status Order — Merchant Adik' }))
app.get('/admin', (c) => c.render(<AdminPage />, { title: 'Admin — Merchant Adik' }))

export default app
