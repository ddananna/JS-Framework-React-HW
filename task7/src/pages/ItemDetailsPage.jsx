import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useAsyncData from '../hooks/useAsyncData';
import { deleteItem, fetchItemById, updateItem } from '../services/service';
import ItemDetails from '../components/ItemDetails';
import ItemForm from '../components/ItemForm';

const ID_PATTERN = /^item-[a-z0-9-]+$/i;

function MissingItem({ invalid = false }) {
  return (
    <section className="page panel">
      <h2>{invalid ? 'Invalid item ID' : 'Item not found'}</h2>
      <p className="muted">
        {invalid
          ? 'Item IDs look like "item-1". Check the link or pick an item from the list.'
          : 'This item may have been removed.'}
      </p>
      <Link className="button primary" to="/items">
        Back to items
      </Link>
    </section>
  );
}

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const validId = ID_PATTERN.test(id ?? '');

  // keepData: false, so a previous item is never shown under a new ID.
  // Changing `id` aborts the old request and ignores its response.
  const { status, data: item, error, reload, setData } = useAsyncData(
    ({ force }) => (validId ? fetchItemById(id, { force }) : Promise.resolve(null)),
    [id, validId],
    { keepData: false }
  );

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { id, type, text }

  // Leaving one item for another closes the editor and clears messages.
  useEffect(() => {
    setEditing(false);
    setMessage(null);
  }, [id]);

  if (!validId) return <MissingItem invalid />;

  if (status === 'loading') {
    return (
      <section className="page">
        <p className="state loading">Loading item…</p>
      </section>
    );
  }

  if (status === 'error') {
    if (error?.name === 'NotFoundError') return <MissingItem />;
    return (
      <section className="page">
        <div className="state error" role="alert">
          <p>{error.message}</p>
          <button onClick={reload}>Try again</button>
        </div>
      </section>
    );
  }

  if (!item) return <MissingItem />;

  // Actions capture the item id first. The result updates that id only.
  async function handleToggleStatus() {
    if (busy) return;
    const target = item.id;
    const next = item.status === 'completed' ? 'available' : 'completed';

    setBusy(true);
    setMessage(null);
    try {
      const updated = await updateItem(target, { status: next });
      setData((prev) => (prev?.id === target ? updated : prev));
      setMessage({ id: target, type: 'success', text: `Status set to "${next}".` });
    } catch (err) {
      setMessage({ id: target, type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(values) {
    const target = item.id;
    setBusy(true);
    setMessage(null);
    try {
      const updated = await updateItem(target, values);
      setData((prev) => (prev?.id === target ? updated : prev));
      setEditing(false);
      setMessage({ id: target, type: 'success', text: 'Changes saved.' });
    } finally {
      setBusy(false); // errors propagate to ItemForm
    }
  }

  async function handleRemove() {
    if (busy || !window.confirm('Remove this item? This cannot be undone.')) return;
    const target = item.id;

    setBusy(true);
    setMessage(null);
    try {
      await deleteItem(target);
      navigate('/items');
    } catch (err) {
      setMessage({ id: target, type: 'error', text: err.message });
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <nav className="link-row">
        <button onClick={() => navigate(-1)}>← Back</button>
        <Link to="/items">All items</Link>
      </nav>

      {editing ? (
        <div className="panel">
          <ItemForm
            mode="edit"
            initial={item}
            busy={busy}
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <ItemDetails
          item={item}
          busy={busy}
          message={message?.id === item.id ? message : null}
          onToggleStatus={handleToggleStatus}
          onEdit={() => {
            setMessage(null);
            setEditing(true);
          }}
          onRemove={handleRemove}
        />
      )}
    </section>
  );
}
