import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function RootLayout() {
  return (
    <>
      <NavBar />
      <Suspense fallback={<p className="page state loading">Loading page…</p>}>
        <Outlet />
      </Suspense>
    </>
  );
}
