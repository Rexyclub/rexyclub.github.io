/* Rexy offline shell — corrected cache v2 */
const CACHE_NAME = "rexy-shell-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("rexy-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Never cache account, progress, entitlement, AI, or other Supabase traffic.
  if (url.hostname.endsWith("supabase.co") || url.pathname.includes("/auth/") || url.pathname.includes("/rest/v1/") || url.pathname.includes("/functions/v1/")) return;

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) await cache.put(req, res.clone());
        return res;
      } catch (err) { return Response.error(); }
    })());
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const fresh = await fetch(req);
        if (fresh.ok) await cache.put("./index.html", fresh.clone());
        return fresh;
      } catch (err) {
        return (await cache.match(req)) || (await cache.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok && ["style", "script", "image", "font"].includes(req.destination)) await cache.put(req, res.clone());
        return res;
      } catch (err) { return Response.error(); }
    })());
  }
});
