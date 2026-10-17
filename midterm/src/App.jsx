import { useEffect, useState } from 'react';
import { fetchMovies, resetDb } from './api/fakeApi';
import useDebounce from './hooks/useDebounce';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import MovieList from './components/MovieList';
import MovieDetail from './components/MovieDetail';
import AddMovieForm from './components/AddMovieForm';
import Pagination from './components/Pagination';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import EmptyState from './components/EmptyState';

const PAGE_SIZE = 12;

export default function App() {
  // ----- состояние фильтров (то, что пользователь выбирает) -----
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState('rating-desc');
  const [page, setPage] = useState(1);

  // ----- состояние интерфейса -----
  const [selectedId, setSelectedId] = useState(null); // null = показываем список
  const [showForm, setShowForm] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0); // меняем, чтобы принудительно перезагрузить список

  // ----- состояние данных, пришедших из API -----
  const [data, setData] = useState({
    status: 'loading', // 'loading' | 'success' | 'empty' | 'error'
    items: [],
    total: 0,
    totalPages: 1,
    error: null,
  });

  // Поиск «с задержкой»: запрос уходит, когда пользователь перестал печатать
  const debouncedSearch = useDebounce(search, 400);

  // Загрузка списка. Эффект перезапускается при изменении любого параметра из массива зависимостей.
  useEffect(() => {
    const controller = new AbortController();
    setData((prev) => ({ ...prev, status: 'loading', error: null }));

    fetchMovies(
      { search: debouncedSearch, genre, sort, page, pageSize: PAGE_SIZE },
      { signal: controller.signal, simulateError }
    )
      .then((res) => {
        setData({
          status: res.total === 0 ? 'empty' : 'success',
          items: res.items,
          total: res.total,
          totalPages: res.totalPages,
          error: null,
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // отменённый запрос — не ошибка
        setData((prev) => ({ ...prev, status: 'error', error: err.message }));
      });

    // cleanup: перед следующим запуском эффекта отменяем предыдущий запрос.
    // Так «старый» медленный ответ не перезапишет «новый» (защита от race condition).
    return () => controller.abort();
  }, [debouncedSearch, genre, sort, page, reloadKey, simulateError]);

  // Уведомление исчезает само через 3 секунды
  useEffect(() => {
    if (!notice) return;
    const timerId = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timerId);
  }, [notice]);

  // ----- обработчики событий -----
  // При смене поиска/фильтра/сортировки возвращаемся на 1 страницу.
  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }
  function handleGenreChange(value) {
    setGenre(value);
    setPage(1);
  }
  function handleSortChange(value) {
    setSort(value);
    setPage(1);
  }
  function handleResetFilters() {
    setSearch('');
    setGenre('all');
    setSort('rating-desc');
    setPage(1);
  }

  function handleAdded(movie) {
    setShowForm(false);
    setSort('added'); // показываем новый фильм первым
    setGenre('all');
    setSearch('');
    setPage(1);
    setReloadKey((k) => k + 1);
    setNotice(`Фильм «${movie.title}» добавлен!`);
  }

  function handleDeleted() {
    setSelectedId(null);
    setPage(1);
    setReloadKey((k) => k + 1);
    setNotice('Фильм удалён.');
  }

  function handleResetDb() {
    if (!window.confirm('Вернуть каталог к исходным данным? Добавленные фильмы пропадут.')) return;
    resetDb();
    handleResetFilters();
    setReloadKey((k) => k + 1);
    setNotice('Каталог сброшен к исходному состоянию.');
  }

  // ----- что показываем -----
  function renderList() {
    if (data.status === 'loading') return <Loader text="Загружаем фильмы..." />;
    if (data.status === 'error') {
      return <ErrorMessage message={data.error} onRetry={() => setReloadKey((k) => k + 1)} />;
    }
    if (data.status === 'empty') return <EmptyState onReset={handleResetFilters} />;

    return (
      <>
        <p className="muted results-count">Найдено фильмов: {data.total}</p>
        <MovieList movies={data.items} onSelect={setSelectedId} />
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      </>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          🎬 CineBase <span className="muted">каталог фильмов</span>
        </h1>
        <div className="header-actions">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
            />
            Симулировать ошибку API
          </label>
          <button className="btn btn-ghost" onClick={handleResetDb}>
            Сбросить данные
          </button>
          <button
            className="btn"
            onClick={() => {
              setSelectedId(null);
              setShowForm(true);
            }}
          >
            + Добавить фильм
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}

      <main className="main">
        {selectedId !== null ? (
          <MovieDetail
            key={selectedId}
            id={selectedId}
            simulateError={simulateError}
            onBack={() => setSelectedId(null)}
            onDeleted={handleDeleted}
          />
        ) : showForm ? (
          <AddMovieForm
            simulateError={simulateError}
            onAdded={handleAdded}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            <div className="toolbar">
              <SearchBar value={search} onChange={handleSearchChange} />
              <Filters
                genre={genre}
                sort={sort}
                onGenreChange={handleGenreChange}
                onSortChange={handleSortChange}
                onReset={handleResetFilters}
              />
            </div>
            {renderList()}
          </>
        )}
      </main>

      <footer className="footer muted">Midterm Project — React SPA · данные: симулированный API</footer>
    </div>
  );
}
