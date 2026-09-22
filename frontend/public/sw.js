const CACHE_NAME = "image-cache-v2";

const imagesPath = "storage.yandexcloud.net";

const isImageRequest = (url) => {
  return url.includes(imagesPath);
};

self.addEventListener("install", () => {
  self.skipWaiting();
});

// Удаляем старые кэши: в image-cache-v1 могли попасть ответы с ошибками.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method === "GET" && isImageRequest(request.url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Кэшируем только успешные ответы, иначе ошибка закрепится навсегда.
          if (!networkResponse.ok) {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());

            return networkResponse;
          });
        });
      })
    );
  }
});
