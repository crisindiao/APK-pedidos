const CACHE_NAME = "imaginae-cache-v5";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./app.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Estratégia: tenta o cache primeiro; se não tiver, busca na rede e guarda
// a resposta pra próxima vez (isso inclui React, Tailwind e o SDK do Firebase).
// Assim, depois da primeira abertura com internet, o app funciona 100% offline.
// Exceção: chamadas ao vivo de login/banco de dados (Firebase) NUNCA são
// cacheadas, porque precisam sempre ir na rede pra sincronizar de verdade.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname.includes("googleapis.com") || url.hostname.includes("google.com")) {
    return; // deixa passar direto pra rede, sem interceptar
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy).catch(() => {});
          });
          return response;
        })
        .catch(() => cached);
    })
  );
});

