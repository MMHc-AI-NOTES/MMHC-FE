import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigateLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

export const NavigateLink: React.FC<NavigateLinkProps> = ({ to, className, children }) => {
  return (
    <Link to={to} className={cn('text-primary text-sm hover:underline', className)}>
      {children}
    </Link>
  );
};
