import { GENRES } from '../data/movies';

const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'Рейтинг: по убыванию' },
  { value: 'rating-asc', label: 'Рейтинг: по возрастанию' },
  { value: 'year-desc', label: 'Год: сначала новые' },
  { value: 'year-asc', label: 'Год: сначала старые' },
  { value: 'title-asc', label: 'Название: А–Я' },
  { value: 'added', label: 'Недавно добавленные' },
];

export default function Filters({ genre, sort, onGenreChange, onSortChange, onReset }) {
  return (
    <div className="filters">
      <label>
        Жанр
        <select value={genre} onChange={(e) => onGenreChange(e.target.value)}>
          <option value="all">Все жанры</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>

      <label>
        Сортировка
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <button className="btn btn-ghost" onClick={onReset}>
        Сбросить
      </button>
    </div>
  );
}
