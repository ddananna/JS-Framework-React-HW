import { useEffect, useState } from 'react';
import { fetchMovieById, deleteMovie } from '../api/fakeApi';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Poster from './Poster';

// Детальная страница фильма. Сама загружает данные по id.
// В App используется <MovieDetail key={id} ... />: при смене id React
// создаёт компонент заново, и старое состояние (старый фильм) сбрасывается.
export default function MovieDetail({ id, simulateError, onBack, onDeleted }) {
  const [state, setState] = useState({ status: 'loading', movie: null, error: null });
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', movie: null, error: null });

    fetchMovieById(id, { signal: controller.signal, simulateError })
      .then((movie) => setState({ status: 'success', movie, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return; // это наша же отмена — не ошибка
        setState({ status: 'error', movie: null, error: err.message });
      });

    // cleanup: отменяем запрос, если компонент закрыли или id/зависимости изменились
    return () => controller.abort();
  }, [id, simulateError, reloadKey]);

  async function handleDelete() {
    if (!window.confirm('Удалить этот фильм из каталога?')) return;
    setDeleting(true);
    try {
      await deleteMovie(id, { simulateError });
      onDeleted();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
      setDeleting(false);
    }
  }

  const { status, movie, error } = state;

  return (
    <section className="detail">
      <button className="btn btn-ghost" onClick={onBack}>
        ← Назад к списку
      </button>

      {status === 'loading' && <Loader text="Загружаем фильм..." />}

      {status === 'error' && (
        <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      )}

      {status === 'success' && (
        <div className="detail-content">
          <Poster movie={movie} large />
          <div className="detail-info">
            <h2>{movie.title}</h2>
            <p className="muted">
              {movie.year} · {movie.genre} · {movie.duration} мин
            </p>
            <p className="rating rating-big">★ {movie.rating.toFixed(1)}</p>
            <dl>
              <dt>Режиссёр</dt>
              <dd>{movie.director}</dd>
              <dt>Описание</dt>
              <dd>{movie.description}</dd>
            </dl>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Удаляем...' : 'Удалить фильм'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
