import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { applyUpdate } from '../pwa/registerSW';
import { usePwaState } from '../pwa/usePwaState';

export default function RootLayout() {
  const { online, dataFromCache, updateRegistration } = usePwaState();

  return (
    <>
      <NavBar />

      {updateRegistration && (
        <div className="notice update" role="status">
          <span>A new version is available.</span>
          <button className="primary" onClick={() => applyUpdate(updateRegistration)}>
            Update now
          </button>
        </div>
      )}

      {dataFromCache && (
        <div className="notice cached" role="status">
          {online
            ? 'Showing cached data. It may be out of date.'
            : 'You are offline. Showing cached data.'}
        </div>
      )}

      <Suspense fallback={<p className="page state loading">Loading page…</p>}>
        <Outlet />
      </Suspense>
    </>
  );
}
