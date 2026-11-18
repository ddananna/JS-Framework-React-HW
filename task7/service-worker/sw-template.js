// Service worker template. vite.config.js replaces __CACHE_VERSION__ and __PRECACHE_URLS__.
//
// Lifecycle
//   install   -> precaches the app shell (JS, CSS, HTML, icons, manifest, offline page)
//   activate  -> deletes caches from older versions
//   update    -> a new version waits until the user clicks "Update now" (SKIP_WAITING)
//
// Runtime strategies
//   page navigations -> network-first. Visited pages are stored and served offline.
//                       Unvisited pages fall back to offline.html.
//   /api/ requests   -> network-first, falls back to cache (max 40 entries, 7 days).
//   images and fonts -> cache-first (max 80 entries, 30 days).
//   other origins    -> not touched (Firebase, Google sign-in).
//   requests with an Authorization header are never cached.

const VERSION = '__CACHE_VERSION__';
const PRECACHE_PATHS = __PRECACHE_URLS__;

const PREFIX = 'task7-';
const SHELL_CACHE = `${PREFIX}shell-${VERSION}`;
const PAGES_CACHE = `${PREFIX}pages-${VERSION}`;
const STATIC_CACHE = `${PREFIX}static-${VERSION}`;
const API_CACHE = `${PREFIX}api-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, STATIC_CACHE, API_CACHE];

const DAY = 24 * 60 * 60 * 1000;
const LIMITS = {
  pages: { maxEntries: 30 },
  static: { maxEntries: 80, maxAgeMs: 30 * DAY },
  api: { maxEntries: 40, maxAgeMs: 7 * DAY },
};

const CACHED_AT_HEADER = 'sw-cached-at';
const SERVED_FROM_HEADER = 'X-Served-From';

const scopeUrl = (path) => new URL(path, self.registration.scope).href;
const scopePath = () => new URL(self.registration.scope).pathname;

// ---------- lifecycle ----------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(PRECACHE_PATHS.map((path) => new Request(scopeUrl(path), { cache: 'reload' })))
    )
  );
  // No skipWaiting() here: the new version waits until the user accepts the update.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(PREFIX) && !CURRENT_CACHES.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ---------- fetch routing ----------

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request, url));
    return;
  }

  if (url.pathname.startsWith(new URL('api/', self.registration.scope).pathname)) {
    event.respondWith(handleApi(request));
    return;
  }

  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(handleStatic(request));
  }
});

// ---------- strategies ----------

async function handleNavigation(request, url) {
  const pages = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) storeResponse(pages, request, response, LIMITS.pages);
    return response;
  } catch {
    const visited = await pages.match(request);
    if (visited) return visited;

    // The app root is always part of the shell, even if this exact URL was never visited.
    if (url.pathname === scopePath()) {
      const shell = await caches.match(scopeUrl('index.html'));
      if (shell) return shell;
    }

    return offlinePage();
  }
}

async function handleApi(request) {
  const cache = await caches.open(API_CACHE);
  const isPrivate = request.headers.has('authorization');
  try {
    const response = await fetch(request);
    if (response.ok && !isPrivate) storeResponse(cache, request, response, LIMITS.api);
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached && !isExpired(cached, LIMITS.api.maxAgeMs)) return markFromCache(cached);
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleStatic(request) {
  const cached = await caches.match(request);
  if (cached && !isExpired(cached, LIMITS.static.maxAgeMs)) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) storeResponse(await caches.open(STATIC_CACHE), request, response, LIMITS.static);
    return response;
  } catch {
    return cached ?? Response.error();
  }
}

// ---------- helpers ----------

async function offlinePage() {
  const page = await caches.match(scopeUrl('offline.html'));
  return page ?? new Response('<h1>You are offline</h1>', { status: 503, headers: { 'Content-Type': 'text/html' } });
}

// Stores a copy with a timestamp. Runs in the background, so the response is not delayed.
function storeResponse(cache, request, response, limits) {
  const copy = response.clone();
  copy
    .blob()
    .then((body) => {
      const headers = new Headers(response.headers);
      headers.set(CACHED_AT_HEADER, String(Date.now()));
      return cache.put(
        request,
        new Response(body, { status: response.status, statusText: response.statusText, headers })
      );
    })
    .then(() => trimCache(cache, limits.maxEntries))
    .catch(() => {});
}

// Removes the oldest entries so the cache cannot grow without limit.
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - maxEntries))) {
    await cache.delete(key);
  }
}

// Precached files have no timestamp. They are replaced by the version change, not by age.
function isExpired(response, maxAgeMs) {
  const cachedAt = Number(response.headers.get(CACHED_AT_HEADER));
  if (!cachedAt) return false;
  return Date.now() - cachedAt > maxAgeMs;
}

// Adds a header so the page can show "cached data" to the user.
async function markFromCache(response) {
  const body = await response.blob();
  const headers = new Headers(response.headers);
  headers.set(SERVED_FROM_HEADER, 'cache');
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}
