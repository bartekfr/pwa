
const cacheVersion = '4'
const staticCacheName = `static-${cacheVersion}`
const dynamicCacheName  = `dynamic-${cacheVersion}`

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
      })
  )
})

const cacheUpdate = async () => {
  const cacheKeys = await caches.keys()

  return Promise.all(
    cacheKeys.map(cacheKey => {
      if (cacheKey !== staticCacheName && cacheKey !== dynamicCacheName) {
        console.log(`Deleteing ${cacheKey}`)
        return caches.delete(cacheKey)
      }
    }
   )
 )
}

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...', event);
  event.waitUntil(cacheUpdate())
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
            .then(res => {
              return caches.open(dynamicCacheName)
                .then(cache => {
                  console.log('Dynamic caching in action')
                  cache.put(event.request.url, res.clone())
                  return res
                })
            })
            .catch(err => {
              console.log('sw fetch error', err)
            })
        }
      })
  );
});
