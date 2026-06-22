// Shared cart logic (localStorage)
const CART_KEY = 'merchant_adik_cart';

const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('cart:changed'));
  },
  add(product, qty = 1) {
    const items = this.get();
    const ex = items.find(i => i.sku === product.sku);
    if (ex) ex.qty += qty;
    else items.push({ sku: product.sku, name: product.name, price_idr: product.price_idr, image_url: product.image_url, rarity: product.rarity, qty });
    this.save(items);
  },
  setQty(sku, qty) {
    let items = this.get();
    if (qty <= 0) items = items.filter(i => i.sku !== sku);
    else { const it = items.find(i => i.sku === sku); if (it) it.qty = qty; }
    this.save(items);
  },
  remove(sku) { this.save(this.get().filter(i => i.sku !== sku)); },
  clear() { this.save([]); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  total() { return this.get().reduce((s, i) => s + i.price_idr * i.qty, 0); }
};

function rupiah(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
window.Cart = Cart;
window.rupiah = rupiah;
