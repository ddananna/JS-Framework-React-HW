# Items — Installable PWA

Converts the Task 6 app into an installable Progressive Web App. All previous features are
kept: routes, search, filters, sorting, pagination, CRUD, the dashboard, and Firebase
authentication with protected `/profile`.

## Install

- **Chrome / Edge (desktop and Android):** address bar install icon, or the browser menu → *Install app*.
- **Safari (iOS):** Share → *Add to Home Screen*.

The app runs in its own window (`display: standalone`).

## Manifest

`public/manifest.json` contains `name`, `short_name`, `start_url`, `scope`, `display: standalone`,
`theme_color`, `background_color`, and 192×192 and 512×512 PNG icons. `index.html` links the
manifest and the icons.

## Service worker lifecycle

The service worker is `service-worker/sw-template.js`. The build (`vite.config.js`) writes it to
`dist/sw.js` with two values filled in:

- `VERSION`: a new value for every build.
- `PRECACHE_PATHS`: every built JS, CSS, HTML, JSON, icon and font file.

| Event | What happens |
|---|---|
| **install** | Precaches the app shell (JS, CSS, `index.html`, icons, `offline.html`). |
| **activate** | Deletes caches from older versions (any cache with this app's prefix that is not current). |
| **fetch** | Applies the runtime strategies below. |
| **update** | A new version waits. The page shows *A new version is available → Update now*. |

Clicking **Update now** sends `SKIP_WAITING`. The new worker activates, and the page reloads once
(`controllerchange`). Users do not need to clear browser storage. Versioned cache names and hashed
asset names keep old and new files apart.

## Caching strategies

| Request | Strategy | Limits |
|---|---|---|
| App shell (JS, CSS, HTML, icons, offline page) | Precached at install | Replaced by version |
| Page navigations | **Network-first.** Each visited page is stored and served offline. Unvisited pages get `offline.html`. | 30 pages |
| `/api/items.json` (public item data) | **Network-first**, falls back to the cache | 40 entries, 7 days |
| Images and fonts | **Cache-first** | 80 entries, 30 days |
| Firebase, Google, other origins | Not intercepted | — |
| Requests with `Authorization` | Never cached | — |

**Why two strategies:** static files rarely change, so serving them from the cache first is fast
and safe. Item data can change, so the app tries the network first and falls back to the copy it
saved earlier.

**Cache growth:** every runtime cache has a maximum entry count (oldest entries are removed first),
and the static and API caches also expire by age.

**Showing cached data:** when the service worker answers an API request from its cache, it adds the
header `X-Served-From: cache`. The data layer reads it, and a banner appears:
*Showing cached data* (online) or *You are offline. Showing cached data.* (offline).

**Invalidation:** cached API data is replaced on every successful network response. Create, update
and remove also clear the in-memory query cache from Task 6, so the list and details refresh on the
next read.

## Offline behavior

- **Online/offline indicator** in the navbar (`Online` / `Offline`), updated by the browser events.
- **Visited pages** open offline, because the app shell and each visited route are cached.
- **Public item data** that was loaded once stays available offline.
- **Unvisited pages** while offline show `public/offline.html`, which needs no network. It has a
  *Retry connection* button and reloads when the connection returns.
- **`/offline` route** in the app shows the same message inside the app.
- **Back online:** the offline page reloads automatically, and normal functionality resumes.

Firebase sign-in and sign-up need the network. Create, update and remove are stored in the
browser's localStorage, and each write first reads the current catalog, so it needs the network or
a cached copy. Those local changes are not synced to any server.

## Mobile

- Designed mobile-first, supporting screens from **320px** wide.
- Responsive navigation: a **Menu** button on phones, a horizontal bar from 720px.
- Cards, filters, forms, item details and the dashboard use single-column layouts on small screens
  and expand on wider ones.
- Buttons and inputs are at least 44px tall. Inputs use 16px text to prevent zoom on iOS.
- No horizontal scrolling: long words wrap, and `overflow-x` is hidden on `body`.
- Portrait and landscape have separate rules. Landscape phones get less vertical padding.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the Firebase values
npm run dev
```

The service worker is registered only in production builds (`import.meta.env.PROD`), so use
`npm run build && npm run preview` to test the PWA locally.

## Testing checklist

1. `npm run build && npm run preview`, then open the preview URL in Chrome.
2. DevTools → **Application** → **Manifest**: no errors, icons shown, installable.
3. DevTools → **Application** → **Service Workers**: `sw.js` activated and running.
4. DevTools → **Application** → **Cache Storage**: `task7-shell-…`, `task7-pages-…`, `task7-api-…`.
5. Load `/items` and an item. In **Network**, tick *Offline*, then reload. The list, details and
   cached banner should still work.
6. Open a page you never visited while offline. The offline page should appear.
7. Untick *Offline*. The app should return to normal.
8. Run Lighthouse → *Progressive Web App* on the deployed URL.

## Deployment

GitHub Pages serves over HTTPS, which service workers require. The deploy workflow copies
`index.html` to `404.html`, so deep links such as `/task7/items/item-3` load the app. The manifest
and service worker use relative and base-aware paths, so the app works under
`/JS-Framework-React-HW/task7/`.

Firebase config is baked in at build time from the repository secrets, as in Task 6.
