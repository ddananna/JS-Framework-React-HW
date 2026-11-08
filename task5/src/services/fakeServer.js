// Simulated backend. Only service.js should import this file.
// Random delays, random failures, and localStorage as the database.

const STORAGE_KEY = 'async-items-db-v2';
const SEED_DATE = '2026-01-10T09:00:00.000Z';
const STATUSES = ['available', 'reserved', 'completed'];

export class NotFoundError extends Error {
  constructor(message = 'Item not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// [name, category, price, description]
const CATALOG = [
  ['Mechanical Keyboard', 'Electronics', 129.99, 'Tenkeyless layout with hot-swappable switches.'],
  ['Ergonomic Chair', 'Furniture', 349, 'Mesh back with adjustable lumbar support.'],
  ['Standing Desk', 'Furniture', 499.5, 'Electric height adjustment with memory presets.'],
  ['USB-C Hub', 'Electronics', 39.9, '7-in-1 hub with HDMI 4K output.'],
  ['Noise-Cancelling Headphones', 'Audio', 219, 'Over-ear with adaptive ANC and multipoint Bluetooth.'],
  ['Desk Lamp', 'Lighting', 45, 'LED lamp with three color temperatures.'],
  ['Monitor 27"', 'Electronics', 289, '27-inch 1440p IPS panel with USB-C input.'],
  ['Bluetooth Speaker', 'Audio', 79, 'Waterproof speaker with a 12-hour battery.'],
  ['Floor Lamp', 'Lighting', 120, 'Dimmable floor lamp with a reading arm.'],
  ['Notebook Set', 'Stationery', 18.5, 'Three dotted A5 notebooks.'],
  ['Fountain Pen', 'Stationery', 64, 'Medium nib with an aluminum body.'],
  ['Bookshelf', 'Furniture', 210, 'Five-tier oak shelf, flat-pack.'],
];

const OWNERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'];
const LOCATIONS = ['Warehouse A', 'Warehouse B', 'Showroom'];

const SEED_ITEMS = CATALOG.map(([name, category, price, description], i) => ({
  id: `item-${i + 1}`,
  name,
  category,
  price,
  description,
  status: STATUSES[i % 3],
  quantity: ((i * 7) % 25) + 1,
  location: LOCATIONS[i % 3],
  owner: OWNERS[i % 3],
  tags: [category.toLowerCase()],
  notes: i % 4 === 0 ? 'Checked during the last stock count.' : '',
  createdAt: SEED_DATE,
  updatedAt: SEED_DATE,
}));

// ---------- storage ----------

function readDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupt JSON falls through to re-seeding.
  }
  writeDb(SEED_ITEMS);
  return SEED_ITEMS;
}

function writeDb(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ---------- request simulation ----------

const randomDelay = () => 400 + Math.floor(Math.random() * 1100); // 400–1500 ms

function abortError() {
  return new DOMException('Request was aborted', 'AbortError');
}

// Resolves after a random delay. Rejects with an error (random) or AbortError (signal).
// Mutations call this BEFORE writing, so a failed request never half-saves.
function simulateRequest({ signal, failChance = 0.1, failMessage = 'Server error' } = {}) {
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

// ---------- queries ----------

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

// Search, filter, sort and paginate on the "server".
export async function queryItems(
  { search = '', category = '', status = '', sort = 'name-asc', page = 1, pageSize = 6 } = {},
  { signal } = {}
) {
  await simulateRequest({ signal, failChance: 0.1, failMessage: 'Could not load items. Please try again.' });

  const all = readDb();
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
  await simulateRequest({ signal, failChance: 0.1, failMessage: 'Could not load dashboard data.' });
  return readDb();
}

export async function getItemById(id, { signal } = {}) {
  await simulateRequest({ signal, failChance: 0.15, failMessage: 'Could not load item details.' });
  const item = readDb().find((entry) => entry.id === id);
  if (!item) throw new NotFoundError();
  return item;
}

// ---------- mutations ----------

export async function createItem(values) {
  await simulateRequest({ failChance: 0.1, failMessage: 'Create failed. Nothing was saved.' });
  const now = new Date().toISOString();
  const item = {
    ...values,
    id: `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  writeDb([...readDb(), item]);
  return item;
}

export async function updateItem(id, patch) {
  await simulateRequest({ failChance: 0.15, failMessage: 'Update failed. Your changes were not saved.' });
  const db = readDb();
  const index = db.findIndex((entry) => entry.id === id);
  if (index === -1) throw new NotFoundError();
  const updated = { ...db[index], ...patch, id, updatedAt: new Date().toISOString() };
  const next = [...db];
  next[index] = updated;
  writeDb(next);
  return updated;
}

export async function deleteItem(id) {
  await simulateRequest({ failChance: 0.1, failMessage: 'Remove failed. The item was kept.' });
  const db = readDb();
  if (!db.some((entry) => entry.id === id)) throw new NotFoundError();
  writeDb(db.filter((entry) => entry.id !== id));
}
