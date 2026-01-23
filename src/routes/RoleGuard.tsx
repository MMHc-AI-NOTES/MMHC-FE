import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/store';
import { routeAccess } from '@/components/layout/sidebar/navItems';

const RoleGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const userRole = useAppSelector(state => state.auth.user?.type);

  // Extract base path (e.g., '/notes-queue' from '/notes-queue/single-note-audit/123')
  const pathname = location.pathname;
  const basePath = pathname.split('/').slice(0, 2).join('/') || '/dashboard';

  // Check if route requires specific role access
  const allowedRoles = routeAccess[basePath];

  // If route is not in routeAccess, allow all authenticated users (for nested routes like single-note-audit)
  if (!allowedRoles) {
    // Check parent routes (e.g., for '/notes-queue/single-note-audit/:id', check '/notes-queue')
    const parentPath = '/' + pathname.split('/')[1];
    const parentAllowedRoles = routeAccess[parentPath];

    if (parentAllowedRoles) {
      if (!userRole || !parentAllowedRoles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
      }
    }

    return <>{children}</>;
  }

  // If user has no role or role is not allowed, redirect to dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
