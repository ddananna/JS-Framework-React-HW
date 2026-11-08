// Simulated asynchronous API.
// All persistence lives here: components never touch localStorage directly.
// Every call returns a Promise, waits a random delay, and may fail on purpose.

const STORAGE_KEY = 'async-items-db-v1';
const SEED_DATE = '2026-01-10T09:00:00.000Z';
const LIST_FIELDS = ['id', 'name', 'category', 'status', 'price'];

const SEED_ITEMS = [
  {
    id: 'item-1',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    status: 'available',
    price: 129.99,
    quantity: 12,
    location: 'Warehouse A',
    owner: 'Ada Lovelace',
    tags: ['peripherals', 'usb'],
    description: 'Tenkeyless layout with hot-swappable switches and a braided USB-C cable.',
    notes: 'Ship with a spare keycap set.',
  },
  {
    id: 'item-2',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    status: 'reserved',
    price: 349,
    quantity: 3,
    location: 'Showroom',
    owner: 'Grace Hopper',
    tags: ['office', 'ergonomic'],
    description: 'Mesh back with adjustable lumbar support and 4D armrests.',
    notes: 'Assembly required.',
  },
  {
    id: 'item-3',
    name: 'Standing Desk',
    category: 'Furniture',
    status: 'completed',
    price: 499.5,
    quantity: 5,
    location: 'Warehouse B',
    owner: 'Alan Turing',
    tags: ['office', 'desk'],
    description: 'Electric height adjustment, 140 cm bamboo top, memory presets.',
    notes: 'Delivered and installed last week.',
  },
  {
    id: 'item-4',
    name: 'USB-C Hub',
    category: 'Electronics',
    status: 'available',
    price: 39.9,
    quantity: 40,
    location: 'Warehouse A',
    owner: 'Ada Lovelace',
    tags: ['usb', 'accessories'],
    description: '7-in-1 hub with HDMI 4K output, SD reader and 100 W pass-through.',
    notes: '',
  },
  {
    id: 'item-5',
    name: 'Noise-Cancelling Headphones',
    category: 'Audio',
    status: 'available',
    price: 219,
    quantity: 8,
    location: 'Showroom',
    owner: 'Grace Hopper',
    tags: ['audio', 'wireless'],
    description: 'Over-ear, 30-hour battery, adaptive ANC and multipoint Bluetooth.',
    notes: 'Demo units available on request.',
  },
].map((item) => ({ createdAt: SEED_DATE, updatedAt: SEED_DATE, ...item }));

// ---------- helpers ----------

const toSummary = (item) =>
  Object.fromEntries(LIST_FIELDS.map((field) => [field, item[field]]));

function readDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupt JSON falls through to re-seeding below.
  }
  writeDb(SEED_ITEMS);
  return SEED_ITEMS;
}

function writeDb(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const randomDelay = () => 400 + Math.floor(Math.random() * 1100); // 400–1500 ms

function abortError() {
  return new DOMException('Request was aborted', 'AbortError');
}

// Resolves after a random delay, or rejects with an error / AbortError.
// Mutations call this BEFORE writing, so a failed request never half-saves.
function simulateRequest({ signal, failChance = 0.15, failMessage = 'Server error' } = {}) {
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
      if (Math.random() < failChance) {
        reject(new Error(failMessage));
      } else {
        resolve();
      }
    }, randomDelay());

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// ---------- public API ----------

export async function fetchItems({ signal } = {}) {
  await simulateRequest({
    signal,
    failChance: 0.15,
    failMessage: 'Could not load items. Please try again.',
  });
  return readDb().map(toSummary);
}

export async function fetchItemDetails(id, { signal } = {}) {
  await simulateRequest({
    signal,
    failChance: 0.2,
    failMessage: 'Could not load item details.',
  });
  const item = readDb().find((entry) => entry.id === id);
  if (!item) throw new Error('This item no longer exists.');
  return item;
}

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
  if (index === -1) throw new Error('This item no longer exists.');
  const updated = { ...db[index], ...patch, id, updatedAt: new Date().toISOString() };
  const next = [...db];
  next[index] = updated;
  writeDb(next);
  return updated;
}

export async function deleteItem(id) {
  await simulateRequest({ failChance: 0.1, failMessage: 'Remove failed. The item was kept.' });
  const db = readDb();
  if (!db.some((entry) => entry.id === id)) throw new Error('This item no longer exists.');
  writeDb(db.filter((entry) => entry.id !== id));
}
