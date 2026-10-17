// Управляемый input: значение хранится в state родителя (App),
// компонент только показывает его и сообщает об изменениях через onChange.
export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <input
        type="search"
        placeholder="Поиск по названию или режиссёру..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Поиск фильмов"
      />
      {value && (
        <button className="btn btn-ghost" onClick={() => onChange('')} aria-label="Очистить поиск">
          ✕
        </button>
      )}
    </div>
  );
}
