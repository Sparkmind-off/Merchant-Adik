// Home / katalog page logic. Depends on cart.js (loaded inline below).
(function () {
  // load cart.js dynamically to keep order
  const s = document.createElement('script');
  s.src = '/static/cart.js';
  s.onload = init;
  document.head.appendChild(s);

  let allProducts = [];
  let categories = [];
  let activeCat = 'all';

  function rarityClass(r) {
    if (!r) return '';
    if (/legendary/i.test(r)) return 'rarity-legendary';
    return 'rarity-secret';
  }

  function productCard(p) {
    const img = p.image_url
      ? `<img src="${p.image_url}" alt="${p.name}" class="product-img w-full h-32 sm:h-40 rounded-xl mb-3" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="w-full h-32 sm:h-40 rounded-xl mb-3 bg-slate-700 hidden items-center justify-center text-4xl">🐟</div>`
      : `<div class="w-full h-32 sm:h-40 rounded-xl mb-3 bg-slate-700 flex items-center justify-center text-4xl">🐟</div>`;
    const rarity = p.rarity ? `<span class="rarity ${rarityClass(p.rarity)} absolute top-2 left-2">${p.rarity}</span>` : '';
    const promo = p.promo_text ? `<span class="absolute top-2 right-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">${p.promo_text}</span>` : '';
    return `<article class="product-card relative bg-slate-800/60 border border-slate-700 rounded-2xl p-3 flex flex-col">
      <div class="relative">${img}${rarity}${promo}</div>
      <h3 class="font-semibold text-sm leading-tight mb-1 line-clamp-2">${p.name}</h3>
      <p class="text-[11px] text-slate-400 mb-2">${p.category_name || ''}</p>
      <div class="mt-auto flex items-center justify-between gap-2">
        <span class="font-bold text-cyan-300 text-sm">${rupiah(p.price_idr)}</span>
        <button class="add-btn bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg" data-sku="${p.sku}">
          <i class="fas fa-cart-plus"></i>
        </button>
      </div>
    </article>`;
  }

  function renderGrid() {
    const grid = document.getElementById('product-grid');
    const list = activeCat === 'all' ? allProducts : allProducts.filter(p => p.category_slug === activeCat);
    if (!list.length) { grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Tidak ada produk.</div>'; return; }
    grid.innerHTML = list.map(productCard).join('');
    grid.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = allProducts.find(x => x.sku === btn.dataset.sku);
        Cart.add(p, 1);
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = '<i class="fas fa-cart-plus"></i>', 800);
        openCart();
      });
    });
  }

  function renderCats() {
    const wrap = document.getElementById('category-filter');
    const chips = [{ slug: 'all', name: 'Semua', icon: 'fa-border-all' }, ...categories];
    wrap.innerHTML = chips.map(c =>
      `<button class="cat-chip ${c.slug === activeCat ? 'active' : ''} bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-sm hover:border-cyan-400 transition" data-slug="${c.slug}">
        <i class="fas ${c.icon || 'fa-tag'} mr-1 opacity-70"></i>${c.name}
      </button>`).join('');
    wrap.querySelectorAll('.cat-chip').forEach(b => b.addEventListener('click', () => {
      activeCat = b.dataset.slug; renderCats(); renderGrid();
    }));
  }

  // Cart drawer
  function renderCart() {
    const items = Cart.get();
    const box = document.getElementById('cart-items');
    if (!items.length) { box.innerHTML = '<p class="text-slate-400 text-center py-10">Keranjang kosong 🐚</p>'; }
    else {
      box.innerHTML = items.map(i => `
        <div class="flex gap-3 bg-slate-800/60 rounded-xl p-2 border border-slate-700">
          <div class="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden">
            ${i.image_url ? `<img src="${i.image_url}" class="w-full h-full object-cover" onerror="this.replaceWith(document.createTextNode('🐟'))">` : '🐟'}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">${i.name}</p>
            <p class="text-xs text-cyan-300">${rupiah(i.price_idr)}</p>
            <div class="flex items-center gap-2 mt-1">
              <button class="qty-dec w-6 h-6 bg-slate-700 rounded" data-sku="${i.sku}">-</button>
              <span class="text-sm w-6 text-center">${i.qty}</span>
              <button class="qty-inc w-6 h-6 bg-slate-700 rounded" data-sku="${i.sku}">+</button>
              <button class="rm ml-auto text-red-400 text-xs" data-sku="${i.sku}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>`).join('');
    }
    document.getElementById('cart-total').textContent = rupiah(Cart.total());
    document.getElementById('cart-count').textContent = Cart.count();
    box.querySelectorAll('.qty-inc').forEach(b => b.onclick = () => { const it = Cart.get().find(x => x.sku === b.dataset.sku); Cart.setQty(b.dataset.sku, it.qty + 1); });
    box.querySelectorAll('.qty-dec').forEach(b => b.onclick = () => { const it = Cart.get().find(x => x.sku === b.dataset.sku); Cart.setQty(b.dataset.sku, it.qty - 1); });
    box.querySelectorAll('.rm').forEach(b => b.onclick = () => Cart.remove(b.dataset.sku));
  }

  function openCart() {
    document.getElementById('cart-drawer').classList.remove('translate-x-full');
    document.getElementById('cart-overlay').classList.remove('hidden');
  }
  function closeCart() {
    document.getElementById('cart-drawer').classList.add('translate-x-full');
    document.getElementById('cart-overlay').classList.add('hidden');
  }

  async function init() {
    document.getElementById('cart-count').textContent = Cart.count();
    document.getElementById('cart-btn').onclick = () => { renderCart(); openCart(); };
    document.getElementById('cart-close').onclick = closeCart;
    document.getElementById('cart-overlay').onclick = closeCart;
    document.addEventListener('cart:changed', renderCart);

    try {
      const [pr, cr] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json())
      ]);
      allProducts = pr.products || [];
      categories = cr.categories || [];
      renderCats();
      renderGrid();
    } catch (e) {
      document.getElementById('product-grid').innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Gagal memuat produk.</div>';
    }
  }
})();
