// Yaplus — service worker
// Les données vivent dans IndexedDB ; ici on garde seulement l'app elle-même
// pour qu'elle s'ouvre sans réseau.
const VERSION = "yaplus-v4";
const SHELL = ["/", "/decouvrir", "/categorie", "/a-racheter", "/historique", "/boutique", "/connexion", "/bienvenue", "/rejoindre", "/manifest.webmanifest", "/icon-192.png", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Fichiers versionnés de Next : le cache d'abord, ils ne changent jamais.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Pages et le reste : le réseau d'abord, le cache si on est hors-ligne.
  event.respondWith(
    fetch(request)
      .then((res) => {
        // Les réponses marquées no-store (panneau admin) ne restent jamais sur l'appareil.
        if (res.ok && !res.headers.get("cache-control")?.includes("no-store")) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches
          .match(request, { ignoreSearch: request.mode === "navigate" })
          .then((hit) => hit || (request.mode === "navigate" ? caches.match("/") : Response.error())),
      ),
  );
});
