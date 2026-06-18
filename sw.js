const C = 'anzhu-v6';
const FILES = ['.', 'index.html', 'manifest.json', 'icon.png'];
self.addEventListener('install', e => {
  self.skipWaiting(); // 新版本立即接管，不再需要"重开两次"
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
  ]));
});
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // 页面本体：优先拿网络上的最新版，断网才用缓存 → 以后更新立即生效
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(C).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('.')))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
