import { CircleX, Lock, TrendingUp, X } from 'lucide-react';

export const getStatusBadgeStyles = (statusId: number): { border: string; text: string } => {
  switch (statusId) {
    case 2: // Locked
      return { border: 'border-red-700', text: 'text-red-700' };
    case 3: // Escalated
      return { border: 'border-orange-600', text: 'text-orange-600' };
    case 4: // Pending
      return { border: 'border-gray-500', text: 'text-gray-500' };
    default:
      return { border: 'border-gray-500', text: 'text-gray-500' };
  }
};

export const getStatusIcon = (statusId: number, withColor: boolean = false) => {
  const iconClass = withColor ? 'h-4 w-4' : 'h-4 w-4';
  switch (statusId) {
    case 1: // Blacklisted
      return <CircleX className={iconClass} />;
    case 2: // Locked
      return <Lock className={iconClass} />;
    case 3: // Escalated
      return <TrendingUp className={iconClass} />;
    default:
      return <X className={iconClass} />;
  }
};

export const getStatusIconColor = (statusId: number): string => {
  switch (statusId) {
    case 1: // Blacklisted
      return 'text-red-700';
    case 2: // Locked
      return 'text-red-900';
    case 3: // Escalated
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};
