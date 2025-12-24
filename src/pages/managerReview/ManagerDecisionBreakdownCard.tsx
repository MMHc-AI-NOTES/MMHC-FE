import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ManagerOverview } from './managerReviewTypes';

interface ManagerDecisionBreakdownCardProps {
  data?: ManagerOverview | null;
  loading?: boolean;
}

export const ManagerDecisionBreakdownCard = ({ data, loading }: ManagerDecisionBreakdownCardProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
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
      <h3 className="text-primary text-lg font-semibold">Decision Breakdown</h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Notes Assigned to You</div>

          <div className="text-xl font-bold">{data?.decisionBreakdown.approveWithEdits ?? '—'}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Return to Practitioner</div>
          <div className="text-xl font-bold">{data?.decisionBreakdown.returnToPractitioner ?? '—'}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground mb-1 text-sm">Escalate</div>
          <div className="text-xl font-bold">{data?.decisionBreakdown.escalate ?? '—'}</div>
        </div>
      </div>
    </Card>
  );
};
