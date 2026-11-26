import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllItems } from '../features/items/itemsThunks';
import { selectCategories, selectDashboardStats } from '../features/items/itemsSelectors';

const STATUS_OPTIONS = ['available', 'reserved', 'completed'];

const money = (value) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.catalog);
  const categories = useSelector(selectCategories);

  // Filters are local UI state. They only change which items the statistics use.
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const stats = useSelector((state) => selectDashboardStats(state, category, statusFilter));

  // The thunk skips the request when the data is already loaded.
  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  if (catalog.status === 'failed') {
    return (
      <section className="page">
        <div className="state error" role="alert">
          <p>{catalog.error}</p>
          <button onClick={() => dispatch(fetchAllItems({ force: true }))}>Try again</button>
        </div>
      </section>
    );
  }

  if (catalog.status !== 'succeeded') {
    return (
      <section className="page">
        <p className="state loading">Loading dashboard…</p>
      </section>
    );
  }

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

      {stats.total === 0 ? (
        <p className="state empty">No items match this filter.</p>
      ) : (
        <>
          <div className="stats">
            <Stat label="Items" value={stats.total} />
            <Stat label="Total value" value={money(stats.totalValue)} />
            <Stat label="Average price" value={money(stats.averagePrice)} />
            <Stat label="Available" value={stats.available} />
            <Stat label="Completed" value={stats.completed} />
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>By category</h3>
              {stats.byCategory.map(([name, count]) => (
                <BarRow
                  key={name}
                  label={name}
                  count={count}
                  total={stats.total}
                  to={`/items?category=${encodeURIComponent(name)}`}
                />
              ))}
            </div>

            <div className="panel">
              <h3>By status</h3>
              {stats.byStatus.map(([name, count]) => (
                <BarRow
                  key={name}
                  label={name}
                  count={count}
                  total={stats.total}
                  to={`/items?status=${encodeURIComponent(name)}`}
                />
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Top 3 by total value</h3>
            <ol>
              {stats.topByValue.map((item) => (
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
