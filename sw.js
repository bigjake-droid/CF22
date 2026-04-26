const CACHE_NAME = 'caseforge-v1';
const ASSETS_TO_CACHE = [
  '/CF22/',
  '/CF22/index.html',
  // Add any CSS, JS, or image files you have here
  '/CF22/icon-192.png',
  '/CF22/icon-512.png'
];

// Install event: Caches the assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch event: Serves cached assets when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return the cached file if found, otherwise fetch from the network
      return response || fetch(event.request);
    })
  );
});
