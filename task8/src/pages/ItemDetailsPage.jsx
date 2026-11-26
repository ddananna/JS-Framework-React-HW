import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteItem, fetchItemDetails, updateItem } from '../features/items/itemsThunks';
import { selectItemById } from '../features/items/itemsSelectors';
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
  const dispatch = useDispatch();
  const validId = ID_PATTERN.test(id ?? '');

  // The item comes from the normalized catalog. The details request only sets the status.
  const item = useSelector((state) => selectItemById(state, id));
  const details = useSelector((state) => state.itemDetails);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, text } – local UI state

  useEffect(() => {
    if (validId) dispatch(fetchItemDetails({ id }));
  }, [dispatch, id, validId]);

  // Leaving one item for another closes the editor and clears messages.
  useEffect(() => {
    setEditing(false);
    setMessage(null);
  }, [id]);

  if (!validId) return <MissingItem invalid />;

  const loaded = Boolean(item?.detailsLoaded);
  // Only the request for this id counts. An older request for another item is ignored.
  const failed = !loaded && details.currentId === id && details.status === 'failed';

  if (failed) {
    if (details.error?.name === 'NotFoundError') return <MissingItem />;
    return (
      <section className="page">
        <div className="state error" role="alert">
          <p>{details.error?.message}</p>
          <button onClick={() => dispatch(fetchItemDetails({ id, force: true }))}>Try again</button>
        </div>
      </section>
    );
  }

  if (!loaded) {
    return (
      <section className="page">
        <p className="state loading">Loading item…</p>
      </section>
    );
  }

  async function handleToggleStatus() {
    if (busy) return;
    const next = item.status === 'completed' ? 'available' : 'completed';
    setBusy(true);
    setMessage(null);
    try {
      await dispatch(updateItem({ id: item.id, patch: { status: next } })).unwrap();
      setMessage({ type: 'success', text: `Status set to "${next}".` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(values) {
    setBusy(true);
    setMessage(null);
    try {
      await dispatch(updateItem({ id: item.id, patch: values })).unwrap();
      setEditing(false);
      setMessage({ type: 'success', text: 'Changes saved.' });
    } finally {
      setBusy(false); // errors propagate to ItemForm
    }
  }

  async function handleRemove() {
    if (busy || !window.confirm('Remove this item? This cannot be undone.')) return;
    setBusy(true);
    setMessage(null);
    try {
      await dispatch(deleteItem(item.id)).unwrap();
      navigate('/items');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
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
          <ItemForm mode="edit" initial={item} busy={busy} onSubmit={handleSave} onCancel={() => setEditing(false)} />
        </div>
      ) : (
        <ItemDetails
          item={item}
          busy={busy}
          message={message}
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
