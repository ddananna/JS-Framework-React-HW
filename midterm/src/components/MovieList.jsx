import MovieCard from './MovieCard';

// key={movie.id} — стабильный уникальный ключ (не индекс массива!).
// Благодаря ему React при смене страницы/сортировки понимает,
// какая карточка какому фильму соответствует, и не путает их состояние.
export default function MovieList({ movies, onSelect }) {
  return (
    <div className="grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
      ))}
    </div>
  );
}
