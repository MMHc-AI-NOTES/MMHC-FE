import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewHistoryItem } from '@/types/blacklistedNotes';
import { Clock } from 'lucide-react';
import moment from 'moment';

interface ReviewHistoryCardProps {
  reviewHistory: ReviewHistoryItem[];
}

export const ReviewHistoryCard = ({ reviewHistory }: ReviewHistoryCardProps) => {
  if (!reviewHistory || reviewHistory.length === 0) {
    return (
      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Clock className="h-5 w-5" />
            Review History Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500">No review history available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusText = (item: ReviewHistoryItem): string => {
    if (item.type === 'AI Audit' && item.score !== undefined) {
      return `${item.result || 'Failed'} (Score: ${item.score})`;
    }
    if (item.type === 'Admin Review' && item.result) {
      return item.result;
    }
    if (item.type === 'Manager Escalation' && item.result) {
      return item.result;
    }
    if (item.type === 'Blacklisted' && item.notes) {
      return item.notes;
    }
    return '';
  };

  const getStatusColor = (item: ReviewHistoryItem): string => {
    const statusText = getStatusText(item).toLowerCase();
    if (statusText.includes('failed') || statusText.includes('rejected')) {
      return 'text-red-600';
    }
    if (statusText.includes('escalated')) {
      return 'text-orange-600';
    }
    if (item.type === 'Blacklisted') {
      return 'text-gray-900';
    }
    return 'text-gray-600';
  };

  const formatTitle = (item: ReviewHistoryItem): string => {
    if (item.type === 'AI Audit') {
      // Try to extract attempt number from the item or use index
      const attemptMatch = item.id?.match(/(\d+)/);
      const attemptNum = attemptMatch ? attemptMatch[1] : reviewHistory.filter(i => i.type === 'AI Audit').indexOf(item) + 1;
      return `AI Audit Attempt ${attemptNum}`;
    }
    return item.type;
  };

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Clock className="h-5 w-5" />
          Review History Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-8">
          {/* Vertical connecting line */}
          {reviewHistory.length > 1 && <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-gray-200" />}

          <div className="space-y-4">
            {reviewHistory.map((item, index) => {
              const statusText = getStatusText(item);
              const statusColor = getStatusColor(item);

              return (
                <div key={item.id || index} className="relative">
                  {/* Timeline dot - green circle */}
                  <div className="absolute top-1.5 -left-[19px]">
                    <div className="bg-gradient-light h-2 w-2 rounded-full shadow-sm ring-2 ring-gray-600" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    {/* Title */}
                    <p className="text-sm font-semibold text-gray-900">{formatTitle(item)}</p>

                    {/* Date and Time */}
                    <p className="text-xs text-gray-600">{moment(item.date).format('MMM D, YYYY – h:mm A')}</p>

                    {/* User/Reviewer */}
                    {item.user && <p className="text-xs text-gray-600">{item.user}</p>}

                    {/* Status/Result */}
                    {statusText && <p className={`text-xs font-medium ${statusColor}`}>{statusText}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
