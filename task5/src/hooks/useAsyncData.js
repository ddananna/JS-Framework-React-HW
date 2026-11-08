import { useEffect, useState } from 'react';

// Runs `loader` whenever `deps` change. Each run gets an AbortSignal.
// Responses from older runs are ignored, so the view never shows stale data.
//
// keepData: keep the previous data visible while the next request is in flight.
// Use it for lists. Leave it false for detail pages, so an old item is never shown
// under a new URL.
export default function useAsyncData(loader, deps, { keepData = false } = {}) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    setState((prev) => ({
      status: 'loading',
      data: keepData ? prev.data : null,
      error: null,
    }));

    loader({ signal: controller.signal })
      .then((data) => {
        if (!ignore) setState({ status: 'success', data, error: null });
      })
      .catch((error) => {
        if (ignore || error.name === 'AbortError') return;
        setState({ status: 'error', data: null, error });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
    // `deps` comes from the caller; `reloadKey` forces a refetch on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  // Lets a page apply a result from a mutation without refetching.
  // Accepts a value or an updater function.
  const setData = (updater) =>
    setState((prev) => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater,
    }));

  return {
    ...state,
    reload: () => setReloadKey((key) => key + 1),
    setData,
  };
}
