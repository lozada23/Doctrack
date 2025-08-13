import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import MainRoutes from './MainRoutes';

import ProtectedRoute from '../components/ProtectedRoute'; // Ruta protegida (con token)

// Vistas públicas
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

// Vistas privadas
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));

// ✅ Rutas completas
export function createAppRouter() {
  return createBrowserRouter(
    [
      // Rutas públicas (Login/Register)
      {
        path: '/',
        element: <GuestLayout />,
        children: [
          // Alias para /login -> /auth/login (evita 404 o dobles /Doctrack/login)
          { path: 'login', element: <Navigate to="/auth/login" replace /> },
          { path: 'auth/login', element: <Login /> },
          { path: 'auth/register', element: <Register /> }
        ]
      },

      // Rutas privadas (requieren token)
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard/sales" replace /> },
              { path: 'dashboard/sales', element: <DashboardSales /> },

              // Otras rutas del sistema (clientes, casos, etc.)
              ...MainRoutes.children.find((r) => r.path === '/').children
            ]
          }
        ]
      }
    ],
    {
      // 👇 Importante para entornos con subcarpeta (como /Doctrack)
      basename: import.meta.env.VITE_APP_BASE_NAME
    }
  );
}

export default createAppRouter();
