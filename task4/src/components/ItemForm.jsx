import { useState } from 'react';

const STATUSES = ['available', 'reserved', 'completed'];

const EMPTY_VALUES = {
  name: '',
  category: '',
  price: '',
  quantity: '',
  status: 'available',
  location: '',
  owner: '',
  tags: '',
  description: '',
  notes: '',
};

// Item -> form strings
function toFormValues(item) {
  return {
    name: item.name ?? '',
    category: item.category ?? '',
    price: String(item.price ?? ''),
    quantity: String(item.quantity ?? ''),
    status: item.status ?? 'available',
    location: item.location ?? '',
    owner: item.owner ?? '',
    tags: (item.tags ?? []).join(', '),
    description: item.description ?? '',
    notes: item.notes ?? '',
  };
}

// Form strings -> API payload
function toPayload(values) {
  return {
    name: values.name.trim(),
    category: values.category.trim(),
    price: Number(values.price),
    quantity: Number.parseInt(values.quantity, 10),
    status: values.status,
    location: values.location.trim(),
    owner: values.owner.trim(),
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    description: values.description.trim(),
    notes: values.notes.trim(),
  };
}

function validate(values) {
  if (!values.name.trim()) return 'Name is required.';
  const price = Number(values.price);
  if (values.price === '' || Number.isNaN(price) || price < 0) {
    return 'Price must be a number of 0 or more.';
  }
  const quantity = Number.parseInt(values.quantity, 10);
  if (values.quantity === '' || Number.isNaN(quantity) || quantity < 0) {
    return 'Quantity must be a whole number of 0 or more.';
  }
  return '';
}

export default function ItemForm({ mode, initial, busy, onSubmit, onCancel }) {
  // The parent gives this form a `key` per item/mode, so its state resets
  // by remounting. No effect is needed to sync values.
  const [values, setValues] = useState(() => (initial ? toFormValues(initial) : EMPTY_VALUES));
  const [error, setError] = useState('');

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    const problem = validate(values);
    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    try {
      await onSubmit(toPayload(values));
      // On success the parent unmounts this form, so nothing else runs here.
    } catch (err) {
      setError(err.message);
    }
  }

  const title = mode === 'create' ? 'New item' : 'Edit item';

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
      </header>

      <form className="item-form" onSubmit={handleSubmit} noValidate>
        <fieldset disabled={busy}>
          <div className="form-grid">
            <label>
              Name *
              <input value={values.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label>
              Category
              <input value={values.category} onChange={(e) => update('category', e.target.value)} />
            </label>
            <label>
              Price *
              <input
                inputMode="decimal"
                value={values.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </label>
            <label>
              Quantity *
              <input
                inputMode="numeric"
                value={values.quantity}
                onChange={(e) => update('quantity', e.target.value)}
              />
            </label>
            <label>
              Status
              <select value={values.status} onChange={(e) => update('status', e.target.value)}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <input value={values.location} onChange={(e) => update('location', e.target.value)} />
            </label>
            <label>
              Owner
              <input value={values.owner} onChange={(e) => update('owner', e.target.value)} />
            </label>
            <label>
              Tags (comma separated)
              <input value={values.tags} onChange={(e) => update('tags', e.target.value)} />
            </label>
          </div>
          <label className="full">
            Description
            <textarea
              rows={3}
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>
          <label className="full">
            Notes
            <textarea
              rows={2}
              value={values.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </label>

          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}

          <div className="button-row">
            <button type="submit" className="primary">
              {busy ? 'Saving…' : mode === 'create' ? 'Create item' : 'Save changes'}
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
