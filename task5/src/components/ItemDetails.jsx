import StatusBadge from './StatusBadge';

function Field({ label, children }) {
  return (
    <div className="field">
      <dt>{label}</dt>
      <dd>{children || <span className="muted">—</span>}</dd>
    </div>
  );
}

// Presentational: receives a fully loaded item. Loading and errors are handled by the page.
export default function ItemDetails({ item, busy, message, onToggleStatus, onEdit, onRemove }) {
  const nextStatus = item.status === 'completed' ? 'available' : 'completed';

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{item.name}</h2>
        <StatusBadge status={item.status} />
      </div>

      <dl className="details-grid">
        <Field label="Category">{item.category}</Field>
        <Field label="Price">{`$${Number(item.price).toFixed(2)}`}</Field>
        <Field label="Quantity">{item.quantity}</Field>
        <Field label="Location">{item.location}</Field>
        <Field label="Owner">{item.owner}</Field>
        <Field label="Tags">{item.tags?.join(', ')}</Field>
        <Field label="Created">{new Date(item.createdAt).toLocaleString()}</Field>
        <Field label="Last updated">{new Date(item.updatedAt).toLocaleString()}</Field>
      </dl>

      <h3>Description</h3>
      <p>{item.description || <span className="muted">No description.</span>}</p>

      <h3>Notes</h3>
      <p>{item.notes || <span className="muted">No notes.</span>}</p>

      <div className="button-row">
        <button onClick={onToggleStatus} disabled={busy}>
          {busy ? 'Saving…' : nextStatus === 'completed' ? 'Mark completed' : 'Make available'}
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
