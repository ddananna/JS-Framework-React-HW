import { useState } from 'react';
import { Link } from 'react-router-dom';

// Placeholder for future authentication. No credentials are sent anywhere.
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setNotice('Sign-in is not connected yet. This page is a placeholder.');
  }

  return (
    <section className="page login">
      <h1>Log in</h1>
      <div className="panel">
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className="primary" type="submit">
            Log in
          </button>
          {notice && <p className="muted">{notice}</p>}
        </form>
      </div>
      <p>
        <Link to="/">← Back home</Link>
      </p>
    </section>
  );
}
