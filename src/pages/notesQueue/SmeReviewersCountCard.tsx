import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SmeReviewerCountItem } from '@/types/notes';

interface SmeReviewersCountCardProps {
  data?: SmeReviewerCountItem[] | null;
  loading?: boolean;
  timeframe?: string;
  onTimeframeChange?: (value: string) => void;
  autoRefresh?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
}

export const SmeReviewersCountCard = ({
  data,
  loading,
  timeframe = 'all_time',
  onTimeframeChange,
  autoRefresh = true,
  onAutoRefreshToggle,
}: SmeReviewersCountCardProps) => {
  const items = data ?? [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-primary text-base font-semibold whitespace-nowrap">SME Reviewers Count</h3>
          <button
            type="button"
            onClick={() => onAutoRefreshToggle?.(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
              autoRefresh
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={autoRefresh ? 'Auto-refresh every 10s is ON' : 'Auto-refresh is OFF'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
        </div>

        <Select value={timeframe} onValueChange={(val) => onTimeframeChange?.(val)}>
          <SelectTrigger className="h-7 w-28 text-xs font-medium">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-4 space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between border-b-2 pb-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
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
