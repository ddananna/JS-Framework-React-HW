import { Link, Outlet } from 'react-router-dom';

// Shared wrapper for /items and /items/:id (nested route).
export default function ItemsLayout() {
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/items">Items</Link>
      </nav>
      <Outlet />
    </>
  );
}
