import { useState, useEffect } from 'react';
import {
  fetchItems,
  fetchItemDetails,
  createItem,
  updateItem,
  deleteItem,
} from './api/fakeApi';
import ItemList from './components/ItemList';
import ItemDetails from './components/ItemDetails';
import ItemForm from './components/ItemForm';

// Strip a full item down to the fields shown in the list.
const toSummary = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  status: item.status,
  price: item.price,
});

export default function App() {
  // ----- list state -----
  const [items, setItems] = useState([]);
  const [listStatus, setListStatus] = useState('loading'); // loading | error | success
  const [listError, setListError] = useState('');
  const [listReloadKey, setListReloadKey] = useState(0);

  // ----- selection + details -----
  const [selectedId, setSelectedId] = useState(null);
  // Details are stored WITH the id they belong to, so a response for an old
  // selection can never be rendered under a new one.
  const [detailsState, setDetailsState] = useState({
    id: null,
    status: 'idle', // idle | loading | success | error
    item: null,
    error: '',
  });
  const [detailsRetryKey, setDetailsRetryKey] = useState(0);

  // ----- mutations -----
  const [mode, setMode] = useState(null); // null | 'create' | 'edit'
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { id, type, text }

  // Load the list. Cleanup marks the response as stale and aborts the request.
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    setListStatus('loading');
    fetchItems({ signal: controller.signal })
      .then((data) => {
        if (ignore) return;
        setItems(data);
        setListStatus('success');
        // If the selected item disappeared (e.g. after a reload), clear selection.
        setSelectedId((current) =>
          current !== null && !data.some((item) => item.id === current) ? null : current
        );
      })
      .catch((err) => {
        if (ignore || err.name === 'AbortError') return;
        setListError(err.message);
        setListStatus('error');
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [listReloadKey]);

  // Load details whenever the selection changes (or Retry is pressed).
  useEffect(() => {
    if (selectedId === null) return;

    let ignore = false;
    const controller = new AbortController();

    setDetailsState({ id: selectedId, status: 'loading', item: null, error: '' });

    fetchItemDetails(selectedId, { signal: controller.signal })
      .then((item) => {
        if (ignore) return;
        setDetailsState({ id: selectedId, status: 'success', item, error: '' });
      })
      .catch((err) => {
        if (ignore || err.name === 'AbortError') return;
        setDetailsState({ id: selectedId, status: 'error', item: null, error: err.message });
      });

    // Runs before the next effect and on unmount (including StrictMode's double run).
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [selectedId, detailsRetryKey]);

  // Derive what to show. If the stored details belong to a different id,
  // we are still loading the new one, so show loading instead of stale data.
  const detailsView =
    selectedId === null
      ? { status: 'idle', item: null, error: '' }
      : detailsState.id === selectedId
        ? detailsState
        : { status: 'loading', item: null, error: '' };

  // ----- handlers -----

  function handleSelect(id) {
    // Selection is locked while a save is in flight, so a response can never
    // land on a different item than the one the user acted on.
    if (busy || id === selectedId) return;
    setMode(null);
    setMessage(null);
    setSelectedId(id);
  }

  async function handleToggleStatus() {
    if (busy || detailsView.item === null) return;

    // Capture the target at the moment the action starts.
    const id = selectedId;
    const nextStatus = detailsView.item.status === 'completed' ? 'available' : 'completed';

    setBusy(true);
    setMessage(null);
    try {
      const updated = await updateItem(id, { status: nextStatus });
      // Update by id, never by "whatever is selected now".
      setItems((prev) => prev.map((item) => (item.id === id ? toSummary(updated) : item)));
      setDetailsState((prev) => (prev.id === id ? { ...prev, item: updated } : prev));
      setMessage({ id, type: 'success', text: `Status set to "${nextStatus}".` });
    } catch (err) {
      setMessage({ id, type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (busy || selectedId === null) return;
    if (!window.confirm('Remove this item? This cannot be undone.')) return;

    const id = selectedId;
    setBusy(true);
    setMessage(null);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedId(null);
    } catch (err) {
      setMessage({ id, type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  // Called by ItemForm. Throws on failure so the form can show the error.
  async function handleSave(values) {
    const isEdit = mode === 'edit';
    const id = selectedId; // captured at submit time

    setBusy(true);
    setMessage(null);
    try {
      if (isEdit) {
        const updated = await updateItem(id, values);
        setItems((prev) => prev.map((item) => (item.id === id ? toSummary(updated) : item)));
        setDetailsState((prev) => (prev.id === id ? { ...prev, item: updated } : prev));
        setMode(null);
        setMessage({ id, type: 'success', text: 'Changes saved.' });
      } else {
        const created = await createItem(values);
        setItems((prev) => [...prev, toSummary(created)]);
        setMode(null);
        setSelectedId(created.id);
        setMessage({ id: created.id, type: 'success', text: 'Item created.' });
      }
    } finally {
      setBusy(false);
    }
  }

  const showForm = mode !== null && (mode === 'create' || detailsView.item !== null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Items</h1>
        <p className="subtitle">Async data with useEffect, a fake API and localStorage.</p>
      </header>

      <main className="layout">
        <ItemList
          items={items}
          status={listStatus}
          error={listError}
          selectedId={selectedId}
          busy={busy}
          onSelect={handleSelect}
          onReload={() => setListReloadKey((key) => key + 1)}
          onCreate={() => {
            if (busy) return;
            setMessage(null);
            setMode('create');
          }}
        />

        <div className="right-pane">
          {showForm ? (
            <ItemForm
              key={`${mode}-${selectedId ?? 'new'}`}
              mode={mode}
              initial={mode === 'edit' ? detailsView.item : null}
              busy={busy}
              onSubmit={handleSave}
              onCancel={() => setMode(null)}
            />
          ) : (
            <ItemDetails
              selectedId={selectedId}
              status={detailsView.status}
              item={detailsView.item}
              error={detailsView.error}
              busy={busy}
              message={message && message.id === selectedId ? message : null}
              onRetry={() => setDetailsRetryKey((key) => key + 1)}
              onEdit={() => {
                setMessage(null);
                setMode('edit');
              }}
              onRemove={handleRemove}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </main>
    </div>
  );
}
