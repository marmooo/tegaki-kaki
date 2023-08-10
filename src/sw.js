const CACHE_NAME = "2023-08-10 12:50";
const urlsToCache = [
  "/tegaki-kaki/",
  "/tegaki-kaki/index.js",
  "/tegaki-kaki/worker.js",
  "/tegaki-kaki/model/model.json",
  "/tegaki-kaki/model/group1-shard1of1.bin",
  "/tegaki-kaki/mp3/correct3.mp3",
  "/tegaki-kaki/mp3/end.mp3",
  "/tegaki-kaki/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.1.6/dist/signature_pad.umd.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
