import { useEffect, useState } from 'react';
import useDebouncedValue from '../hooks/useDebouncedValue';

// Presentational: every change is reported upward via onChange(patch).
// The search text is debounced, so the URL (and the list request) updates 400 ms after typing stops.
export default function FilterBar({ q, category, status, sort, categories, statuses, onChange }) {
  const [draft, setDraft] = useState(q);
  const debouncedDraft = useDebouncedValue(draft, 400);

  // The URL changed (Back/Forward, links): show it in the search box.
  useEffect(() => {
    setDraft(q);
  }, [q]);

  // The debounced text reached the URL.
  useEffect(() => {
    const next = debouncedDraft.trim();
    if (next !== q) onChange({ q: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  // Enter or the button applies the search at once.
  function handleSearch(event) {
    event.preventDefault();
    onChange({ q: draft.trim() });
  }

  return (
    <div className="filters">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="search"
          placeholder="Search name or description"
          aria-label="Search items"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <select aria-label="Category" value={category} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="">All categories</option>
        {categories.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <select aria-label="Status" value={status} onChange={(e) => onChange({ status: e.target.value })}>
        <option value="">All statuses</option>
        {statuses.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <select aria-label="Sort" value={sort} onChange={(e) => onChange({ sort: e.target.value })}>
        <option value="name-asc">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}
