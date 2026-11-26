import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePwaState } from '../pwa/usePwaState';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/items', label: 'Items' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
];

const activeClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const { online } = usePwaState();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      window.alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="navbar">
      <div className="nav-top">
        <span className="brand">Items</span>
        <div className="nav-top-actions">
          <span className={`status ${online ? 'online' : 'offline'}`} role="status">
            {online ? 'Online' : 'Offline'}
          </span>
          <button
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div id="site-menu" className={`nav-menu${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={activeClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-auth">
          {!loading &&
            (user ? (
              <>
                <NavLink to="/profile" className={activeClass}>
                  Profile
                </NavLink>
                <button className="link-button" onClick={handleLogout} disabled={busy}>
                  {busy ? 'Logging out…' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={activeClass}>
                  Login
                </NavLink>
                <NavLink to="/signup" className="pill">
                  Sign up
                </NavLink>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
