import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAsyncData from '../hooks/useAsyncData';
import { createItem, queryItems } from '../services/service';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import ItemForm from '../components/ItemForm';

const PAGE_SIZE = 6;

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // The URL is the single source of truth for list state.
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const sort = searchParams.get('sort') ?? 'name-asc';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { status: loadState, data, error, reload } = useAsyncData(
    ({ signal, force }) =>
      queryItems({ search: q, category, status, sort, page, pageSize: PAGE_SIZE }, { signal, force }),
    [q, category, status, sort, page],
    { keepData: true }
  );

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Write a patch into the URL. Any change other than page resets to page 1.
  function updateParams(patch) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value == null) next.delete(key);
        else next.set(key, String(value));
      });
      if (!('page' in patch)) next.delete('page');
      return next;
    });
  }

  async function handleCreate(values) {
    setSaving(true);
    try {
      const created = await createItem(values);
      setSaving(false);
      setCreating(false);
      navigate(`/items/${created.id}`);
    } catch (err) {
      setSaving(false);
      throw err; // ItemForm shows the message
    }
  }

  const hasFilters = Boolean(q || category || status);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Items</h1>
        <button className="primary" onClick={() => setCreating((open) => !open)} disabled={saving}>
          {creating ? 'Close' : 'New item'}
        </button>
      </header>

      {creating && (
        <div className="panel">
          <ItemForm
            mode="create"
            busy={saving}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <FilterBar
        q={q}
        category={category}
        status={status}
        sort={sort}
        categories={data?.facets.categories ?? []}
        statuses={data?.facets.statuses ?? []}
        onChange={updateParams}
      />

      {loadState === 'loading' && !data && <p className="state loading">Loading items…</p>}

      {loadState === 'error' && (
        <div className="state error" role="alert">
          <p>{error.message}</p>
          <button onClick={reload}>Try again</button>
        </div>
      )}

      {data && loadState !== 'error' && (
        <>
          {loadState === 'loading' && <p className="muted">Updating…</p>}

          {data.items.length === 0 ? (
            <div className="state empty">
              <p>{hasFilters ? 'No items match these filters.' : 'No items yet.'}</p>
              {hasFilters && (
                <button onClick={() => updateParams({ q: '', category: '', status: '' })}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="muted">{data.total} item(s)</p>
              <div className="card-grid">
                {data.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPage={(nextPage) => updateParams({ page: nextPage })}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
