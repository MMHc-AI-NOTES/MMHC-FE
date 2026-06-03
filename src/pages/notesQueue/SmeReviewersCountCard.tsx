import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SmeReviewerCountItem } from '@/types/notes';

interface SmeReviewersCountCardProps {
  data?: SmeReviewerCountItem[] | null;
  loading?: boolean;
}

export const SmeReviewersCountCard = ({ data, loading }: SmeReviewersCountCardProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-6 w-44" />
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center justify-between border-b-2 pb-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const items = data ?? [];

  return (
    <Card className="p-6">
      <h3 className="text-primary text-lg font-semibold">SME Reviewers Count</h3>

      {items.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">No SME reviewer counts found.</p>
      ) : (
        <div className="mt-4 max-h-64 overflow-y-auto">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={`${item.reviewer_name}-${idx}`} className="flex items-center justify-between border-b-2 pb-4 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-primary truncate font-medium">{item.reviewer_name}</p>
                </div>
                <div className="text-muted-foreground font-semibold tabular-nums">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
