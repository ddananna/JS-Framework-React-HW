# Items Manager – Task 8 (Redux Toolkit refactor)

Live: https://ddananna.github.io/JS-Framework-React-HW/task8/

This is the Task 7 app (routing, Firebase auth, CRUD, search/filters/pagination, dashboard, PWA with offline support) refactored to use **Redux Toolkit** for global state and async operations. Auth stays in `AuthContext`; temporary UI state (form open/closed, messages, dashboard filters) stays in local `useState`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the VITE_FIREBASE_* values
npm run dev
npm run build                 # production build with the service worker
```

Routes use `HashRouter` (for example `/task8/#/items`), so refresh and direct links work on GitHub Pages.

## Store

`src/store/index.js` creates the store with `configureStore` and three feature slices. `src/main.jsx` wraps the app in `<Provider store={store}>`.

| Slice | File | Holds |
|---|---|---|
| `catalog` | `src/features/catalog/catalogSlice.js` | Every loaded item once, by id (`byId`), plus the dashboard id list (`allIds`) and its status. |
| `itemsList` | `src/features/items/itemsListSlice.js` | Ids for the current URL query, total, pages, facets, status, error, retry count. |
| `itemDetails` | `src/features/items/itemDetailsSlice.js` | Status of the details request for the current id and status of the last mutation. |

Items are stored once in `catalog.byId`. The list and the details page read the same object, so there is no duplicated state.

## Async thunks

All thunks are in `src/features/items/itemsThunks.js`. Each one calls `src/services/itemsApi.js`, which re-exports the simulated backend (`fakeServer.js`).

| Thunk | Type | Purpose | Skips the request when |
|---|---|---|---|
| `fetchItemsList({ params, force })` | list fetching | Current page of the URL query | The same query is loaded or loading (unless `force`). |
| `fetchItemDetails({ id, force })` | details fetching | One item by id | The full item is already in `catalog` (unless `force`). |
| `fetchAllItems({ force })` | dashboard data | All items for statistics | The data is already loaded (`succeeded` or `loading`). |
| `createItem(values)` | mutation | Create an item, then refresh the list | Never. |
| `updateItem({ id, patch })` | mutation | Edit an item or change its status, then refresh the list | Never. |
| `deleteItem(id)` | mutation | Remove an item, then refresh the list | Never. |

Every thunk is handled in `extraReducers` with `pending`, `fulfilled` and `rejected` cases (or matchers, in `itemDetailsSlice.js`).

### Loading, errors, empty results, retries, stale requests

- **Loading:** `status === 'loading'`. The previous list stays on screen with "Updating…".
- **Errors:** `status === 'failed'` with `error`. Pages show the message with a **Try again** button, which dispatches the same thunk with `force: true`.
- **Empty results:** `status === 'succeeded'` and no ids. The page shows "No items match these filters" with a clear button.
- **Retries:** `itemsList.retryCount` counts failures in a row. It resets on success.
- **Stale requests:** every request gets a `requestId` (from `createAsyncThunk`). A slice writes its result only if `action.meta.requestId === state.requestId`. An older response that arrives late is ignored. Catalog and details use the same check.
- **Refresh after mutations:** after a successful change, the thunk dispatches `fetchItemsList({ force: true })` for the current query. The catalog marks dashboard data as `idle`, so it reloads on the next visit.

## Selectors

File: `src/features/items/itemsSelectors.js`.

Reusable base selectors (plain functions):
- `selectItemById(state, id)` – one item from the catalog.
- `selectItemsListMeta(state)` – pagination, facets and status of the list.

Memoized selectors (`createSelector`):
- `selectAllItems` – dashboard items, rebuilt only when `allIds` or `byId` change.
- `selectListItems` – items of the current page. Deleted items drop out automatically.
- `selectCategories` – sorted unique categories for the dashboard filter.
- `selectDashboardStats(state, category, status)` – totals, averages, breakdowns and top 3. Filters are passed as strings, so the memoized result is reused when nothing changed.

## Components and hooks

- `src/hooks/useDebouncedValue.js` – debounces the search text (400 ms). `FilterBar` uses it, so typing updates the URL and the list only after a pause. Enter applies the search immediately.
- The URL remains the source of truth for search, category, status, sort and page (`useSearchParams`).
- `useSelector` and `useDispatch` are used in pages. Pages dispatch thunks and read state. They contain no fetch logic.

## Kept from earlier tasks

- **Authentication:** `AuthContext` with Firebase Email/Password and Google, `RequireAuth` for `/profile`.
- **Routing:** nested routes, lazy-loaded pages, 404 page.
- **PWA:** manifest, icons, service worker with precache, network-first pages and API, cache-first images and fonts, update banner, offline page at `/offline` and `offline.html`, online/offline indicator.
- **Mobile layout** from 320 px.

## Structure

```
src/
  store/index.js                       configureStore + Provider store
  features/catalog/catalogSlice.js     normalized items
  features/items/itemsListSlice.js     list query state
  features/items/itemDetailsSlice.js   details and mutation status
  features/items/itemsThunks.js        createAsyncThunk operations
  features/items/itemsSelectors.js     reusable and memoized selectors
  services/itemsApi.js                 data layer (simulated backend)
  hooks/useDebouncedValue.js           debounce
  context/AuthContext.jsx              authentication (not Redux)
  pwa/                                 service worker registration and online state
```
