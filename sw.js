/* ==========================================================================
   FRONT MISSION 3 BATTLE SKILLS — OFFLINE SERVICE WORKER (GITHUB PAGES PWA)
   ========================================================================== */
const CACHE_NAME = "fm3-battle-skills-v1";

// Relative paths work automatically on both root domains and /repo-name/ subpaths
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./fm3_battle_skills.html",
  "./manifest.json",
  "./sw.js"
];

// 1. INSTALL: Pre-cache core app files for 100% offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use individual add() calls so if you rename the HTML file to index.html,
      // missing filenames won't break the installation.
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          // Ignore optional filename variants that don't exist in your repo
        }
      }
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Clean up older cache versions when you push updates to GitHub
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((oldName) => caches.delete(oldName))
      )
    )
  );
  self.clients.claim();
});

// 3. FETCH: Cache-first with background network refresh (Stale-While-Revalidate)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});