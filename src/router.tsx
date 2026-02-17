import { useEffect } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppPage } from './pages/AppPage';
import { LoginPage } from './pages/LoginPage';
import { useAppStore } from './state/store';

function ProtectedRoute() {
  const isAuthReady = useAppStore((state) => state.isAuthReady);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const initializeAuth = useAppStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (!isAuthReady) {
    return <main className="grid min-h-screen place-items-center text-slate-400">Loading Canvas...</main>;
  }

  return isAuthenticated ? <AppPage /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const isAuthReady = useAppStore((state) => state.isAuthReady);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const initializeAuth = useAppStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (!isAuthReady) {
    return <main className="grid min-h-screen place-items-center text-slate-400">Loading Canvas...</main>;
  }

  return isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />;
}

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <PublicRoute /> },
    { path: '/app', element: <ProtectedRoute /> }
  ],
  {
    basename: import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL
  }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
