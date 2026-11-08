import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/items', label: 'Items' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
  { to: '/login', label: 'Login' },
];

export default function NavBar() {
  return (
    <header className="navbar">
      <span className="brand">Items</span>
      <nav>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
