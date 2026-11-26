import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="page">
      <h1>About this project</h1>
      <p>
        A small items app built to practice React Router: nested routes, dynamic URLs, search
        params, lazy loading and a simulated async API.
      </p>
      <h3>What it covers</h3>
      <ul>
        <li>Nested routes under a shared layout with an Outlet</li>
        <li>Filters, search, sorting and pagination synced to the URL</li>
        <li>Item details fetched by ID, with loading, error and missing states</li>
        <li>A dashboard with statistics calculated from API data</li>
        <li>Lazy-loaded pages with React.lazy and Suspense</li>
      </ul>
      <p>
        <Link to="/">← Back home</Link>
      </p>
    </section>
  );
}
