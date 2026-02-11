import { Navigate } from 'react-router-dom';
import { getLocalStorageItem } from '@/utils/storage';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const authToken = getLocalStorageItem('authentication_token');

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default AuthGuard;
