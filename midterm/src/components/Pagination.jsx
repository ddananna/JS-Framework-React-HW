// Показывает кнопки страниц «окном» вокруг текущей: 1 … 4 5 [6] 7 8 … 10
function getPageNumbers(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap-' + p);
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Страницы">
      <button className="btn btn-ghost" disabled={page === 1} onClick={() => onChange(page - 1)}>
        ← Назад
      </button>

      {getPageNumbers(page, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="muted">
            …
          </span>
        ) : (
          <button
            key={item}
            className={item === page ? 'btn btn-page active' : 'btn btn-page'}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        className="btn btn-ghost"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Вперёд →
      </button>
    </nav>
  );
}
