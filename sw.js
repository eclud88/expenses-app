// Service worker: guarda a app no telemóvel para funcionar sem internet.
// Estratégia: responde logo com a cópia guardada e atualiza-a em segundo plano
// (uma nova versão da app aparece na abertura seguinte).
var CACHE = 'despesas-v3';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(e.request, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(e.request).then(function (r) {
          if (r && r.ok) cache.put(e.request, r.clone());
          return r;
        }).catch(function () { return hit; });
        return hit || net;
      });
    })
  );
});
