self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('game-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './main.js',
        './manifest.json',
        './assets/logo.png',
        './assets/icon-192.png',
        './assets/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
