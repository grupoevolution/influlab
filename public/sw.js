// Service Worker do PWA Influencers Lab.ia.
// Estratégia:
//   - APIs (/api/*) e Next.js data (_next/data): SEMPRE rede, nunca cache.
//   - HTML navegado: network-first com fallback offline.
//   - Assets estáticos (_next/static, /icons, fontes, etc): cache-first.
//
// IMPORTANTE: ao mudar a estratégia, suba CACHE_VERSION para invalidar caches antigos
// nos dispositivos dos usuários (o activate apaga tudo que não bater com o nome atual).

const CACHE_VERSION = 'v4';
const CACHE_NAME = `influlab-${CACHE_VERSION}`;
const PRECACHE_URLS = ['/', '/app', '/login', '/manifest.json', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Mensagem útil pro client forçar atualização ("skip waiting") se um SW novo estiver pendente.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/');
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // 1) APIs e dados Next.js: NUNCA cachear. Vai direto pra rede.
  if (isApiRequest(url)) return; // deixa o fetch padrão acontecer

  // 2) Navegação HTML: network-first, com fallback ao /app offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/app'))),
    );
    return;
  }

  // 3) Assets estáticos: cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        });
      }),
    );
    return;
  }

  // 4) Qualquer outro GET: deixa o navegador resolver normalmente (sem cache do SW).
});

// Notifications (preparado para integração futura)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Influencers Lab.ia', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/app' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/app'));
});
