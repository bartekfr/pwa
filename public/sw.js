
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
  		caches.open('static').then(cache => {
		console.log('[SW] Precaching')
		cache.add('/src/js/app.js')
		cache.add('/src/css/feed.css')
  	})
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // console.log('[Service Worker] Fetching something ....', event);
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
  event.respondWith(
  	caches.match(event.request)
  		.then(response => {
  			if (response) {
  				return response;
  			} else {
  				return fetch(event.request)
  			}
  		})
  );
});