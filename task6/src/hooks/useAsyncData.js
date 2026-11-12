import { useEffect, useState } from 'react';

// Runs loader({ signal, force }) whenever `deps` change, and again on reload().
// Each run is tied to its own `ignore` flag: when deps change or the component unmounts,
// the previous run's response is discarded, so an older response never overwrites newer state.
//
// keepData: keep the previous data on screen while the next request is in flight (lists).
//           Leave it false for detail pages, so an old item never shows under a new URL.
export default function useAsyncData(loader, deps, { keepData = false } = {}) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [run, setRun] = useState({ key: 0, force: false });

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    setState((prev) => ({
      status: 'loading',
      data: keepData ? prev.data : null,
      error: null,
    }));

    loader({ signal: controller.signal, force: run.force })
      .then((data) => {
        if (!ignore) setState({ status: 'success', data, error: null });
      })
      .catch((error) => {
        if (!ignore && error.name !== 'AbortError') {
          setState({ status: 'error', data: null, error });
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
    // `deps` comes from the caller. `run.key` triggers reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, run.key]);

  return {
    ...state,
    // Reload skips the cache and fetches fresh data.
    reload: () => setRun((prev) => ({ key: prev.key + 1, force: true })),
    setData: (updater) =>
      setState((prev) => ({
        ...prev,
        data: typeof updater === 'function' ? updater(prev.data) : updater,
      })),
  };
}
