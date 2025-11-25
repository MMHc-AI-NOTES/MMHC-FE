import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bot, User, FileText, Ban } from 'lucide-react';
import { RecentActivity as RecentActivityType } from '@/types/dashboard';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

const getActivityIcon = (type: RecentActivityType['type']) => {
  switch (type) {
    case 'failed_audit':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'ai_update':
      return <Bot className="h-4 w-4 text-blue-500" />;
    case 'practitioner_submission':
      return <User className="h-4 w-4 text-green-500" />;
    case 'report_generated':
      return <FileText className="h-4 w-4 text-purple-500" />;
    case 'blacklisted':
      return <Ban className="h-4 w-4 text-orange-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityVariant = (type: RecentActivityType['type']) => {
  switch (type) {
    case 'failed_audit':
      return 'destructive';
    case 'ai_update':
      return 'default';
    case 'practitioner_submission':
      return 'secondary';
    case 'report_generated':
      return 'outline';
    case 'blacklisted':
      return 'destructive';
    default:
      return 'outline';
  }
};

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
        >
          <div className="mt-0.5 flex-shrink-0">{getActivityIcon(activity.type)}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center space-x-2">
              <p className="truncate text-sm font-medium text-gray-900">{activity.title}</p>
              <Badge variant={getActivityVariant(activity.type)} className="text-xs">
                {activity.type.replace('_', ' ')}
              </Badge>
            </div>
            {activity.description && <p className="mb-1 text-sm text-gray-600">{activity.description}</p>}
            <p className="text-xs text-gray-500">{activity.timeAgo}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
