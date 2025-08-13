import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));
const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));
const Sample = lazy(() => import('../views/sample'));
const Clientes = lazy(() => import('../views/clientes'));
const Contratos = lazy(() => import('../views/clientes/contratos'));
const ListadoClientes = lazy(() => import('../views/clientes/ListadoClientes'));
const ListaCasos = lazy(() => import('../views/casos/ListaCasos'));
const Seguimiento = lazy(() => import('../views/casos/Seguimiento'));
const Casos = lazy(() => import('../views/casos'));
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

// 🔐 Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      ),
      children: [
        { path: '/dashboard/sales', element: <DashboardSales /> },
        { path: '/clientes/nuevo', element: <Clientes /> },
        { path: '/clientes/listado', element: <ListadoClientes /> },
        { path: '/clientes/contratos', element: <Contratos /> },
        { path: '/casos/nuevo', element: <Casos /> },
        { path: '/casos/listado', element: <ListaCasos /> },
        { path: '/casos/seguimiento', element: <Seguimiento /> },
        { path: '/typography', element: <Typography /> },
        { path: '/color', element: <Color /> },
        { path: '/icons/Feather', element: <FeatherIcon /> },
        { path: '/icons/font-awesome-5', element: <FontAwesome /> },
        { path: '/icons/material', element: <MaterialIcon /> },
        { path: '/sample-page', element: <Sample /> },
        { path: '*', element: <h1>404 - Página no encontrada</h1> }
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> }
      ]
    }
  ]
};

export default MainRoutes;
