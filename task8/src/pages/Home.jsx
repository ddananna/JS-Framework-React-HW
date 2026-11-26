import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="page home">
      <div>
        <h1>Items Manager</h1>
        <p className="muted">
          Browse, search and manage items. Data comes from a simulated async API.
        </p>
        <div className="link-row">
          <Link className="button primary" to="/items">
            Browse items
          </Link>
          <Link className="button" to="/dashboard">
            Dashboard
          </Link>
          <Link className="button" to="/about">
            About
          </Link>
        </div>
      </div>

      <svg viewBox="0 0 320 160" className="home-art" role="img" aria-label="Illustration of item cards">
        <rect x="10" y="20" width="90" height="120" rx="8" fill="#dbe4ff" />
        <rect x="115" y="20" width="90" height="120" rx="8" fill="#e6f7ec" />
        <rect x="220" y="20" width="90" height="120" rx="8" fill="#fff4e0" />
        <rect x="24" y="40" width="62" height="8" rx="4" fill="#3b5bdb" />
        <rect x="129" y="40" width="62" height="8" rx="4" fill="#1b6e3a" />
        <rect x="234" y="40" width="62" height="8" rx="4" fill="#8a5a00" />
        <rect x="24" y="60" width="40" height="30" rx="4" fill="#ffffff" />
        <rect x="129" y="60" width="40" height="30" rx="4" fill="#ffffff" />
        <rect x="234" y="60" width="40" height="30" rx="4" fill="#ffffff" />
      </svg>
    </section>
  );
}
