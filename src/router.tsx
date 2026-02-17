import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppPage } from './pages/AppPage';
import { LoginPage } from './pages/LoginPage';
import { useDemoStore } from './state/store';

function ProtectedRoute() {
  const isAuthenticated = useDemoStore((state) => state.isAuthenticated);
  return isAuthenticated ? <AppPage /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const isAuthenticated = useDemoStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />;
}

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <PublicRoute /> },
    { path: '/app', element: <ProtectedRoute /> }
  ],
  {
    basename: import.meta.env.BASE_URL
  }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}


