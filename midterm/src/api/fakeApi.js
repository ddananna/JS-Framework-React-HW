// Симулированный API: Promise + задержки + JSON-данные + localStorage.
// Компоненты не знают, откуда берутся данные: они вызывают только функции отсюда.
import { SEED_MOVIES } from '../data/movies';

const STORAGE_KEY = 'movie-catalog-db-v1';

// ---------- работа с «базой данных» в localStorage ----------

function writeDb(movies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch {
    // localStorage может быть недоступен (приватный режим) — тогда просто работаем без сохранения
  }
}

function readDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // повреждённые данные — пересоздадим из seed
  }
  writeDb(SEED_MOVIES);
  return [...SEED_MOVIES];
}

// ---------- имитация сети ----------

// Возвращает Promise, который «отвечает» через случайное время (400–900 мс).
// Если передан signal и запрос отменён — Promise отклоняется с AbortError.
// Если simulateError = true — Promise отклоняется с ошибкой сервера.
function simulateNetwork({ signal, simulateError } = {}) {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      if (simulateError) {
        reject(new Error('Сервер недоступен (симуляция ошибки)'));
      } else {
        resolve();
      }
    }, 400 + Math.random() * 500);

    if (signal) {
      const onAbort = () => {
        clearTimeout(timerId);
        reject(new DOMException('Запрос отменён', 'AbortError'));
      };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort, { once: true });
      }
    }
  });
}

// ---------- публичные функции API ----------

const SORTERS = {
  'rating-desc': (a, b) => b.rating - a.rating,
  'rating-asc': (a, b) => a.rating - b.rating,
  'year-desc': (a, b) => b.year - a.year,
  'year-asc': (a, b) => a.year - b.year,
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  added: (a, b) => b.id - a.id,
};

// GET /movies?search=&genre=&sort=&page=&pageSize=
export async function fetchMovies(params, options) {
  const { search = '', genre = 'all', sort = 'rating-desc', page = 1, pageSize = 12 } = params;
  await simulateNetwork(options);

  const query = search.trim().toLowerCase();
  let result = readDb();

  if (query) {
    result = result.filter(
      (m) => m.title.toLowerCase().includes(query) || m.director.toLowerCase().includes(query)
    );
  }
  if (genre !== 'all') {
    result = result.filter((m) => m.genre === genre);
  }

  result = [...result].sort(SORTERS[sort] ?? SORTERS['rating-desc']);

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: result.slice(start, start + pageSize),
    total,
    totalPages,
  };
}

// GET /movies/:id
export async function fetchMovieById(id, options) {
  await simulateNetwork(options);
  const movie = readDb().find((m) => m.id === id);
  if (!movie) throw new Error('Фильм не найден');
  return movie;
}

// POST /movies
export async function addMovie(data, options) {
  await simulateNetwork(options);
  const db = readDb();
  const nextId = db.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const movie = {
    id: nextId,
    title: data.title.trim(),
    year: Number(data.year),
    genre: data.genre,
    director: data.director.trim(),
    rating: Number(data.rating),
    duration: Number(data.duration),
    description:
      data.description.trim() ||
      `«${data.title.trim()}» (${data.year}) — фильм в жанре ${data.genre}, режиссёр ${data.director.trim()}.`,
  };
  writeDb([...db, movie]);
  return movie;
}

// DELETE /movies/:id
export async function deleteMovie(id, options) {
  await simulateNetwork(options);
  writeDb(readDb().filter((m) => m.id !== id));
}

// Сброс «базы» к исходным 100+ записям (удобно для защиты)
export function resetDb() {
  writeDb(SEED_MOVIES);
}
