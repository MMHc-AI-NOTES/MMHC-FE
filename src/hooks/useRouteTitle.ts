import { navItems } from '@/components/layout/sidebar/navItems';
import { useLocation } from 'react-router-dom';

export function useRouteTitle() {
  const { pathname } = useLocation();
  const match = navItems.find((i: any) => i.path === pathname);
  return match?.name || '';
}
