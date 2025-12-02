import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Workload } from '@/types/notes';

interface WorkloadCardProps {
  data: Workload;
  loading?: boolean;
}

export const WorkloadCard = ({ data, loading }: WorkloadCardProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
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
          <div className="text-xl font-bold">{data.notesAssignedToYou}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Avg Review Time</div>
          <div className="text-xl font-bold">{data.avgReviewTime}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Return Rate</div>
          <div className="text-xl font-bold">{data.returnRate}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">AI Disagreement Rate</div>
          <div className="text-xl font-bold">{data.aiDisagreementRate}</div>
        </div>
      </div>
    </Card>
  );
};
