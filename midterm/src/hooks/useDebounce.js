import { useEffect, useState } from 'react';

// Возвращает value с задержкой: меняется только когда пользователь
// перестал печатать на `delay` мс. Так мы не шлём запрос на каждую букву.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delay);
    // cleanup: если value изменилось раньше, чем сработал таймер — отменяем его
    return () => clearTimeout(timerId);
  }, [value, delay]);

  return debounced;
}
