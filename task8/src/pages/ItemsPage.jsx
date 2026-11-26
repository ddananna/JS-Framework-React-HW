import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createItem, fetchItemsList } from '../features/items/itemsThunks';
import { selectItemsListMeta, selectListItems } from '../features/items/itemsSelectors';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import ItemForm from '../components/ItemForm';

const PAGE_SIZE = 6;

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // The URL is the source of truth for the query.
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = searchParams.get('status') ?? '';
  const sort = searchParams.get('sort') ?? 'name-asc';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const params = useMemo(
    () => ({ search: q, category, status, sort, page, pageSize: PAGE_SIZE }),
    [q, category, status, sort, page]
  );

  // Changing the URL dispatches a thunk. The thunk skips the request if the same query is loaded.
  useEffect(() => {
    dispatch(fetchItemsList({ params }));
  }, [dispatch, params]);

  // Redux state: the page only reads it.
  const list = useSelector(selectItemsListMeta);
  const items = useSelector(selectListItems);

  // Temporary UI state stays local.
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Writes a patch into the URL. Any change except page resets to page 1.
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
      const created = await dispatch(createItem(values)).unwrap();
      setCreating(false);
      navigate(`/items/${created.id}`);
    } finally {
      setSaving(false); // errors propagate to ItemForm, which shows them
    }
  }

  const hasFilters = Boolean(q || category || status);
  const waitingFirstResult = items.length === 0 && (list.status === 'idle' || list.status === 'loading');

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
          <ItemForm mode="create" busy={saving} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      <FilterBar
        q={q}
        category={category}
        status={status}
        sort={sort}
        categories={list.facets.categories}
        statuses={list.facets.statuses}
        onChange={updateParams}
      />

      {list.status === 'failed' && (
        <div className="state error" role="alert">
          <p>{list.error}</p>
          <p className="muted">Failed {list.retryCount} time(s) in a row.</p>
          <button onClick={() => dispatch(fetchItemsList({ params, force: true }))}>Try again</button>
        </div>
      )}

      {waitingFirstResult && <p className="state loading">Loading items…</p>}

      {list.status === 'succeeded' && items.length === 0 && (
        <div className="state empty">
          <p>{hasFilters ? 'No items match these filters.' : 'No items yet.'}</p>
          {hasFilters && (
            <button onClick={() => updateParams({ q: '', category: '', status: '' })}>Clear filters</button>
          )}
        </div>
      )}

      {items.length > 0 && (
        <>
          {list.status === 'loading' && <p className="muted">Updating…</p>}
          <p className="muted">{list.total} item(s)</p>
          <div className="card-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            onPage={(nextPage) => updateParams({ page: nextPage })}
          />
        </>
      )}
    </section>
  );
}
