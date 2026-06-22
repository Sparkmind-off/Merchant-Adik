const DISCLOSURE = 'Bagian dari ekosistem SparkMind. Dioperasikan & diproses pembayarannya oleh Oasis BI Pro.'

export const Header = () => (
  <header id="site-header" class="sticky top-0 z-40 backdrop-blur-lg bg-slate-900/70 border-b border-cyan-500/20">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-2 group">
        <span class="text-2xl">🎣</span>
        <div class="leading-tight">
          <div class="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent">Merchant Adik</div>
          <div class="text-[10px] text-cyan-300/60 uppercase tracking-widest">Kebutuhan Fish It</div>
        </div>
      </a>
      <nav class="flex items-center gap-4 text-sm">
        <a href="/#katalog" class="hidden sm:inline hover:text-cyan-300 transition">Katalog</a>
        <a href="/admin" class="hidden sm:inline text-slate-400 hover:text-cyan-300 transition"><i class="fas fa-user-shield"></i></a>
        <button id="cart-btn" class="relative bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2">
          <i class="fas fa-shopping-cart"></i>
          <span class="hidden sm:inline">Keranjang</span>
          <span id="cart-count" class="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">0</span>
        </button>
      </nav>
    </div>
  </header>
)

export const Footer = () => (
  <footer class="mt-16 border-t border-cyan-500/20 bg-slate-900/60">
    <div class="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-400 space-y-2">
      <p class="text-cyan-200/80 font-semibold">🎣 Merchant Adik — Kebutuhan Fish It (Roblox)</p>
      <p class="text-xs max-w-2xl mx-auto">{DISCLOSURE}</p>
      <p class="text-xs text-slate-500">Layanan pembayaran, settlement &amp; tanggung jawab merchant dijalankan oleh <span class="text-slate-300">Oasis BI Pro</span> selaku Merchant-of-Record (Duitku PJP). Pengolahan data pribadi tunduk UU No. 27/2022. DPO: dpo@oasis-bi-pro.web.id</p>
      <p class="text-[11px] text-slate-600 pt-2">© 2026 SparkMind Ecosystem. Bukan afiliasi resmi Roblox / Fish It.</p>
    </div>
  </footer>
)

export const HomePage = () => (
  <>
    <Header />

    {/* Hero */}
    <section id="hero-section" class="relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-4 pt-12 pb-10 text-center relative z-10">
        <span class="inline-block bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-xs px-3 py-1 rounded-full mb-4 tracking-wide">
          <i class="fas fa-water mr-1"></i> Marketplace #1 Kebutuhan Fish It
        </span>
        <h1 class="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
          Ikan <span class="text-cyan-300">Secret</span>, Enchant, Tumbal &amp; Gems
          <br class="hidden sm:block" /> Langsung Masuk Akun 🐠
        </h1>
        <p class="text-slate-300 max-w-2xl mx-auto mb-6">
          Beli kebutuhan game <strong>Fish It</strong> (Roblox) dengan harga terjangkau. Bayar via QRIS, Virtual Account, &amp; e-wallet — diproses aman oleh Oasis BI Pro.
        </p>
        <a href="#katalog" class="inline-block bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 font-bold px-8 py-3 rounded-xl hover:scale-105 transition">
          <i class="fas fa-fish mr-2"></i> Lihat Katalog
        </a>
      </div>
      <div class="bubble-field" aria-hidden="true"></div>
    </section>

    {/* Filter kategori */}
    <section id="katalog" class="max-w-6xl mx-auto px-4">
      <div id="category-filter" class="flex flex-wrap gap-2 mb-6 justify-center"></div>
      <div id="product-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="col-span-full text-center py-12 text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat produk...</div>
      </div>
    </section>

    <Footer />

    {/* Cart Drawer */}
    <div id="cart-overlay" class="fixed inset-0 bg-black/60 z-50 hidden"></div>
    <aside id="cart-drawer" class="fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900 border-l border-cyan-500/30 z-50 transform translate-x-full transition-transform duration-300 flex flex-col">
      <div class="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 class="font-bold text-lg"><i class="fas fa-shopping-cart mr-2 text-cyan-400"></i>Keranjang</h2>
        <button id="cart-close" class="text-slate-400 hover:text-white text-xl"><i class="fas fa-times"></i></button>
      </div>
      <div id="cart-items" class="flex-1 overflow-y-auto p-4 space-y-3"></div>
      <div class="p-4 border-t border-slate-700">
        <div class="flex justify-between mb-3 text-lg">
          <span>Total</span>
          <span id="cart-total" class="font-bold text-cyan-300">Rp 0</span>
        </div>
        <a id="checkout-link" href="/checkout" class="block text-center bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition">
          Lanjut Checkout <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>
    </aside>

    <script src="/static/app.js"></script>
  </>
)
