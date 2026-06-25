// sw.js — Service Worker Atelier Vocabulaire
// Version mise à jour pour forcer le renouvellement du cache
// et éviter les anciennes réponses contenant les pseudo-exemples.

const CACHE_NAME = "atelier-vocab-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn("Certains assets non mis en cache :", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function networkFirst(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
}

function cacheFirst(event) {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
}

self.addEventListener("fetch", event => {
  const url = event.request.url;
  const request = event.request;

  // Toujours chercher la dernière version pour les navigations HTML.
  if (request.mode === "navigate" || url.endsWith("/index.html")) {
    networkFirst(event);
    return;
  }

  // Données vocabulaire / figures : réseau d'abord, cache seulement en secours.
  if (
    url.includes("gist.githubusercontent.com") ||
    url.includes("raw.githubusercontent.com")
  ) {
    networkFirst(event);
    return;
  }

  // Assets statiques : cache d'abord.
  cacheFirst(event);
});
