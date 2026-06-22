(function () {
  const ref = document.querySelector('[data-order-ref]').dataset.orderRef;

  function rupiah(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }

  const STATUS_MAP = {
    PENDING: { icon: 'fa-clock', color: 'text-amber-400', label: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran kamu.' },
    PAID: { icon: 'fa-check-circle', color: 'text-green-400', label: 'Pembayaran Berhasil', desc: 'Pesanan sedang diproses. Item akan dikirim ke akun Roblox kamu.' },
    DELIVERED: { icon: 'fa-box-check', color: 'text-cyan-400', label: 'Selesai Dikirim', desc: 'Item sudah dikirim. Terima kasih sudah belanja!' },
    EXPIRED: { icon: 'fa-hourglass-end', color: 'text-slate-400', label: 'Kedaluwarsa', desc: 'Waktu pembayaran habis.' },
    FAILED: { icon: 'fa-times-circle', color: 'text-red-400', label: 'Gagal', desc: 'Pembayaran gagal atau dibatalkan.' }
  };

  async function load() {
    const box = document.getElementById('status-content');
    try {
      const res = await fetch('/api/orders/' + encodeURIComponent(ref));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order tidak ditemukan');
      const o = data.order;
      const st = STATUS_MAP[o.status] || STATUS_MAP.PENDING;
      const items = (data.items || []).map(i =>
        `<div class="flex justify-between text-sm py-1"><span class="text-slate-300">${i.product_name} x${i.qty}</span><span>${rupiah(i.line_total_idr)}</span></div>`).join('');
      const payBtn = o.status === 'PENDING' && o.payment_url
        ? `<a href="${o.payment_url}" class="inline-block mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2 rounded-xl">Lanjut Bayar</a>` : '';
      box.innerHTML = `
        <i class="fas ${st.icon} text-5xl ${st.color} mb-4"></i>
        <h1 class="text-xl font-bold mb-1">${st.label}</h1>
        <p class="text-slate-400 text-sm mb-4">${st.desc}</p>
        <div class="bg-slate-900 rounded-xl p-4 text-left text-sm space-y-1 mb-2">
          <div class="flex justify-between"><span class="text-slate-400">Order Ref</span><span class="font-mono">${o.order_ref}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Roblox</span><span>${o.roblox_username}</span></div>
          <div class="border-t border-slate-700 my-2"></div>
          ${items}
          <div class="border-t border-slate-700 my-2"></div>
          <div class="flex justify-between font-bold text-cyan-300"><span>Total</span><span>${rupiah(o.total_idr)}</span></div>
        </div>
        ${payBtn}
        <div class="mt-4"><a href="/" class="text-sm text-slate-400 hover:text-cyan-300"><i class="fas fa-home mr-1"></i>Kembali ke toko</a></div>`;

      // auto-refresh kalau masih pending
      if (o.status === 'PENDING') setTimeout(load, 5000);
    } catch (e) {
      box.innerHTML = `<i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3"></i><p>${e.message}</p><a href="/" class="text-cyan-300 underline text-sm">Kembali</a>`;
    }
  }
  load();
})();
