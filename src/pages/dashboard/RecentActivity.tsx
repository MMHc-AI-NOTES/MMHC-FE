import { RecentActivity as RecentActivityType } from '@/types/dashboard';
import { AlertOctagon, CircleAlert, FileText, Zap } from 'lucide-react';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

interface ActivityItemProps {
  activity: RecentActivityType;
}

const ActivityIcon = ({ type }: { type: RecentActivityType['type'] }) => {
  const iconConfig = {
    critical: { Icon: AlertOctagon, classes: 'bg-red-50 text-red-600' },
    progress: { Icon: Zap, classes: 'bg-emerald-50 text-emerald-600' },
    info: { Icon: CircleAlert, classes: 'bg-amber-50 text-amber-600' },
    default: { Icon: FileText, classes: 'bg-gray-50 text-gray-600' },
  } as const;

  const { Icon, classes } = iconConfig[type] ?? iconConfig.default;

  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${classes}`} aria-label={`${type} activity`}>
      <Icon size={20} />
    </span>
  );
};

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const description = activity.description ? ` — ${activity.description}` : '';

  return (
    <div className="flex items-start gap-3 px-3 py-3">
      <ActivityIcon type={activity.type} />

      <div className="min-w-0 flex-1 space-y-2 font-light">
        <p className="truncate">{activity.title + description}</p>
        <p className="text-sm">{activity.timeAgo}</p>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }: RecentActivityProps) => {
  if (activities.length === 0) return <div className="px-4 py-8 text-center text-gray-500">No recent activity</div>;

  return (
    <div className="divide-y divide-gray-100">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default RecentActivity;
