import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password, confirm }) {
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (password !== confirm) return 'Passwords do not match.';
  return '';
}

export default function Signup() {
  const { user, loading, signup, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <section className="page">
        <p className="state loading">Checking session…</p>
      </section>
    );
  }

  if (user) return <Navigate to="/profile" replace />;

  async function run(action) {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const problem = validate({ email, password, confirm });
    if (problem) {
      setError(problem);
      return;
    }
    run(() => signup(email.trim(), password));
  }

  return (
    <section className="page">
      <div className="panel auth-card">
        <h1>Create account</h1>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </label>
          <p className="hint">At least 6 characters.</p>

          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={busy}
            />
          </label>

          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}

          <button className="primary wide" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="wide" type="button" onClick={() => run(loginWithGoogle)} disabled={busy}>
          Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
