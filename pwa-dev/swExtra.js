self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_URLS2') {
      event.waitUntil(
          caches.open('jobTest2')
              .then( (cache) => {
                  return cache.addAll(event.data.payload);
              })
      );
  }
});
