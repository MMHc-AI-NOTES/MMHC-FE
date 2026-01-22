// @/pages/adminReviewQueue/QueueStatusCard.tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueueStatus } from '@/types/notes';

interface QueueStatusCardProps {
  data?: QueueStatus | null;
  loading?: boolean;
}

export const QueueStatusCard = ({ data, loading }: QueueStatusCardProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-primary mb-6 text-lg font-semibold">Queue Status</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">Pending</div>
          <div className="text-primary text-xl font-bold">{data?.pending || 0}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">In Progress</div>
          <div className="text-primary text-xl font-bold">{data?.in_progress || 0}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">Returned</div>
          <div className="text-primary text-xl font-bold">{data?.returned || 0}</div>
        </div>
      </div>
    </Card>
  );
};
