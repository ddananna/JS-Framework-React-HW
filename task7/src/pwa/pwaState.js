// Shared PWA state: connectivity, a waiting update, and whether the last data came from cache.
// Read in React through usePwaState() (useSyncExternalStore).
const listeners = new Set();

let state = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  updateRegistration: null, // set when a new service worker is waiting
  dataFromCache: false, // true when the last data request was answered from the cache
};

function emit(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function getPwaState() {
  return state;
}

export function subscribePwa(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function reportDataSource(fromCache) {
  if (state.dataFromCache !== fromCache) emit({ dataFromCache: fromCache });
}

export function setUpdateRegistration(registration) {
  emit({ updateRegistration: registration });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => emit({ online: true }));
  window.addEventListener('offline', () => emit({ online: false }));
}
