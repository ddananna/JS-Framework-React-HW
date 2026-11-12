# Items — Server Data, Caching & Firebase Authentication

Extends the Task 5 React Router project. All earlier routes, filters, search,
pagination, CRUD and the dashboard still work. This version adds Firebase
Authentication (Email/Password and Google), protected routes, an API caching layer,
and environment-based configuration.

## Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | public |
| `/about` | About | public |
| `/items` | Items list (search, filters, sort, pagination) | public |
| `/items/:id` | Item details (edit, status, remove) | public |
| `/dashboard` | Dashboard | public |
| `/login` | Email/password and Google sign-in | public |
| `/signup` | Sign-up with confirm-password validation | public |
| `/profile` | Email, UID, sign-in method, logout | **protected** |
| `*` | Not found | public |

Signed-out visitors who open `/profile` are redirected to `/login`, then sent back to
`/profile` after signing in.

## Setup

### 1. Firebase project

1. Open the Firebase console and create a project.
2. **Build → Authentication → Get started.**
3. **Sign-in method:** enable **Email/Password** and **Google**.
4. **Authentication → Settings → Authorized domains:** add `localhost` (usually there already)
   and `YOUR_GITHUB_USERNAME.github.io`.
5. **Project settings → Your apps → Web (`</>`):** register an app and copy the config values.

### 2. Local environment

```bash
cp .env.example .env.local
# fill in the VITE_FIREBASE_* values in .env.local
npm install
npm run dev
```

`.env.local` is in `.gitignore` and must never be committed. `.env.example` is committed
as the template.

### 3. Deployment (GitHub Pages)

Vite inlines `VITE_*` values at build time, so the deployed build needs them too.
In the repository: **Settings → Secrets and variables → Actions → New repository secret**,
add these six secrets with the same names as in `.env.example`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

The deploy workflow passes them to the Task 6 build step.

## Architecture

```
src/
  firebase.js                 Firebase init (reads VITE_* values; safe if missing)
  services/
    authService.js            sign-up, login, Google, logout, auth-state subscription
    service.js                all data access, with caching and invalidation
    cache.js                  in-memory cache: keys, TTL, invalidation, dedupe
    fakeServer.js             simulated backend (delays, random errors, localStorage)
  context/AuthContext.jsx     AuthProvider + useAuth (user, loading, actions)
  hooks/useAsyncData.js       loading / error / stale-response handling for pages
  components/RequireAuth.jsx  protected-route wrapper
  pages/                      UI only. No localStorage and no direct API or Firebase calls.
```

Rules this follows:

- Components never access `localStorage` or call the API directly. Pages get data through
  `service.js` (via `useAsyncData`) and auth through `useAuth`.
- Firebase is called only from `firebase.js` and `authService.js`.

## Authentication

- `AuthProvider` subscribes to `onAuthStateChanged` once. `loading` is `true` until Firebase
  reports the first state, so protected pages never redirect a user whose session is still
  being restored.
- Firebase stores the session in browser persistence by default, so a refresh keeps the user
  signed in.
- Errors come from Firebase error codes and are translated into messages in `authService.js`.
  Forms show them inline.
- The navbar shows **Login / Sign up** when signed out and **Profile / Logout** when signed in.

## Caching strategy

**What is cached:** every read from the item service.

| Key | Resource | TTL |
|---|---|---|
| `['items', 'list', params]` | list page (search, filter, sort, page) | 30 s |
| `['items', 'all']` | dashboard statistics | 30 s |
| `['items', 'detail', id]` | one item's details | 60 s |

Keys are arrays. Object keys are sorted before comparison, so the same query always hits the
same entry regardless of how its parameters were written.

**When cached data is used:** if an entry is younger than its TTL, it is returned without a
request. If a request for the same key is already running, the new caller shares it.

**When cached data is discarded:**

1. **Time:** after the TTL expires, the next read refetches.
2. **After a mutation:** a successful create, update or delete invalidates **all** `items`
   keys, so the list, dashboard and any open detail page are refreshed on their next read.
   A failed mutation does not invalidate anything.
3. **On Reload / Try again:** the call sets `force: true` and skips the cache.

**Race protection:**

- Each page run has an `ignore` flag. When filters, the item ID or the reload key changes, the
  previous run's response is dropped, so an older slow response never overwrites newer data.
- The cache records a generation number on every invalidation. A response that started before
  an invalidation is not stored, so stale data never re-enters the cache.

**Loading, error and empty states:** list and detail pages each render loading, error (with
Try again), and empty states. Cached reads resolve immediately, so the loading state is
skipped when data is fresh.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy notes

- The app uses client-side routes. GitHub Pages cannot rewrite paths, so the deploy workflow
  copies `index.html` to `404.html`. Deep links and refresh then load the app.
- `BASE_URL` is read by Vite and used as the router basename, so the app works under
  `/JS-Framework-React-HW/task6/`.
