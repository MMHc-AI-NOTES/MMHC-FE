import { Navigate } from 'react-router-dom';
import { getLocalStorageItem } from '@/utils/storage';

const PublicGuard = ({ children }: { children: React.ReactNode }) => {
  const authToken = getLocalStorageItem('authentication_token');

  if (authToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicGuard;
