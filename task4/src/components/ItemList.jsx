import StatusBadge from './StatusBadge';

export default function ItemList({
  items,
  status,
  error,
  selectedId,
  busy,
  onSelect,
  onReload,
  onCreate,
}) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>All items</h2>
        <div className="button-row">
          <button onClick={onReload} disabled={status === 'loading' || busy}>
            Reload
          </button>
          <button className="primary" onClick={onCreate} disabled={busy}>
            New item
          </button>
        </div>
      </header>

      {status === 'loading' && <p className="state loading">Loading items…</p>}

      {status === 'error' && (
        <div className="state error" role="alert">
          <p>{error}</p>
          <button onClick={onReload}>Try again</button>
        </div>
      )}

      {status === 'success' && items.length === 0 && (
        <p className="state empty">No items yet. Create one to get started.</p>
      )}

      {status === 'success' && items.length > 0 && (
        <ul className="item-list">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  className={`item-row${isSelected ? ' selected' : ''}`}
                  onClick={() => onSelect(item.id)}
                  aria-pressed={isSelected}
                  disabled={busy && !isSelected}
                >
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">
                    {item.category} · ${Number(item.price).toFixed(2)}
                  </span>
                  <StatusBadge status={item.status} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
