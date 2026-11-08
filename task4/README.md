# Async Items — React Effects & API

A React app that manages a list of items through a simulated asynchronous API.
The "server" is a Promise-based fake API that adds random delays and random
errors and persists data to `localStorage`.

## Features

- **List** loaded with `useEffect` on mount, with a **Reload** button
- **Create / Edit / Remove** items
- **Select an item** and load its full details asynchronously (12 displayed fields,
  including description and notes that the list does not include)
- **Status action** that updates the selected item through the API
  (Mark completed / Make available)
- **Loading, error, empty and success** states in both list and details
- **Race-condition protection**, **stale-closure protection**, and correct cleanup

## Restrictions followed

- Only `useState` and `useEffect` are used. No custom hooks, no other built-in hooks.
- No debouncing and no external fetching libraries.
- All `localStorage` access lives in `src/api/fakeApi.js`. Components never touch it.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve dist/ locally
```

## Deploy

The build is static, so any static host works.

- **Vercel:** import the GitHub repo. The defaults (Vite, `npm run build`, `dist`) are correct.
- **Netlify:** import the repo, build command `npm run build`, publish directory `dist`.
- **GitHub Pages:** `vite.config.js` already sets `base: './'`. Build, then publish `dist/`
  (for example with the `gh-pages` package or a GitHub Actions workflow).

---

## Defense notes

### How `useEffect` works here

`useEffect(fn, deps)` runs `fn` after the component renders and the browser paints.
It is the place to synchronize with something outside React, such as a network request.
Anything the effect reads from the render must be listed in `deps`, so the effect
re-runs when it changes.

### Dependencies

| Effect | Dependencies | Why |
|---|---|---|
| Load list | `[listReloadKey]` | Runs on mount and when Reload increments the key. |
| Load details | `[selectedId, detailsRetryKey]` | Runs when the selection changes or Retry is pressed. |

`setState` functions are stable, so they do not need to be listed. The app never
reads a value from the render inside an effect without listing it.

### Cleanup

Each effect returns a cleanup function. React calls it before the effect runs again
and when the component unmounts. Both effects do two things in cleanup:

1. `ignore = true`: any response that arrives later is discarded.
2. `controller.abort()`: the in-flight request is cancelled (the fake API rejects
   with an `AbortError`, which the effect ignores).

In development, `StrictMode` mounts, unmounts and remounts components on purpose,
so the list request runs twice. Correct cleanup makes that harmless.

### Race conditions

Scenario: the user clicks item A, then quickly clicks item B before A's details arrive.

- Changing `selectedId` triggers the details effect cleanup for A. A's request is
  aborted and `ignore` is set, so A's response can never call `setDetailsState`.
- Details are stored as `{ id, status, item }`. The view only shows details whose
  `id` matches the current `selectedId`. Until B's response arrives, the UI shows
  "Loading details", never A's data.

The same logic applies to the list: a reload discards the previous response.

### Stale closures

A closure captures the variables from the render in which it was created. An async
handler that reads `selectedId` *after* an `await` could act on an item the user has
since left.

The app avoids this in three ways:

1. **Capture at start.** `handleToggleStatus` and `handleSave` copy `selectedId` into
   a `const id` before the first `await`. The response updates `id`, not whatever is
   selected when the response arrives.
2. **Update by id, not by position.** Results are merged with
   `setItems(prev => prev.map(item => item.id === id ? ... : item))` and
   `setDetailsState(prev => prev.id === id ? ... : prev)`. Functional updates always
   receive the latest state, and the id check ensures the right item changes.
3. **Prevent conflicting actions.** While `busy` is true, selection, Edit, Remove and
   the status button are disabled. The selection cannot change under an in-flight
   save, so the captured id is always the one the user acted on.

### Conflicting actions

- Only one mutation runs at a time (`busy` flag).
- Buttons are disabled while busy, and the form fieldset is disabled during save.
- Messages are tagged with an `id` and only shown for the item they belong to.

### Loading, error, empty and success

Each part of the UI (list and details) has its own status:

- `loading` shows a message
- `error` shows the message and a **Try again** button
- `empty` (list only) prompts the user to create an item
- `success` shows the data

### Why the fake API fails sometimes

Random failures (`failChance`) and random delays (400–1500 ms) let the error and
loading paths be exercised. Mutations check for failure *before* writing to
`localStorage`, so a failed request never leaves partial data.
