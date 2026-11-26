export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </nav>
  );
}
