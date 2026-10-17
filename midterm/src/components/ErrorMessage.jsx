export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-box state-error" role="alert">
      <h3>Что-то пошло не так</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
