const CACHE_NAME = "image-cache-v1";

const imagesPath = "storage.yandexcloud.net";

const isImageRequest = (url) => {
  return url.includes(imagesPath);
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (isImageRequest(request.url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());

            return networkResponse;
          });
        });
      })
    );
  }
});
