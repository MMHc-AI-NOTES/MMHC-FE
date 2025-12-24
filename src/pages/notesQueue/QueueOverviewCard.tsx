import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { QueueOverview } from '@/types/notes';

interface QueueOverviewCardProps {
  data?: QueueOverview | null;
  loading?: boolean;
}

export const QueueOverviewCard = ({ data, loading }: QueueOverviewCardProps) => {
  const stats = [
    { icon: FileText, label: 'Total Notes', value: data?.total_notes || 0, bgColor: 'bg-green-50', iconColor: 'text-primary' },
    { icon: CheckCircle, label: 'AI Passed', value: data?.ai_passed || 0, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { icon: XCircle, label: 'AI Failed', value: data?.ai_failed || 0, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
    {
      icon: Clock,
      label: 'Pending Human Review',
      value: data?.pending_human_review || 0,
      bgColor: 'bg-green-50',
      iconColor: 'text-primary',
    },
    {
      icon: TrendingUp,
      label: 'Pending Manager Review',
      value: data?.pending_manager_review || 0,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    { icon: AlertTriangle, label: 'Blacklisted', value: data?.blacklist || 0, bgColor: 'bg-red-50', iconColor: 'text-red-600' },
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="space-y-5">
          {Array.from({ length: 6 }, (_, i) => (
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
      <h3 className="text-primary text-lg font-semibold">Queue Overview</h3>
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
