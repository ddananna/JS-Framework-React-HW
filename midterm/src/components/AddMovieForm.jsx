import { useState } from 'react';
import { addMovie } from '../api/fakeApi';
import { GENRES } from '../data/movies';

const INITIAL_VALUES = {
  title: '',
  year: '',
  genre: GENRES[0],
  director: '',
  rating: '',
  duration: '',
  description: '',
};

function validate(values) {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (values.title.trim().length < 2) errors.title = 'Минимум 2 символа';
  if (!values.director.trim()) errors.director = 'Укажите режиссёра';

  const year = Number(values.year);
  if (!Number.isInteger(year) || year < 1888 || year > currentYear + 1) {
    errors.year = `Год от 1888 до ${currentYear + 1}`;
  }

  const rating = Number(values.rating);
  if (values.rating === '' || Number.isNaN(rating) || rating < 0 || rating > 10) {
    errors.rating = 'Рейтинг от 0 до 10';
  }

  const duration = Number(values.duration);
  if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
    errors.duration = 'Длительность от 1 до 600 мин';
  }

  return errors;
}

// Полностью управляемая форма: значение каждого поля хранится в state
// (values), а не в DOM. Состояние обновляется иммутабельно: {...prev, [name]: value}.
export default function AddMovieForm({ simulateError, onAdded, onCancel }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // как только пользователь правит поле — убираем его ошибку
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const movie = await addMovie(values, { simulateError });
      onAdded(movie);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>Добавить фильм</h2>

      <label>
        Название
        <input name="title" value={values.title} onChange={handleChange} />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <div className="form-row">
        <label>
          Год
          <input name="year" type="number" value={values.year} onChange={handleChange} />
          {errors.year && <span className="field-error">{errors.year}</span>}
        </label>

        <label>
          Жанр
          <select name="genre" value={values.genre} onChange={handleChange}>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Режиссёр
        <input name="director" value={values.director} onChange={handleChange} />
        {errors.director && <span className="field-error">{errors.director}</span>}
      </label>

      <div className="form-row">
        <label>
          Рейтинг (0–10)
          <input
            name="rating"
            type="number"
            step="0.1"
            value={values.rating}
            onChange={handleChange}
          />
          {errors.rating && <span className="field-error">{errors.rating}</span>}
        </label>

        <label>
          Длительность (мин)
          <input name="duration" type="number" value={values.duration} onChange={handleChange} />
          {errors.duration && <span className="field-error">{errors.duration}</span>}
        </label>
      </div>

      <label>
        Описание (необязательно)
        <textarea name="description" rows="3" value={values.description} onChange={handleChange} />
      </label>

      {submitError && <p className="field-error">{submitError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Сохраняем...' : 'Добавить'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Отмена
        </button>
      </div>
    </form>
  );
}
