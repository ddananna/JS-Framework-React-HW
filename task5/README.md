# Items — Routing & Application Architecture

A React app built with React Router. It uses nested routes, dynamic URLs, URL-synced
search and filters, lazy-loaded pages, and a simulated async API (Promises, random
delays, random errors, `localStorage`).

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/items` | Items list (search, 2 filters, sort, pagination, create) |
| `/items/:id` | Item details (fetched by ID, edit, status action, remove) |
| `/dashboard` | Dashboard (statistics, breakdowns, interactive filters) |
| `/login` | Login placeholder |
| `*` | Not Found (404) |

Routes are defined in `src/App.jsx`. `/items` is a nested route under `ItemsLayout`,
and every route renders inside `RootLayout` (NavBar + `Outlet`).

## Project structure

```
src/
  App.jsx                 routing only
  main.jsx                BrowserRouter + app entry
  layouts/                RootLayout (NavBar + Outlet), ItemsLayout (nested)
  pages/                  Home, About, ItemsPage, ItemDetailsPage, Dashboard, Login, NotFound
  components/             NavBar, ItemCard, FilterBar, Pagination, ItemDetails, ItemForm, StatusBadge
  hooks/                  useAsyncData (loading / error / stale-response handling)
  services/
    service.js            all API requests (components and hooks import only from here)
    fakeServer.js         simulated backend: delays, errors, localStorage, search/filter/sort/paginate
  App.css                 minimal, responsive styling
```

## How the requirements are met

- **Nested routes and Outlet:** `RootLayout` renders the NavBar and an `Outlet`. The items
  section adds a second layer (`ItemsLayout`) with its own `Outlet` for `/items` and `/items/:id`.
- **Lazy loading:** About, Items, Item details, Dashboard, Login and Not Found are loaded with
  `React.lazy`. `RootLayout` wraps the `Outlet` in `Suspense`.
- **URL as state:** the list reads `q`, `category`, `status`, `sort` and `page` from
  `useSearchParams`. Changing a filter writes to the URL, and changing any filter except
  `page` resets to page 1. Back, Forward, refresh and shared links all restore the same view.
- **Item details:** fetched with `useParams` and `fetchItemById`. Invalid IDs (wrong format)
  show "Invalid item ID"; IDs that do not exist show "Item not found". Stale responses are
  ignored because the hook aborts the previous request when the ID changes, and details are
  never kept across IDs (`keepData: false`).
- **Dashboard:** statistics and breakdowns are calculated from API data. The category and
  status filters change the numbers. Breakdown rows and top items link to the list and details.
- **Navigation without reloads:** all links use `Link` / `NavLink`; no `<a href>` reloads the page.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs dist/
npm run preview
```

## Deploy

Client-side routes need the host to serve `index.html` for every path. Included:

- **Netlify:** `public/_redirects` (copied into `dist/` by the build).
- **Vercel:** `vercel.json` rewrites.
- **GitHub Pages:** not supported for deep links out of the box (it has no rewrite rules).
  Use Netlify or Vercel for direct URLs and refresh.
