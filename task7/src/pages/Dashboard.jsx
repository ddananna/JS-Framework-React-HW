import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAsyncData from '../hooks/useAsyncData';
import { fetchAllItems } from '../services/service';

const STATUS_OPTIONS = ['available', 'reserved', 'completed'];

const money = (value) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Count items by a key, most common first.
function countBy(items, key) {
  const counts = {};
  items.forEach((item) => {
    counts[item[key]] = (counts[item[key]] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BarRow({ label, count, total, to }) {
  return (
    <div className="bar-row">
      <Link to={to}>{label}</Link>
      <div className="bar">
        <span style={{ width: `${(count / total) * 100}%` }} />
      </div>
      <span>{count}</span>
    </div>
  );
}

export default function Dashboard() {
  const { status, data, error, reload } = useAsyncData(
    ({ force }) => fetchAllItems({ force }),
    []
  );

  // Interactive filters. They change which items the statistics are computed from.
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  if (status === 'loading') {
    return (
      <section className="page">
        <p className="state loading">Loading dashboard…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="page">
        <div className="state error" role="alert">
          <p>{error.message}</p>
          <button onClick={reload}>Try again</button>
        </div>
      </section>
    );
  }

  const categories = [...new Set(data.map((item) => item.category))].sort();
  const items = data.filter(
    (item) =>
      (!category || item.category === category) && (!statusFilter || item.status === statusFilter)
  );

  const total = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const averagePrice = total ? items.reduce((sum, item) => sum + item.price, 0) / total : 0;
  const available = items.filter((item) => item.status === 'available').length;
  const completed = items.filter((item) => item.status === 'completed').length;
  const topByValue = [...items]
    .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
    .slice(0, 3);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <Link to="/items">Browse items →</Link>
      </header>

      <div className="filters">
        <select aria-label="Category filter" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select aria-label="Status filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {(category || statusFilter) && (
          <button
            onClick={() => {
              setCategory('');
              setStatusFilter('');
            }}
          >
            Reset
          </button>
        )}
      </div>

      {total === 0 ? (
        <p className="state empty">No items match this filter.</p>
      ) : (
        <>
          <div className="stats">
            <Stat label="Items" value={total} />
            <Stat label="Total value" value={money(totalValue)} />
            <Stat label="Average price" value={money(averagePrice)} />
            <Stat label="Available" value={available} />
            <Stat label="Completed" value={completed} />
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>By category</h3>
              {countBy(items, 'category').map(([name, count]) => (
                <BarRow
                  key={name}
                  label={name}
                  count={count}
                  total={total}
                  to={`/items?category=${encodeURIComponent(name)}`}
                />
              ))}
            </div>

            <div className="panel">
              <h3>By status</h3>
              {countBy(items, 'status').map(([name, count]) => (
                <BarRow
                  key={name}
                  label={name}
                  count={count}
                  total={total}
                  to={`/items?status=${encodeURIComponent(name)}`}
                />
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Top 3 by total value</h3>
            <ol>
              {topByValue.map((item) => (
                <li key={item.id}>
                  <Link to={`/items/${item.id}`}>{item.name}</Link>{' '}
                  <span className="muted">{money(item.price * item.quantity)}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </section>
  );
}
