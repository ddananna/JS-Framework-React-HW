import Poster from './Poster';

// Карточка одного фильма. Получает данные через props и сообщает наверх о клике.
export default function MovieCard({ movie, onSelect }) {
  return (
    <article className="card">
      <button className="card-button" onClick={() => onSelect(movie.id)}>
        <Poster movie={movie} />
        <div className="card-body">
          <h3 title={movie.title}>{movie.title}</h3>
          <p className="muted">
            {movie.year} · {movie.genre}
          </p>
          <span className="rating">★ {movie.rating.toFixed(1)}</span>
        </div>
      </button>
    </article>
  );
}
