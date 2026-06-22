import { Header, Footer } from './home'

export const StatusPage = ({ orderRef }: { orderRef: string }) => (
  <>
    <Header />
    <main class="max-w-2xl mx-auto px-4 py-10">
      <div class="bg-slate-800/60 rounded-2xl p-8 border border-slate-700" data-order-ref={orderRef}>
        <div id="status-content" class="text-center">
          <i class="fas fa-spinner fa-spin text-3xl text-cyan-400 mb-4"></i>
          <p class="text-slate-400">Memuat status order...</p>
        </div>
      </div>
    </main>
    <Footer />
    <script src="/static/status.js"></script>
  </>
)
