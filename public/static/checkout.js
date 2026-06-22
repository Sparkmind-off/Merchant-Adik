(function () {
  const s = document.createElement('script');
  s.src = '/static/cart.js';
  s.onload = init;
  document.head.appendChild(s);

  let duitkuJsLoaded = false;

  // Muat duitku.js (POP lib) secara dinamis sesuai env (sandbox/production)
  function loadDuitkuJs(src) {
    return new Promise((resolve, reject) => {
      if (duitkuJsLoaded || (window.checkout && typeof window.checkout.process === 'function')) {
        duitkuJsLoaded = true; return resolve();
      }
      if (!src) return reject(new Error('Duitku JS URL tidak tersedia'));
      const el = document.createElement('script');
      el.src = src;
      el.onload = () => { duitkuJsLoaded = true; resolve(); };
      el.onerror = () => reject(new Error('Gagal memuat Duitku POP JS'));
      document.head.appendChild(el);
    });
  }

  function renderSummary() {
    const items = Cart.get();
    const box = document.getElementById('summary-items');
    if (!items.length) {
      box.innerHTML = '<p class="text-slate-400 text-sm">Keranjang kosong. <a href="/#katalog" class="text-cyan-300 underline">Belanja dulu</a>.</p>';
    } else {
      box.innerHTML = items.map(i => `
        <div class="flex justify-between text-sm">
          <span class="text-slate-300">${i.name} <span class="text-slate-500">x${i.qty}</span></span>
          <span class="text-slate-200">${rupiah(i.price_idr * i.qty)}</span>
        </div>`).join('');
    }
    document.getElementById('summary-total').textContent = rupiah(Cart.total());
    const cc = document.getElementById('cart-count');
    if (cc) cc.textContent = Cart.count();
  }

  function setBtn(disabled, html) {
    const btn = document.getElementById('pay-btn');
    btn.disabled = disabled;
    btn.innerHTML = html;
  }

  function showError(msg) {
    const errBox = document.getElementById('checkout-error');
    errBox.textContent = msg;
    errBox.classList.remove('hidden');
  }

  // Jalankan Duitku POP popup dengan reference
  function runDuitkuPop(reference, orderRef) {
    if (!(window.checkout && typeof window.checkout.process === 'function')) {
      // fallback: redirect ke paymentUrl jika POP tidak siap
      location.href = '/status/' + orderRef;
      return;
    }
    window.checkout.process(reference, {
      defaultLanguage: 'id',
      successEvent: function () {
        location.href = '/status/' + orderRef + '?pay=success';
      },
      pendingEvent: function () {
        location.href = '/status/' + orderRef + '?pay=pending';
      },
      errorEvent: function () {
        showError('Pembayaran gagal / error. Silakan coba lagi.');
        setBtn(false, '<i class="fas fa-lock mr-2"></i>Bayar Sekarang');
      },
      closeEvent: function () {
        // user menutup popup tanpa membayar — arahkan ke status (masih PENDING)
        location.href = '/status/' + orderRef;
      }
    });
  }

  function init() {
    renderSummary();
    const cb = document.getElementById('cart-btn');
    if (cb) cb.onclick = () => location.href = '/#katalog';

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const items = Cart.get();
      const errBox = document.getElementById('checkout-error');
      errBox.classList.add('hidden');
      if (!items.length) { showError('Keranjang masih kosong.'); return; }

      const fd = new FormData(e.target);
      const payload = {
        customer_name: fd.get('customer_name'),
        roblox_username: fd.get('roblox_username'),
        whatsapp: fd.get('whatsapp'),
        email: fd.get('email'),
        note: fd.get('note'),
        items: items.map(i => ({ sku: i.sku, qty: i.qty }))
      };

      setBtn(true, '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...');
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Checkout gagal');

        Cart.clear();

        // MODE 1: Duitku POP (popup) — kredensial production aktif
        if (data.pop_enabled && data.reference && data.duitku_js) {
          setBtn(true, '<i class="fas fa-spinner fa-spin mr-2"></i>Membuka pembayaran...');
          try {
            await loadDuitkuJs(data.duitku_js);
            runDuitkuPop(data.reference, data.order_ref);
            return;
          } catch (popErr) {
            // Jika POP gagal dimuat, fallback ke redirect paymentUrl
            if (data.payment_url) { location.href = data.payment_url; return; }
            throw popErr;
          }
        }

        // MODE 2: Stub / redirect (dev mode atau fallback)
        if (data.payment_url) {
          location.href = data.payment_url;
        } else {
          location.href = '/status/' + data.order_ref;
        }
      } catch (err) {
        showError(err.message);
        setBtn(false, '<i class="fas fa-lock mr-2"></i>Bayar Sekarang');
      }
    });
  }
})();
