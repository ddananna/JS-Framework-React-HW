// The only module components and hooks import for server data.
// It adds caching and invalidation on top of the backend.
// To use a real API later, change the `backend` import. Components stay the same.
import * as backend from './fakeServer';
import { cache } from './cache';

export { NotFoundError } from './fakeServer';

// Every item key starts with 'items', so invalidate([ITEMS]) clears all item data.
const ITEMS = 'items';

// Time-based expiry per resource, in ms.
const TTL = { list: 30_000, all: 30_000, detail: 60_000 };

export function queryItems(params = {}, { force = false } = {}) {
  return cache.get([ITEMS, 'list', params], () => backend.queryItems(params), {
    ttl: TTL.list,
    force,
  });
}

export function fetchAllItems({ force = false } = {}) {
  return cache.get([ITEMS, 'all'], () => backend.getAllItems(), { ttl: TTL.all, force });
}

export function fetchItemById(id, { force = false } = {}) {
  return cache.get([ITEMS, 'detail', id], () => backend.getItemById(id), {
    ttl: TTL.detail,
    force,
  });
}

// Mutations invalidate only after the server confirms, so a failed call never clears the cache.
export async function createItem(values) {
  const item = await backend.createItem(values);
  cache.invalidate([ITEMS]);
  return item;
}

export async function updateItem(id, patch) {
  const item = await backend.updateItem(id, patch);
  cache.invalidate([ITEMS]);
  return item;
}

export async function deleteItem(id) {
  await backend.deleteItem(id);
  cache.invalidate([ITEMS]);
}
