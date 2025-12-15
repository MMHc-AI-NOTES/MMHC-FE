import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import type { ManagerOverview } from './managerReviewTypes';

interface ManagerOverviewCardProps {
  data?: ManagerOverview | null;
  loading?: boolean;
}

export const ManagerOverviewCard = ({ data, loading }: ManagerOverviewCardProps) => {
  const stats = [
    {
      icon: Users,
      label: 'Total pending review',
      value: data?.totalPending || 0,
      bgColor: 'bg-green-50',
      iconColor: 'text-primary',
    },
    {
      icon: AlertTriangle,
      label: 'High AI/Human disagreement',
      value: data?.highDisagreements || 0,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: Clock,
      label: 'Avg. manager review time',
      value: data?.avgReviewTime || '0 min',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-800',
    },
    {
      icon: TrendingUp,
      label: 'AI agreement rate',
      value: data?.agreementRate || '0%',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-800',
    },
  ];
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="space-y-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between border-b-2 pb-5 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-primary text-lg font-semibold">Manager Overview</h3>
      <div className="space-y-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between border-b-2 pb-5 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-primary text-2xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
