import http from 'k6/http';
import { check, sleep } from 'k6';

// ============================================================
// AYARLAR — kendi ortamına göre değiştir
// ============================================================
const BASE_URL = 'http://localhost:5115/api'; // API'nin gerçek adresi (HTTP, port 5115)
const INSECURE_SKIP_TLS_VERIFY = true; // self-signed sertifika için (local dev ortamı, HTTP'de etkisiz ama zararsız)

// ============================================================
// k6 OPTIONS — iki test modu var, hangisini çalıştıracağını
// terminalden -e TEST_TYPE=spike veya -e TEST_TYPE=ramping ile seçersin
// Hiçbir şey belirtmezsen varsayılan: ramping (kademeli, normal yük testi)
// ============================================================
const TEST_TYPE = __ENV.TEST_TYPE || 'ramping';

const scenarios = {
  ramping: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 200 },
      { duration: '1m30s', target: 200 },
      { duration: '30s', target: 0 },
    ],
  },
    spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 100 },    // yavaş ısınma
      { duration: '1m30s', target: 200 }, // çok kademeli 200'e
      { duration: '1m30s', target: 350 }, // çok kademeli 350'ye
      { duration: '1m', target: 350 },    // 350'de sabit kal
      { duration: '30s', target: 0 },     // kapanış
    ],
  },
};

export const options = {
  insecureSkipTLSVerify: INSECURE_SKIP_TLS_VERIFY,
  scenarios: {
    gercek_kullanici_senaryosu: scenarios[TEST_TYPE],
  },
  thresholds: {
    // Spike testte eşikleri biraz daha gevşek tutuyoruz çünkü ani yükte
    // gecikme artması beklenen bir durum, asıl önemli olan hata oranı
    http_req_duration: TEST_TYPE === 'spike' ? ['p(95)<5000'] : ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],    // hata oranı %5'ten az olmalı
  },
};

// ============================================================
// YARDIMCI FONKSİYONLAR
// ============================================================
function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// HER VIRTUAL USER İÇİN ÇALIŞAN SENARYO
// ============================================================
export default function () {
  // Her VU + iterasyon için benzersiz kullanıcı bilgisi üret
  const uniqueId = `${__VU}_${__ITER}_${randomString(5)}`;
  const username = `loadtest_${uniqueId}`;
  const email = `loadtest_${uniqueId}@test.com`;
  const password = 'Test1234!';

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // ----------------------------------------------------------
  // 1) REGISTER
  // ----------------------------------------------------------
  const registerPayload = JSON.stringify({
    AdSoyad: `Load Test ${uniqueId}`,
    UserName: username,
    Email: email,
    Password: password,
    ConfirmPassword: password,
  });

  const registerRes = http.post(`${BASE_URL}/account/register`, registerPayload, params);

  const registerOk = check(registerRes, {
    'register: status 200': (r) => r.status === 200,
  });

  if (!registerOk) {
    console.error(`Register başarısız: status=${registerRes.status} body=${registerRes.body}`);
  }

  sleep(1); // gerçek kullanıcı gibi biraz bekle

  // ----------------------------------------------------------
  // 2) LOGIN — cookie jar otomatik olarak jwt cookie'sini tutacak
  // ----------------------------------------------------------
  const loginPayload = JSON.stringify({
    UserName: username,
    Password: password,
  });

  const loginRes = http.post(`${BASE_URL}/account/login`, loginPayload, params);

  const loginOk = check(loginRes, {
    'login: status 200': (r) => r.status === 200,
  });

  if (!loginOk) {
    console.error(`Login başarısız: ${loginRes.status} - ${loginRes.body}`);
    return; // login olmadan devam etmenin anlamı yok
  }

  sleep(1);

  // ----------------------------------------------------------
  // 3) ÜRÜN LİSTESİ ÇEK
  // ----------------------------------------------------------
  const productsRes = http.get(`${BASE_URL}/products`);

  const productsOk = check(productsRes, {
    'products: status 200': (r) => r.status === 200,
    'products: liste dolu': (r) => {
      try {
        return JSON.parse(r.body).length > 0;
      } catch {
        return false;
      }
    },
  });

  if (!productsOk) {
    console.error('Ürün listesi alınamadı veya boş, senaryo durduruluyor.');
    return;
  }

  const products = JSON.parse(productsRes.body);
  const randomProduct = pickRandom(products);

  sleep(1);

  // ----------------------------------------------------------
  // 4) ÜRÜN DETAYI ÇEK (beden/stok bilgisi için)
  // ----------------------------------------------------------
  const detailRes = http.get(`${BASE_URL}/products/${randomProduct.id}`);

  const detailOk = check(detailRes, {
    'product detail: status 200': (r) => r.status === 200,
  });

  if (!detailOk) {
    console.error(`Ürün detayı alınamadı: id=${randomProduct.id}`);
    return;
  }

  const productDetail = JSON.parse(detailRes.body);

  // Stoğu olan bir beden bul (varsa)
  let selectedSize = null;
  if (productDetail.sizes && productDetail.sizes.length > 0) {
    const inStock = productDetail.sizes.filter((s) => s.stock > 0);
    if (inStock.length > 0) {
      selectedSize = pickRandom(inStock).size;
    }
  }

  sleep(1);

  // ----------------------------------------------------------
  // 5) SEPETE EKLE
  // ----------------------------------------------------------
  let cartUrl = `${BASE_URL}/cart?urunId=${randomProduct.id}&miktar=1`;
  if (selectedSize) {
    cartUrl += `&beden=${selectedSize}`;
  }

  const addCartRes = http.post(cartUrl, null, params);

  const cartOk = check(addCartRes, {
    'add to cart: status 200': (r) => r.status === 200,
  });

  if (!cartOk) {
    console.error(`Sepete ekleme başarısız: ${addCartRes.status} - ${addCartRes.body}`);
    return;
  }

  sleep(2); // checkout'a geçmeden önce kullanıcı biraz düşünür :)

  // ----------------------------------------------------------
  // 6) SİPARİŞ OLUŞTUR (Stripe session başlatır, gerçek ödeme YOK)
  // ----------------------------------------------------------
  const orderPayload = JSON.stringify({
    AdSoyad: `Load Test ${uniqueId}`,
    Telefon: '5551234567',
    Sehir: 'İstanbul',
    AdresSatiri: 'Test Mahallesi Test Sokak No:1',
    PostaKodu: '34000',
    SiparisNotu: 'k6 load test siparişi',
    HizliKargo: false,
    KuponKodu: null,
  });

  const orderRes = http.post(`${BASE_URL}/order/create`, orderPayload, params);

  check(orderRes, {
    'create order: status 200/201': (r) => r.status === 200 || r.status === 201,
  });

  if (orderRes.status !== 200 && orderRes.status !== 201) {
    console.error(`Sipariş oluşturma başarısız: ${orderRes.status} - ${orderRes.body}`);
  }

  sleep(1);
}