import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import ItemsLayout from './layouts/ItemsLayout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';

// Lazy-loaded pages: each becomes its own chunk, fetched on first visit.
const About = lazy(() => import('./pages/About'));
const ItemsPage = lazy(() => import('./pages/ItemsPage'));
const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Routing only.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />

        <Route path="items" element={<ItemsLayout />}>
          <Route index element={<ItemsPage />} />
          <Route path=":id" element={<ItemDetailsPage />} />
        </Route>

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
