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
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-primary text-lg font-semibold">SME Reviewers Count</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAutoRefreshToggle?.(!autoRefresh)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                autoRefresh
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoRefresh ? 'Auto-refresh every 10s is ON' : 'Auto-refresh is OFF'}
            >
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'}`} />
              {autoRefresh ? 'Live (10s)' : 'Paused'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">Timeframe</span>
          <Select value={timeframe} onValueChange={(val) => onTimeframeChange?.(val)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
