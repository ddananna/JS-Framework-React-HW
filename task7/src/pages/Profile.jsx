import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Protected by <RequireAuth> in App.jsx, so `user` is always set here.
export default function Profile() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const usesGoogle = user.providerData.some((info) => info.providerId === 'google.com');

  async function handleLogout() {
    setError('');
    setBusy(true);
    try {
      await logout();
      // The auth listener clears `user`, and RequireAuth redirects to /login.
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="page">
      <div className="panel auth-card">
        <h1>Profile</h1>

        <dl className="profile-grid">
          <dt>Email</dt>
          <dd>{user.email ?? <span className="muted">—</span>}</dd>

          <dt>UID</dt>
          <dd>
            <code>{user.uid}</code>
          </dd>

          <dt>Sign-in method</dt>
          <dd>{usesGoogle ? 'Google' : 'Email / Password'}</dd>
        </dl>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        <button className="danger wide" onClick={handleLogout} disabled={busy}>
          {busy ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </section>
  );
}
