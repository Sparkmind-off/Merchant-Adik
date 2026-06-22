(function () {
  let token = sessionStorage.getItem('ma_admin_token') || '';
  let categories = [];

  function rupiah(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
  function api(path, opts = {}) {
    return fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', 'x-admin-token': token, ...(opts.headers || {}) } });
  }

  const STATUS_BADGE = {
    PENDING: 'bg-amber-500/20 text-amber-300', PAID: 'bg-green-500/20 text-green-300',
    DELIVERED: 'bg-cyan-500/20 text-cyan-300', FAILED: 'bg-red-500/20 text-red-300', EXPIRED: 'bg-slate-500/20 text-slate-300'
  };

  async function loadOrders() {
    const res = await api('/api/admin/orders');
    if (res.status === 401) { logout(); return; }
    const { orders } = await res.json();
    const t = document.getElementById('orders-table');
    if (!orders.length) { t.innerHTML = '<p class="text-slate-400 py-6 text-center">Belum ada order.</p>'; return; }
    t.innerHTML = `<table class="w-full text-sm">
      <thead><tr class="text-left text-slate-400 border-b border-slate-700">
        <th class="py-2 px-2">Ref</th><th>Pembeli</th><th>Roblox</th><th>WA</th><th>Total</th><th>Status</th><th>Waktu</th><th></th></tr></thead>
      <tbody>${orders.map(o => `<tr class="border-b border-slate-800">
        <td class="py-2 px-2 font-mono text-xs">${o.order_ref}</td>
        <td>${o.customer_name}</td><td>${o.roblox_username}</td><td>${o.whatsapp || '-'}</td>
        <td class="text-cyan-300">${rupiah(o.total_idr)}</td>
        <td><span class="text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status] || ''}">${o.status}</span></td>
        <td class="text-xs text-slate-500">${(o.created_at || '').replace('T', ' ').slice(0, 16)}</td>
        <td>${o.status === 'PAID' ? `<button class="deliver-btn text-xs bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded" data-ref="${o.order_ref}">Tandai Kirim</button>` : ''}</td>
      </tr>`).join('')}</tbody></table>`;
    t.querySelectorAll('.deliver-btn').forEach(b => b.onclick = async () => {
      await api('/api/admin/orders/' + b.dataset.ref + '/deliver', { method: 'POST' });
      loadOrders();
    });
  }

  async function loadProducts() {
    const [pr, cr] = await Promise.all([api('/api/admin/products'), fetch('/api/categories')]);
    if (pr.status === 401) { logout(); return; }
    const { products } = await pr.json();
    categories = (await cr.json()).categories || [];
    const t = document.getElementById('products-table');
    t.innerHTML = `<table class="w-full text-sm">
      <thead><tr class="text-left text-slate-400 border-b border-slate-700">
        <th class="py-2 px-2">SKU</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Rarity</th><th>Stok</th><th>Aktif</th><th></th></tr></thead>
      <tbody>${products.map(p => `<tr class="border-b border-slate-800">
        <td class="py-2 px-2 font-mono text-xs">${p.sku}</td><td>${p.name}</td><td class="text-xs">${p.category_name || '-'}</td>
        <td class="text-cyan-300">${rupiah(p.price_idr)}</td><td class="text-xs">${p.rarity || '-'}</td><td>${p.stock}</td>
        <td>${p.is_active ? '✅' : '❌'}</td>
        <td class="text-right whitespace-nowrap">
          <button class="edit-btn text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded" data-id="${p.id}">Edit</button>
          <button class="del-btn text-xs bg-red-700/70 hover:bg-red-600 px-2 py-1 rounded ml-1" data-id="${p.id}">Hapus</button>
        </td></tr>`).join('')}</tbody></table>`;
    window._products = products;
    t.querySelectorAll('.edit-btn').forEach(b => b.onclick = () => openModal(products.find(x => x.id == b.dataset.id)));
    t.querySelectorAll('.del-btn').forEach(b => b.onclick = async () => {
      if (!confirm('Nonaktifkan produk ini?')) return;
      await api('/api/admin/products/' + b.dataset.id, { method: 'DELETE' });
      loadProducts();
    });
  }

  function catOptions(sel) {
    return categories.map(c => `<option value="${c.id}" ${sel == c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  }

  function openModal(p) {
    const m = document.getElementById('product-modal');
    const f = document.getElementById('product-form');
    document.getElementById('modal-title').textContent = p ? 'Edit Produk' : 'Tambah Produk';
    document.getElementById('modal-category').innerHTML = '<option value="">- pilih -</option>' + catOptions(p?.category_id);
    f.id.value = p?.id || '';
    f.sku.value = p?.sku || '';
    f.sku.readOnly = !!p;
    f.name.value = p?.name || '';
    f.description.value = p?.description || '';
    f.price_idr.value = p?.price_idr || '';
    f.rarity.value = p?.rarity || '';
    f.stock.value = p?.stock ?? 999;
    f.image_url.value = p?.image_url || '';
    f.promo_text.value = p?.promo_text || '';
    f.is_active.checked = p ? !!p.is_active : true;
    f.is_featured.checked = p ? !!p.is_featured : false;
    m.classList.remove('hidden'); m.classList.add('flex');
  }
  function closeModal() {
    const m = document.getElementById('product-modal');
    m.classList.add('hidden'); m.classList.remove('flex');
  }

  function showPanel() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    loadOrders();
  }
  function logout() { sessionStorage.removeItem('ma_admin_token'); location.reload(); }

  document.getElementById('admin-login-btn').onclick = async () => {
    token = document.getElementById('admin-token').value.trim();
    const res = await api('/api/admin/orders');
    if (res.ok) { sessionStorage.setItem('ma_admin_token', token); showPanel(); }
    else alert('Token salah.');
  };

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.admin-tab').forEach(x => { x.classList.remove('border-cyan-400', 'text-cyan-300'); x.classList.add('border-transparent', 'text-slate-400'); });
    t.classList.add('border-cyan-400', 'text-cyan-300'); t.classList.remove('border-transparent', 'text-slate-400');
    const tab = t.dataset.tab;
    document.getElementById('tab-orders').classList.toggle('hidden', tab !== 'orders');
    document.getElementById('tab-products').classList.toggle('hidden', tab !== 'products');
    if (tab === 'products') loadProducts(); else loadOrders();
  });

  document.getElementById('add-product-btn').onclick = () => openModal(null);
  document.getElementById('modal-cancel').onclick = closeModal;
  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      id: f.id.value || undefined, sku: f.sku.value, name: f.name.value, description: f.description.value,
      category_id: f.category_id.value ? Number(f.category_id.value) : null, price_idr: Number(f.price_idr.value),
      rarity: f.rarity.value || null, stock: Number(f.stock.value), image_url: f.image_url.value || null,
      promo_text: f.promo_text.value || null, is_active: f.is_active.checked ? 1 : 0, is_featured: f.is_featured.checked ? 1 : 0
    };
    await api('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
    closeModal(); loadProducts();
  });

  if (token) {
    api('/api/admin/orders').then(r => { if (r.ok) showPanel(); });
  }
})();
