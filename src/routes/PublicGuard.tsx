import { Navigate, useLocation } from 'react-router-dom';
import { getLocalStorageItem } from '@/utils/storage';

const PublicGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const authToken = getLocalStorageItem('authentication_token');

  // Allow invited-user onboarding page to be accessible even after we store token in localStorage
  if (authToken && location.pathname !== '/create-invited-user') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicGuard;
