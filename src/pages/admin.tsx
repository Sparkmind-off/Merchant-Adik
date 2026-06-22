export const AdminPage = () => (
  <>
    <header class="bg-slate-900/80 border-b border-cyan-500/20 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" class="font-bold text-cyan-300"><i class="fas fa-user-shield mr-2"></i>Admin — Merchant Adik</a>
        <a href="/" class="text-sm text-slate-400 hover:text-cyan-300"><i class="fas fa-home mr-1"></i>Toko</a>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      {/* Login token */}
      <div id="admin-login" class="max-w-sm mx-auto bg-slate-800/60 rounded-2xl p-6 border border-slate-700 mt-10">
        <h2 class="font-bold mb-4 text-center">Masuk Admin</h2>
        <input id="admin-token" type="password" placeholder="Admin token" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 mb-3 outline-none focus:border-cyan-400" />
        <button id="admin-login-btn" class="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 rounded-lg">Masuk</button>
        <p class="text-[11px] text-slate-500 mt-3 text-center">Default token dev: <code class="text-cyan-300">admin123</code> (ganti via secret ADMIN_TOKEN saat produksi)</p>
      </div>

      <div id="admin-panel" class="hidden">
        {/* Tabs */}
        <div class="flex gap-2 mb-6 border-b border-slate-700">
          <button data-tab="orders" class="admin-tab px-4 py-2 font-semibold border-b-2 border-cyan-400 text-cyan-300">Order</button>
          <button data-tab="products" class="admin-tab px-4 py-2 font-semibold border-b-2 border-transparent text-slate-400">Produk</button>
        </div>

        <section id="tab-orders">
          <div id="orders-table" class="overflow-x-auto"></div>
        </section>

        <section id="tab-products" class="hidden">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold">Kelola Produk</h3>
            <button id="add-product-btn" class="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg"><i class="fas fa-plus mr-1"></i>Tambah</button>
          </div>
          <div id="products-table" class="overflow-x-auto"></div>
        </section>
      </div>
    </main>

    {/* Product editor modal */}
    <div id="product-modal" class="fixed inset-0 bg-black/70 z-50 hidden items-center justify-center p-4">
      <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 id="modal-title" class="font-bold text-lg mb-4">Tambah Produk</h3>
        <form id="product-form" class="space-y-3 text-sm">
          <input type="hidden" name="id" />
          <div><label class="block mb-1 text-slate-300">SKU</label><input name="sku" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
          <div><label class="block mb-1 text-slate-300">Nama</label><input name="name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
          <div><label class="block mb-1 text-slate-300">Deskripsi</label><textarea name="description" rows={2} class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"></textarea></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block mb-1 text-slate-300">Kategori</label><select name="category_id" id="modal-category" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"></select></div>
            <div><label class="block mb-1 text-slate-300">Harga (IDR)</label><input name="price_idr" type="number" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block mb-1 text-slate-300">Rarity</label><input name="rarity" placeholder="1 in 8M" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
            <div><label class="block mb-1 text-slate-300">Stok</label><input name="stock" type="number" value="999" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
          </div>
          <div><label class="block mb-1 text-slate-300">URL Gambar</label><input name="image_url" placeholder="/static/img/xxx.png" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
          <div><label class="block mb-1 text-slate-300">Promo Text</label><input name="promo_text" placeholder="Beli 10 gratis 1" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" /></div>
          <div class="flex gap-4">
            <label class="flex items-center gap-2"><input type="checkbox" name="is_active" checked /> Aktif</label>
            <label class="flex items-center gap-2"><input type="checkbox" name="is_featured" /> Unggulan</label>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="submit" class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 rounded-lg">Simpan</button>
            <button type="button" id="modal-cancel" class="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg">Batal</button>
          </div>
        </form>
      </div>
    </div>

    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
    <script src="/static/admin.js"></script>
  </>
)
