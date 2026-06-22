// ============================================================================
// Duitku POP integration (Merchant-of-Record: Oasis BI Pro)
// Doctrine: SPARKMIND-OBP-HYBRID v2.0 — Duitku primary PG, routed via OBP MoR.
//
// Menggunakan Duitku POP API terbaru:
//   - createInvoice endpoint (header auth: x-duitku-signature/timestamp/merchantcode)
//   - signature header   = HMAC_SHA256(merchantCode + timestamp, apiKey)  [hex]
//   - signature callback = HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey) [hex]
//   - Frontend pakai duitku.js -> checkout.process(reference, {...}) (popup)
//
// 100% Web Crypto API (kompatibel Cloudflare Workers — TANPA Node 'crypto').
// Docs: https://docs.duitku.com/pop/en/
// ============================================================================

// Duitku POP endpoints
const SANDBOX_BASE = 'https://api-sandbox.duitku.com/api/merchant';
const PROD_BASE = 'https://api-prod.duitku.com/api/merchant';

// Duitku JS (POP) lib — dipakai di frontend
export const DUITKU_JS_SANDBOX = 'https://app-sandbox.duitku.com/lib/js/duitku.js';
export const DUITKU_JS_PROD = 'https://app-prod.duitku.com/lib/js/duitku.js';

export type DuitkuConfig = {
  merchantCode: string;
  apiKey: string;
  env: string; // 'sandbox' | 'production'
  callbackUrl: string;
  returnUrl: string;
};

type Bindings_DuitkuLike = {
  DUITKU_MERCHANT_CODE?: string;
  DUITKU_API_KEY?: string;
  DUITKU_ENV?: string;
  DUITKU_CALLBACK_URL?: string;
  DUITKU_RETURN_URL?: string;
};

export function getDuitkuConfig(env: Bindings_DuitkuLike): DuitkuConfig {
  return {
    merchantCode: env.DUITKU_MERCHANT_CODE || 'DXXXXX',
    apiKey: env.DUITKU_API_KEY || 'SANDBOX_API_KEY',
    env: env.DUITKU_ENV || 'sandbox',
    callbackUrl: env.DUITKU_CALLBACK_URL || '',
    returnUrl: env.DUITKU_RETURN_URL || ''
  };
}

function baseUrl(cfg: DuitkuConfig) {
  return cfg.env === 'production' ? PROD_BASE : SANDBOX_BASE;
}

export function duitkuJsUrl(cfg: DuitkuConfig) {
  return cfg.env === 'production' ? DUITKU_JS_PROD : DUITKU_JS_SANDBOX;
}

// Apakah kredensial sudah diisi (bukan placeholder)?
export function isConfigured(cfg: DuitkuConfig): boolean {
  return !!cfg.merchantCode && cfg.merchantCode !== 'DXXXXX' &&
         !!cfg.apiKey && cfg.apiKey !== 'SANDBOX_API_KEY';
}

// ---------- HMAC-SHA256 via Web Crypto (hex lowercase) ----------
function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export async function hmacSha256Hex(message: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return bufToHex(sig);
}

export type ItemDetail = {
  name: string;
  price: number;
  quantity: number;
};

export type CreateInvoiceParams = {
  merchantOrderId: string;
  paymentAmount: number;
  productDetails: string;
  customerName: string;
  email: string;
  phoneNumber?: string;
  paymentMethod?: string; // kosong = tampilkan semua channel (POP)
  itemDetails?: ItemDetail[];
  expiryMinutes?: number;
};

export type DuitkuInvoiceResult = {
  ok: boolean;
  stub?: boolean;
  reference?: string;
  paymentUrl?: string;
  statusCode?: string;
  statusMessage?: string;
  raw?: any;
};

// createInvoice — Duitku POP (POST /createInvoice, header auth)
export async function createInvoice(cfg: DuitkuConfig, p: CreateInvoiceParams): Promise<DuitkuInvoiceResult> {
  // STUB MODE: kredensial belum diisi -> kembalikan invoice palsu untuk dev/testing
  if (!isConfigured(cfg)) {
    return {
      ok: true,
      stub: true,
      reference: 'STUB-' + p.merchantOrderId,
      paymentUrl: `/pay/stub?order=${encodeURIComponent(p.merchantOrderId)}&amount=${p.paymentAmount}`,
      statusCode: '00',
      statusMessage: 'STUB MODE — kredensial Duitku belum diisi. Isi via wrangler pages secret saat produksi.'
    };
  }

  const timestamp = Date.now().toString(); // UNIX ms
  const stringToSign = cfg.merchantCode + timestamp;
  const signature = await hmacSha256Hex(stringToSign, cfg.apiKey);

  const body: Record<string, any> = {
    paymentAmount: p.paymentAmount,
    merchantOrderId: p.merchantOrderId,
    productDetails: p.productDetails.slice(0, 255),
    additionalParam: '',
    merchantUserInfo: '',
    customerVaName: (p.customerName || 'Customer').slice(0, 20),
    email: p.email,
    phoneNumber: p.phoneNumber || '',
    callbackUrl: cfg.callbackUrl,
    returnUrl: cfg.returnUrl,
    expiryPeriod: p.expiryMinutes && p.expiryMinutes > 0 ? p.expiryMinutes : 60
  };
  if (p.itemDetails && p.itemDetails.length) body.itemDetails = p.itemDetails;
  if (p.paymentMethod) body.paymentMethod = p.paymentMethod;

  try {
    const res = await fetch(baseUrl(cfg) + '/createInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-duitku-signature': signature,
        'x-duitku-timestamp': timestamp,
        'x-duitku-merchantcode': cfg.merchantCode
      },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { statusMessage: text }; }

    return {
      ok: res.ok && data.statusCode === '00',
      reference: data.reference,
      paymentUrl: data.paymentUrl,
      statusCode: data.statusCode,
      statusMessage: data.statusMessage || (res.ok ? undefined : `HTTP ${res.status}`),
      raw: data
    };
  } catch (e: any) {
    return { ok: false, statusMessage: 'Gagal koneksi ke Duitku: ' + (e?.message || e) };
  }
}

// Verifikasi signature webhook callback Duitku POP
// signature callback = HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)
export async function verifyCallbackSignature(
  cfg: DuitkuConfig,
  merchantOrderId: string,
  amount: string,
  receivedSignature: string
): Promise<boolean> {
  const stringToSign = cfg.merchantCode + amount + merchantOrderId;
  const expected = await hmacSha256Hex(stringToSign, cfg.apiKey);
  return expected.toLowerCase() === (receivedSignature || '').toLowerCase();
}
