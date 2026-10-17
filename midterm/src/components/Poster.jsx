// Постер-заглушка: цвет градиента зависит от id, на нём — инициалы фильма.
// Так не нужны внешние картинки, которые могут не загрузиться.
function getInitials(title) {
  return title
    .split(/\s+/)
    .filter((w) => /[A-Za-zА-Яа-я0-9]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Poster({ movie, large = false }) {
  const hue = (movie.id * 47) % 360;
  const style = {
    background: `linear-gradient(135deg, hsl(${hue} 65% 38%), hsl(${(hue + 50) % 360} 70% 22%))`,
  };
  return (
    <div className={large ? 'poster poster-large' : 'poster'} style={style} aria-hidden="true">
      <span>{getInitials(movie.title)}</span>
    </div>
  );
}
