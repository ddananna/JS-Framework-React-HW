import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link className="button primary" to="/">
        Go to Home
      </Link>
    </section>
  );
}
