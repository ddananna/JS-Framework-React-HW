import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, loading, login, loginWithGoogle } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <section className="page">
        <p className="state loading">Checking session…</p>
      </section>
    );
  }

  // Once Firebase reports a user, send them back to where they came from.
  if (user) return <Navigate to={from} replace />;

  async function run(action) {
    setError('');
    setBusy(true);
    try {
      await action();
      // Success: the auth listener sets `user`, and the redirect above takes over.
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    run(() => login(email.trim(), password));
  }

  return (
    <section className="page">
      <div className="panel auth-card">
        <h1>Log in</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </label>

          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}

          <button className="primary wide" type="submit" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="wide" type="button" onClick={() => run(loginWithGoogle)} disabled={busy}>
          Continue with Google
        </button>

        <p className="auth-footer">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </section>
  );
}
