// Clean-up service worker. This address used to host the score-tracker app,
// whose offline service worker kept serving the cached app instead of these
// docs. Browsers re-fetch /sw.js to check for updates; this version deletes
// the old caches, unregisters itself, and reloads open tabs.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
