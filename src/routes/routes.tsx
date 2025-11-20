import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import PublicGuard from './PublicGuard';

const MainLayout = lazy(() => import('@/components/layout/MainLayout'));
const SimpleLayout = lazy(() => import('@/theme/simpleLayout/SimpleLayout'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

const Routes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'configuration/staff-types', element: <h1>Staff Types</h1> },
        { path: 'configuration/documents', element: <h1>Documents</h1> },
        { path: 'central-record', element: <h1>Central Record</h1> },
        { path: 'users', element: <h1>Users</h1> },
        { path: 'venues', element: <h1>Venues</h1> },
        { path: 'tasks', element: <h1>Tasks</h1> },
        { path: 'help', element: <h1>Help</h1> },
      ],
    },
    {
      path: '/',
      element: (
        <PublicGuard>
          <SimpleLayout />
        </PublicGuard>
      ),
      children: [
        { path: 'login', element: <Login /> },
        { path: 'signup', element: <Signup /> },
      ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ]);

  return routes;
};

export default Routes;
