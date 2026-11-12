import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item.id}`} className="card">
      <div className="card-top">
        <h3>{item.name}</h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="muted">
        {item.category} · {item.quantity} in stock
      </p>
      <p className="price">${Number(item.price).toFixed(2)}</p>
    </Link>
  );
}
