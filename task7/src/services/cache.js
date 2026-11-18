// In-memory cache for server data.
//
// Keys:        arrays such as ['items', 'list', { page: 1 }]. Object keys are sorted,
//              so equal queries always map to the same entry.
// Expiry:      every entry lives for `ttl` ms (time-based revalidation).
// Invalidation: invalidate(prefix) removes every entry whose key starts with `prefix`
//              (event-based, called after create, update and delete).
// Force:       { force: true } skips the cache and refetches (used by Reload).
// Dedupe:      concurrent calls for the same key share one in-flight request.
// Race safety: a response that started before an invalidation is not stored,
//              so an older response can never overwrite newer data.

const entries = new Map(); // key -> { parts, value, expiresAt }
const inflight = new Map(); // key -> { parts, promise }
let generation = 0; // increases on every invalidation

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const body = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',');
    return `{${body}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function hasPrefix(parts, prefix) {
  return (
    prefix.length <= parts.length &&
    prefix.every((part, i) => stableStringify(part) === stableStringify(parts[i]))
  );
}

export const cache = {
  get(parts, fetcher, { ttl, force = false }) {
    const key = stableStringify(parts);

    if (!force) {
      const entry = entries.get(key);
      if (entry && entry.expiresAt > Date.now()) return Promise.resolve(entry.value);

      const pending = inflight.get(key);
      if (pending) return pending.promise;
    }

    const startedAt = generation;
    const promise = fetcher()
      .then((value) => {
        if (startedAt === generation) {
          entries.set(key, { parts, value, expiresAt: Date.now() + ttl });
        }
        return value;
      })
      .finally(() => {
        if (inflight.get(key)?.promise === promise) inflight.delete(key);
      });

    inflight.set(key, { parts, promise });
    return promise;
  },

  invalidate(prefix) {
    generation += 1;
    for (const [key, entry] of entries) {
      if (hasPrefix(entry.parts, prefix)) entries.delete(key);
    }
    for (const [key, pending] of inflight) {
      if (hasPrefix(pending.parts, prefix)) inflight.delete(key);
    }
  },
};
