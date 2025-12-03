import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Workload } from '@/types/notes';

interface WorkloadCardProps {
  data?: Workload | null;
  loading?: boolean;
}

export const WorkloadCard = ({ data, loading }: WorkloadCardProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-primary text-lg font-semibold">Workload</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Notes Assigned to You</div>
          <div className="text-xl font-bold">{data?.assign_notes || 0}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Avg Review Time</div>
          <div className="text-xl font-bold">{data?.avg_review_time || '0 min'}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Return Rate</div>
          <div className="text-xl font-bold">{data?.return_rate || '0%'}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">AI Disagreement Rate</div>
          <div className="text-xl font-bold">{data?.ai_disagreement_rate || '0%'}</div>
        </div>
      </div>
    </Card>
  );
};
