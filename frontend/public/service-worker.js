importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

if (workbox) {
  console.log("✅ Workbox loaded");

  // Precache build assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache static assets (JS, CSS, fonts, images)
  workbox.routing.registerRoute(
    ({ request }) =>
      ["style", "script", "font", "image"].includes(request.destination),
    new workbox.strategies.CacheFirst({
      cacheName: "static-assets",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30*24*60*60 })
      ]
    })
  );

  // Cache Firestore / API calls
  workbox.routing.registerRoute(
    ({ url }) => url.origin.includes("firestore.googleapis.com"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0,200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5*60 })
      ]
    })
  );

  // Cache navigation (HTML)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    new workbox.strategies.NetworkFirst({
      cacheName: "html-cache",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0,200] })
      ]
    })
  );

  // Offline fallback
  workbox.routing.setCatchHandler(({ event }) => {
    if (event.request.destination === 'document') {
      return caches.match('/offline.html');
    }
    return Response.error();
  });
} else {
  console.log("❌ Workbox failed to load");
}
