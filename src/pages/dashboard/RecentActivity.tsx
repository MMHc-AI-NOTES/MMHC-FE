import { RecentActivity as RecentActivityType } from '@/types/dashboard';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

interface ActivityItemProps {
  activity: RecentActivityType;
}

const ActivityIcon = ({ type }: { type: RecentActivityType['type'] }) => {
  const iconConfig = { critical: 'bg-red-500', progress: 'bg-green-500', info: 'bg-orange-500', default: 'bg-gray-500' } as const;

  return <div className={`mt-2 h-2 w-2 rounded-full ${iconConfig[type]}`} aria-label={`${type} activity`} />;
};

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const description = activity.description || 'This action was performed';

  return (
    <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50">
      <ActivityIcon type={activity.type} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="truncate text-sm font-medium text-gray-900">{activity.title}</span>
          <span className="hidden text-gray-400 sm:inline">—</span>
          <span className="truncate text-sm text-gray-600">{description}</span>
        </div>

        <p className="text-xs text-gray-500">{activity.timeAgo}</p>
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
