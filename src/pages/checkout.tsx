import { Header, Footer } from './home'

export const CheckoutPage = () => (
  <>
    <Header />
    <main class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6"><i class="fas fa-receipt mr-2 text-cyan-400"></i>Checkout</h1>
      <div class="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <section class="lg:col-span-3 bg-slate-800/60 rounded-2xl p-6 border border-slate-700">
          <h2 class="font-semibold mb-4 text-cyan-200">Data Pembeli</h2>
          <form id="checkout-form" class="space-y-4">
            <div>
              <label class="block text-sm mb-1 text-slate-300">Nama Lengkap <span class="text-red-400">*</span></label>
              <input name="customer_name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-cyan-400 outline-none" placeholder="Nama kamu" />
            </div>
            <div>
              <label class="block text-sm mb-1 text-slate-300">Username Roblox <span class="text-red-400">*</span></label>
              <input name="roblox_username" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-cyan-400 outline-none" placeholder="Username di game Fish It" />
            </div>
            <div>
              <label class="block text-sm mb-1 text-slate-300">No. WhatsApp <span class="text-red-400">*</span></label>
              <input name="whatsapp" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-cyan-400 outline-none" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label class="block text-sm mb-1 text-slate-300">Email (untuk invoice)</label>
              <input name="email" type="email" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-cyan-400 outline-none" placeholder="opsional" />
            </div>
            <div>
              <label class="block text-sm mb-1 text-slate-300">Catatan</label>
              <textarea name="note" rows={2} class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-cyan-400 outline-none" placeholder="Catatan tambahan (opsional)"></textarea>
            </div>
            <div id="checkout-error" class="hidden text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"></div>
            <button type="submit" id="pay-btn" class="w-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition">
              <i class="fas fa-lock mr-2"></i>Bayar Sekarang
            </button>
            <p class="text-[11px] text-slate-500 text-center">Pembayaran diproses aman oleh Oasis BI Pro via Duitku (QRIS / VA / e-wallet).</p>
          </form>
        </section>

        {/* Ringkasan */}
        <aside class="lg:col-span-2 bg-slate-800/60 rounded-2xl p-6 border border-slate-700 h-fit">
          <h2 class="font-semibold mb-4 text-cyan-200">Ringkasan Order</h2>
          <div id="summary-items" class="space-y-3 mb-4"></div>
          <div class="border-t border-slate-700 pt-4 flex justify-between text-lg">
            <span>Total</span>
            <span id="summary-total" class="font-bold text-cyan-300">Rp 0</span>
          </div>
          <a href="/#katalog" class="block text-center text-sm text-slate-400 hover:text-cyan-300 mt-4"><i class="fas fa-arrow-left mr-1"></i>Tambah item lain</a>
        </aside>
      </div>
    </main>
    <Footer />
    <script src="/static/checkout.js"></script>
  </>
)
