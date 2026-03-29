const CACHE_NAME = 'stetic-app-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/index.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Add core assets first
            return cache.addAll(ASSETS_TO_CACHE).then(() => {
                // Optionally try to cache icons if they exist
                return cache.addAll(['/icon-192.png', '/icon-512.png']).catch(() => {
                    console.warn('PWA Icons not found for caching, bypassing...');
                });
            });
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
