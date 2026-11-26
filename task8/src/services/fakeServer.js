// Simulated backend.
//
// Reads:  a real HTTP request to the static file api/items.json. The service worker caches
//         the response, so the list and details keep working offline after one successful visit.
// Writes: create, update and remove are stored as local changes in localStorage and merged
//         into every read. Writes need the network to read the current catalog first.
//
// Random delays and random errors keep the loading and error states visible.
import { reportDataSource } from '../pwa/pwaState';

const CATALOG_URL = `${import.meta.env.BASE_URL}api/items.json`;
const CHANGES_KEY = 'async-items-changes-v1';
const STATUSES = ['available', 'reserved', 'completed'];

export class NotFoundError extends Error {
  constructor(message = 'Item not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

const randomDelay = () => 300 + Math.floor(Math.random() * 900); // 300–1200 ms

function abortError() {
  return new DOMException('Request was aborted', 'AbortError');
}

// Resolves after a random delay. Rejects with a random error or with AbortError.
function simulateLatency({ signal, failChance = 0.08, failMessage = 'Server error' } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      if (Math.random() < failChance) reject(new Error(failMessage));
      else resolve();
    }, randomDelay());
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// ---------- local changes ----------

function readChanges() {
  try {
    const raw = window.localStorage.getItem(CHANGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { created: parsed.created ?? [], updated: parsed.updated ?? {}, deleted: parsed.deleted ?? [] };
    }
  } catch {
    // Corrupt data: start from a clean state.
  }
  return { created: [], updated: {}, deleted: [] };
}

function writeChanges(changes) {
  window.localStorage.setItem(CHANGES_KEY, JSON.stringify(changes));
}

// ---------- reads ----------

async function fetchCatalog(signal) {
  let response;
  try {
    response = await fetch(CATALOG_URL, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('You are offline, and these items are not cached yet.');
  }
  if (!response.ok) throw new Error('Could not load items. Please try again.');

  reportDataSource(response.headers.get('X-Served-From') === 'cache');
  const body = await response.json();
  return body.items;
}

// Catalog from the network or the cache, with local changes applied.
async function readAllItems(signal) {
  const catalog = await fetchCatalog(signal);
  const { created, updated, deleted } = readChanges();
  const removed = new Set(deleted);
  return [
    ...catalog.filter((item) => !removed.has(item.id)).map((item) => updated[item.id] ?? item),
    ...created,
  ];
}

const SORTERS = {
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

const toSummary = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  status: item.status,
  price: item.price,
  quantity: item.quantity,
});

export async function queryItems(
  { search = '', category = '', status = '', sort = 'name-asc', page = 1, pageSize = 6 } = {},
  { signal } = {}
) {
  await simulateLatency({ signal, failMessage: 'Could not load items. Please try again.' });

  const all = await readAllItems(signal);
  const term = search.trim().toLowerCase();

  const matching = all
    .filter(
      (item) =>
        (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)) &&
        (!category || item.category === category) &&
        (!status || item.status === status)
    )
    .sort(SORTERS[sort] ?? SORTERS['name-asc']);

  const total = matching.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    items: matching.slice((safePage - 1) * pageSize, safePage * pageSize).map(toSummary),
    total,
    page: safePage,
    totalPages,
    facets: {
      categories: [...new Set(all.map((item) => item.category))].sort(),
      statuses: STATUSES,
    },
  };
}

export async function getAllItems({ signal } = {}) {
  await simulateLatency({ signal, failMessage: 'Could not load dashboard data.' });
  return readAllItems(signal);
}

export async function getItemById(id, { signal } = {}) {
  await simulateLatency({ signal, failMessage: 'Could not load item details.' });
  const item = (await readAllItems(signal)).find((entry) => entry.id === id);
  if (!item) throw new NotFoundError();
  return item;
}

// ---------- writes ----------

export async function createItem(values) {
  await simulateLatency({ failMessage: 'Create failed. Nothing was saved.' });
  const now = new Date().toISOString();
  const item = {
    ...values,
    id: `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  const changes = readChanges();
  writeChanges({ ...changes, created: [...changes.created, item] });
  return item;
}

export async function updateItem(id, patch) {
  await simulateLatency({ failMessage: 'Update failed. Your changes were not saved.' });
  const current = (await readAllItems()).find((item) => item.id === id);
  if (!current) throw new NotFoundError();

  const updated = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
  const changes = readChanges();
  if (changes.created.some((item) => item.id === id)) {
    writeChanges({ ...changes, created: changes.created.map((item) => (item.id === id ? updated : item)) });
  } else {
    writeChanges({ ...changes, updated: { ...changes.updated, [id]: updated } });
  }
  return updated;
}

export async function deleteItem(id) {
  await simulateLatency({ failMessage: 'Remove failed. The item was kept.' });
  const exists = (await readAllItems()).some((item) => item.id === id);
  if (!exists) throw new NotFoundError();

  const changes = readChanges();
  const isLocal = changes.created.some((item) => item.id === id);
  const updated = { ...changes.updated };
  delete updated[id];
  writeChanges({
    created: changes.created.filter((item) => item.id !== id),
    updated,
    deleted: isLocal ? changes.deleted : [...new Set([...changes.deleted, id])],
  });
}
