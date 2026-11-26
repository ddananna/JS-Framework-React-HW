import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// In-app offline page (route /offline). Service worker navigations that cannot be completed
// offline are answered with public/offline.html, which works without the app shell.
export default function Offline() {
  const navigate = useNavigate();

  useEffect(() => {
    const goHome = () => navigate('/', { replace: true });
    window.addEventListener('online', goHome);
    return () => window.removeEventListener('online', goHome);
  }, [navigate]);

  return (
    <section className="page">
      <div className="panel offline-card">
        <h1>You're offline</h1>
        <p className="muted">
          Pages you visited and items you loaded before are still available. Check your connection and try
          again.
        </p>
        <div className="button-row">
          <button className="primary" onClick={() => window.location.replace(import.meta.env.BASE_URL)}>
            Retry connection
          </button>
          <Link className="button" to="/items">
            Open cached items
          </Link>
        </div>
      </div>
    </section>
  );
}
