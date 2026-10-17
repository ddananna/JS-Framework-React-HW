export default function EmptyState({ onReset }) {
  return (
    <div className="state-box">
      <h3>Ничего не найдено</h3>
      <p>Попробуйте изменить запрос или сбросить фильтры.</p>
      <button className="btn" onClick={onReset}>
        Сбросить фильтры
      </button>
    </div>
  );
}
