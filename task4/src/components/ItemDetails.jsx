import StatusBadge from './StatusBadge';

function Field({ label, children }) {
  return (
    <div className="field">
      <dt>{label}</dt>
      <dd>{children || <span className="muted">—</span>}</dd>
    </div>
  );
}

export default function ItemDetails({
  selectedId,
  status,
  item,
  error,
  busy,
  message,
  onRetry,
  onEdit,
  onRemove,
  onToggleStatus,
}) {
  if (status === 'idle' || selectedId === null) {
    return (
      <section className="panel">
        <p className="state empty">Select an item on the left to see its details.</p>
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className="panel">
        <p className="state loading">Loading details…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="panel">
        <div className="state error" role="alert">
          <p>{error}</p>
          <button onClick={onRetry}>Try again</button>
        </div>
      </section>
    );
  }

  if (!item) return null;

  const nextStatus = item.status === 'completed' ? 'available' : 'completed';
  const toggleLabel = busy
    ? 'Saving…'
    : nextStatus === 'completed'
      ? 'Mark completed'
      : 'Make available';

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>{item.name}</h2>
          <StatusBadge status={item.status} />
        </div>
      </header>

      <dl className="details-grid">
        <Field label="Category">{item.category}</Field>
        <Field label="Price">{item.price != null ? `$${Number(item.price).toFixed(2)}` : ''}</Field>
        <Field label="Quantity">{item.quantity}</Field>
        <Field label="Location">{item.location}</Field>
        <Field label="Owner">{item.owner}</Field>
        <Field label="Tags">{item.tags?.join(', ')}</Field>
        <Field label="Created">{new Date(item.createdAt).toLocaleString()}</Field>
        <Field label="Last updated">{new Date(item.updatedAt).toLocaleString()}</Field>
      </dl>

      <div className="text-block">
        <h3>Description</h3>
        <p>{item.description || <span className="muted">No description.</span>}</p>
      </div>

      <div className="text-block">
        <h3>Notes</h3>
        <p>{item.notes || <span className="muted">No notes.</span>}</p>
      </div>

      <div className="button-row">
        <button onClick={onToggleStatus} disabled={busy}>
          {toggleLabel}
        </button>
        <button onClick={onEdit} disabled={busy}>
          Edit
        </button>
        <button className="danger" onClick={onRemove} disabled={busy}>
          Remove
        </button>
      </div>

      {message && (
        <p className={`message ${message.type}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
